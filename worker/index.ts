import { WorkerMailer } from 'worker-mailer'

interface Env {
  DB: D1Database
  ASSETS: Fetcher
  ADMIN_EMAIL: string
  ADMIN_PASSWORD: string
  SESSION_SECRET: string
  MAIL_FROM: string
  RESORT_NAME: string
  CURRENCY?: string
  APP_URL?: string
  RESEND_API_KEY?: string
  SMTP_HOST?: string
  SMTP_PORT?: string
  SMTP_USER?: string
  SMTP_PASS?: string
}

const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } })
const fail = (msg: string, status = 400) => json({ error: msg }, status)

// ---------- session cookie: "<expiry>.<hmac>" ----------
const enc = new TextEncoder()
async function sign(secret: string, msg: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg))
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, (c) => ({ '+': '-', '/': '_', '=': '' })[c]!)
}
function same(a: string, b: string) {
  // constant-time compare (hash lengths are equal for real sigs; length leak is harmless)
  if (a.length !== b.length) return false
  let d = 0
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return d === 0
}
async function isAdmin(req: Request, env: Env) {
  if (!env.SESSION_SECRET) return false
  const m = /(?:^|;\s*)s=([^;]+)/.exec(req.headers.get('cookie') ?? '')
  if (!m) return false
  const [exp, sig] = m[1].split('.')
  if (!exp || !sig || Number(exp) < Date.now()) return false
  return same(sig, await sign(env.SESSION_SECRET, exp))
}

// ---------- dates (YYYY-MM-DD, check_out exclusive) ----------
const DATE = /^\d{4}-\d{2}-\d{2}$/
const validDate = (s: unknown): s is string => typeof s === 'string' && DATE.test(s) && !isNaN(Date.parse(s))
const nights = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5)
const pretty = (d: string) =>
  new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

// ---------- bookings ----------
type Row = { id: number; token: string; guest_name: string; email: string; phone: string; notes: string; check_in: string; check_out: string; guests: number; wk_nights: number; we_nights: number; paid: number; pay_method: string; reminded: number; status: string; created_at: string }

type Line = { id: number; name: string; rate: number; weekend_rate: number; basis: string; pax: number; extra_beds: number; extra_rate: number }
type Terms = { rate: number; weekend_rate: number; basis: string; pax: number; extra_beds: number; extra_rate: number }
/** One night's charge for a room line at a given room rate: the rate (or rate x guests for per-person rooms) plus extra mattresses. */
const nightCost = (l: Terms, rate: number) => (l.basis === 'person' ? rate * l.pax : rate) + l.extra_beds * l.extra_rate
/** A room line for the whole stay: weekday nights at the weekday rate, weekend nights at the weekend rate. */
const lineTotal = (l: Terms, wk: number, we: number) => nightCost(l, l.rate) * wk + nightCost(l, l.weekend_rate) * we

// A night counts by the day it starts (Friday night = Friday). Default weekend nights: Friday and Saturday.
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
async function weekendDays(env: Env): Promise<number[]> {
  try {
    const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'weekend_days'").first<{ value: string }>()
    if (row) return row.value.split(',').filter((x) => x !== '').map(Number).filter((x) => x >= 0 && x <= 6)
  } catch { /* settings table missing */ }
  return [5, 6]
}
function countNights(from: string, to: string, days: number[]) {
  let wk = 0, we = 0
  for (let t = Date.parse(from + 'T00:00:00Z'); t < Date.parse(to + 'T00:00:00Z'); t += 864e5) (days.includes(new Date(t).getUTCDay()) ? we++ : wk++)
  return { wk, we }
}

// ---------- audit log: append-only (the table refuses updates and deletes) ----------
type Change = { field: string; from?: unknown; to?: unknown }
async function audit(env: Env, a: { action: string; entity?: string; id?: number; summary: string; changes?: Change[]; actor?: string }) {
  try {
    await env.DB.prepare('INSERT INTO audit_log (actor, action, entity, entity_id, summary, detail) VALUES (?,?,?,?,?,?)')
      .bind(a.actor ?? env.ADMIN_EMAIL, a.action, a.entity ?? '', a.id ?? null, a.summary, a.changes?.length ? JSON.stringify(a.changes) : null).run()
  } catch (e) { console.error('audit failed', e) } // never block the real action
}
const changesOf = (pairs: [string, unknown, unknown][]): Change[] => pairs.filter(([, a, b]) => a !== b).map(([field, from, to]) => ({ field, from, to }))
const roomText = (name: string, pax: number, extra: number) => `${name}: ${pax} guest${pax === 1 ? '' : 's'}${extra ? `, ${extra} extra mattress${extra > 1 ? 'es' : ''}` : ''}`

async function withRooms(env: Env, rows: Row[]) {
  if (!rows.length) return []
  const ids = rows.map((r) => r.id)
  const { results } = await env.DB.prepare(
    `SELECT br.booking_id, r.id, r.name, br.rate, br.weekend_rate, br.basis, br.pax, br.extra_beds, br.extra_rate FROM booking_rooms br JOIN rooms r ON r.id = br.room_id WHERE br.booking_id IN (${ids.map(() => '?').join(',')}) ORDER BY r.id`,
  ).bind(...ids).all<Line & { booking_id: number }>()
  return rows.map((r) => {
    const rooms = results.filter((x) => x.booking_id === r.id).map(({ booking_id: _b, ...l }) => l)
    const n = nights(r.check_in, r.check_out)
    const wk = r.wk_nights + r.we_nights ? r.wk_nights : n, we = r.we_nights
    const total = rooms.reduce((t, x) => t + lineTotal(x, wk, we), 0)
    return { ...r, rooms, nights: n, total, balance: Math.max(0, total - r.paid), pay_status: total > 0 && r.paid >= total ? 'paid' : r.paid > 0 ? 'partial' : 'unpaid' }
  })
}

/** Rooms from `roomIds` already taken in [from,to). `ignore` is a booking id being edited. */
async function taken(env: Env, roomIds: number[], from: string, to: string, ignore = 0) {
  const { results } = await env.DB.prepare(
    `SELECT DISTINCT br.room_id FROM booking_rooms br JOIN bookings b ON b.id = br.booking_id
     WHERE b.status = 'confirmed' AND b.id != ?1 AND b.check_in < ?3 AND b.check_out > ?2
       AND br.room_id IN (${roomIds.map(() => '?').join(',')})`,
  ).bind(ignore, from, to, ...roomIds).all<{ room_id: number }>()
  return results.map((r) => r.room_id)
}

function parseBooking(b: any) {
  const name = String(b?.guest_name ?? '').trim()
  const email = String(b?.email ?? '').trim()
  // each room carries its own guests and extra mattresses; old clients may still send room_ids + guests
  const raw: any[] = Array.isArray(b?.rooms)
    ? b.rooms
    : Array.isArray(b?.room_ids) ? b.room_ids.map((id: unknown, i: number) => ({ id, pax: i === 0 ? b.guests ?? 1 : 1, extra_beds: 0 })) : []
  const seen = new Set<number>()
  const lines = raw.map((x) => ({ id: Number(x?.id), pax: Number(x?.pax ?? 1), extra: Number(x?.extra_beds ?? 0) })).filter((x) => Number.isInteger(x.id) && !seen.has(x.id) && seen.add(x.id))
  if (!name) return 'Guest name is required'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'A valid email is required'
  if (!validDate(b?.check_in) || !validDate(b?.check_out) || nights(b.check_in, b.check_out) < 1) return 'Check-out must be after check-in'
  if (!lines.length) return 'Pick at least one room'
  if (lines.some((l) => !Number.isInteger(l.pax) || l.pax < 1 || l.pax > 500)) return 'Each room needs at least 1 guest'
  if (lines.some((l) => !Number.isInteger(l.extra) || l.extra < 0 || l.extra > 20)) return 'Extra mattresses must be a whole number'
  const paid = Number(b?.paid ?? 0)
  if (!Number.isInteger(paid) || paid < 0) return 'Amount received must be a whole number, 0 or more'
  const method = String(b?.pay_method ?? '')
  return {
    lines, guests: lines.reduce((t, l) => t + l.pax, 0), paid, method: ['cash', 'upi', 'card', 'bank'].includes(method) ? method : '',
    name, email,
    phone: String(b.phone ?? '').trim().slice(0, 40),
    notes: String(b.notes ?? '').trim().slice(0, 1000),
    from: b.check_in as string, to: b.check_out as string,
  }
}

type RoomRow = { id: number; name: string; sleeps: number; price: number; weekend_price: number; pricing: string; extra_bed_price: number; max_extra_beds: number }

async function saveBooking(env: Env, id: number | null, raw: unknown) {
  const p = parseBooking(raw)
  if (typeof p === 'string') return { error: p, status: 400 }
  const roomIds = p.lines.map((l) => l.id)
  const { results: found } = await env.DB.prepare(`SELECT id, name, sleeps, price, weekend_price, pricing, extra_bed_price, max_extra_beds FROM rooms WHERE id IN (${roomIds.map(() => '?').join(',')})`).bind(...roomIds).all<RoomRow>()
  if (found.length !== roomIds.length) return { error: 'One of those rooms no longer exists', status: 400 }
  const byId = new Map(found.map((r) => [r.id, r]))
  for (const l of p.lines) {
    const r = byId.get(l.id)!
    if (l.extra > r.max_extra_beds) return { error: r.max_extra_beds ? `${r.name} takes at most ${r.max_extra_beds} extra mattress${r.max_extra_beds > 1 ? 'es' : ''}` : `${r.name} has no extra mattresses`, status: 400 }
    // more guests than the room sleeps is allowed (the app only warns): staff know when a family can squeeze in
  }
  // rooms that stay on an existing booking keep the price the guest was quoted; new rooms get today's price
  const old = new Map<number, { rate: number; weekend_rate: number; basis: string; extra_rate: number }>()
  if (id) {
    const { results: prev } = await env.DB.prepare('SELECT room_id, rate, weekend_rate, basis, extra_rate FROM booking_rooms WHERE booking_id=?').bind(id).all<{ room_id: number; rate: number; weekend_rate: number; basis: string; extra_rate: number }>()
    prev.forEach((x) => old.set(x.room_id, x))
  }
  const quote = (l: { id: number; pax: number; extra: number }) => {
    const r = byId.get(l.id)!, o = old.get(l.id)
    return { room: l.id, rate: o?.rate ?? r.price, weekend_rate: o?.weekend_rate ?? (r.weekend_price || r.price), basis: o?.basis ?? r.pricing, pax: l.pax, extra_beds: l.extra, extra_rate: o?.extra_rate ?? r.extra_bed_price }
  }
  const quoted = p.lines.map(quote)
  // a booking keeps its weekday/weekend split while its dates are unchanged, so changing the weekend days later never re-prices it
  const prevRow = id ? await env.DB.prepare('SELECT * FROM bookings WHERE id=?').bind(id).first<Row>() : null
  const { wk, we } = prevRow && prevRow.check_in === p.from && prevRow.check_out === p.to && prevRow.wk_nights + prevRow.we_nights > 0
    ? { wk: prevRow.wk_nights, we: prevRow.we_nights }
    : countNights(p.from, p.to, await weekendDays(env))
  const total = quoted.reduce((t, q) => t + lineTotal(q, wk, we), 0)
  if (p.paid > total) return { error: `Amount received (${money(env, p.paid)}) is more than the booking total (${money(env, total)})`, status: 400 }
  const clash = await taken(env, roomIds, p.from, p.to, id ?? 0)
  if (clash.length) return { error: 'Some rooms are already booked for those dates', clash, status: 409 }
  // ponytail: check-then-write is fine for one or two staff; use a trigger if many people book at once.
  const addLine = (bid: number | string) => quoted.map((q) =>
    env.DB.prepare('INSERT INTO booking_rooms (booking_id, room_id, rate, weekend_rate, basis, pax, extra_beds, extra_rate) VALUES (?,?,?,?,?,?,?,?)').bind(bid, q.room, q.rate, q.weekend_rate, q.basis, q.pax, q.extra_beds, q.extra_rate))
  const before = prevRow ? (await withRooms(env, [prevRow]))[0] : null
  const roomsAfter = p.lines.map((l) => roomText(byId.get(l.id)!.name, l.pax, l.extra)).sort().join('; ')
  if (id) {
    await env.DB.batch([
      env.DB.prepare('UPDATE bookings SET guest_name=?, email=?, phone=?, notes=?, check_in=?, check_out=?, guests=?, wk_nights=?, we_nights=?, paid=?, pay_method=? WHERE id=?').bind(p.name, p.email, p.phone, p.notes, p.from, p.to, p.guests, wk, we, p.paid, p.method, id),
      env.DB.prepare('DELETE FROM booking_rooms WHERE booking_id=?').bind(id),
      ...addLine(id),
    ])
    if (before) {
      const changes = changesOf([
        ['guest name', before.guest_name, p.name], ['email', before.email, p.email], ['phone', before.phone, p.phone], ['notes', before.notes, p.notes],
        ['check-in', before.check_in, p.from], ['check-out', before.check_out, p.to],
        ['rooms and guests', before.rooms.map((r) => roomText(r.name, r.pax, r.extra_beds)).sort().join('; '), roomsAfter],
        ['total', before.total, total], ['amount received', before.paid, p.paid], ['payment method', before.pay_method, p.method],
      ])
      const money = changes.every((c) => c.field === 'amount received' || c.field === 'payment method')
      if (changes.length) await audit(env, { action: money ? 'booking.payment' : 'booking.updated', entity: 'booking', id, summary: `${money ? 'Payment updated for' : 'Edited'} ${p.name}'s booking (${p.from} to ${p.to})`, changes })
    }
    return { id }
  }
  const token = crypto.randomUUID().replaceAll('-', '')
  const res = await env.DB.prepare(
    'INSERT INTO bookings (token, guest_name, email, phone, notes, check_in, check_out, guests, wk_nights, we_nights, paid, pay_method) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
  ).bind(token, p.name, p.email, p.phone, p.notes, p.from, p.to, p.guests, wk, we, p.paid, p.method).run()
  const newId = res.meta.last_row_id as number
  await env.DB.batch(addLine(newId))
  await audit(env, { action: 'booking.created', entity: 'booking', id: newId, summary: `Booked ${p.name}: ${byId.size} room${byId.size > 1 ? 's' : ''}, ${p.from} to ${p.to}`, changes: [{ field: 'rooms and guests', to: roomsAfter }, { field: 'total', to: total }, ...(p.paid ? [{ field: 'amount received', to: p.paid }] : [])] })
  return { id: newId, token }
}

// ---------- calendar file ----------
const icsText = (s: string) => s.replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n')
function makeIcs(b: Row & { rooms: { name: string }[] }, resort: string, host: string) {
  const day = (d: string) => d.replaceAll('-', '')
  const stamp = new Date().toISOString().replace(/[-:]|\.\d{3}/g, '')
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Resort Booking//EN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${b.token}@${host}`, `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${day(b.check_in)}`, `DTEND;VALUE=DATE:${day(b.check_out)}`,
    `SUMMARY:${icsText(`Stay at ${resort}`)}`,
    `DESCRIPTION:${icsText(`${b.rooms.map((r) => r.name).join(', ')}\nGuest: ${b.guest_name}`)}`,
    `LOCATION:${icsText(resort)}`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}

const money = (env: Env, n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: env.CURRENCY || 'INR', maximumFractionDigits: 0 }).format(n)

// booking total in SQL (nights x sum of the per-room rates quoted at booking time)
// one night's charge for a booking: per-room lines at their quoted rate (or rate x guests for per-person rooms), plus extra mattresses
const LINE_NIGHT = (rate: string) => `(CASE WHEN basis = 'person' THEN ${rate} * pax ELSE ${rate} END + extra_beds * extra_rate)`
const TOTAL_SQL = `(SELECT COALESCE(SUM(${LINE_NIGHT('rate')} * bookings.wk_nights + ${LINE_NIGHT('weekend_rate')} * bookings.we_nights), 0) FROM booking_rooms WHERE booking_id = bookings.id)`

async function calendarToken(env: Env, regenerate = false) {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'calendar_token'").first<{ value: string }>()
  if (row && !regenerate) return row.value
  const t = crypto.randomUUID().replaceAll('-', '')
  await env.DB.prepare("INSERT INTO settings (key, value) VALUES ('calendar_token', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(t).run()
  return t
}

// ---------- mail: Resend if RESEND_API_KEY, else SMTP if SMTP_HOST, else log ----------
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
async function sendMail(env: Env, m: { to: string; subject: string; text: string; html: string; ics: string }) {
  const b64 = btoa(String.fromCharCode(...enc.encode(m.ics)))
  if (env.RESEND_API_KEY) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: env.MAIL_FROM, to: [m.to], subject: m.subject, text: m.text, html: m.html, attachments: [{ filename: 'stay.ics', content: b64 }] }),
    })
    if (!r.ok) throw new Error(`Resend: ${(await r.text()).slice(0, 200)}`)
    return 'resend'
  }
  if (env.SMTP_HOST) {
    const port = Number(env.SMTP_PORT || 465)
    await WorkerMailer.send(
      { host: env.SMTP_HOST, port, secure: port === 465, startTls: port !== 465, credentials: { username: env.SMTP_USER ?? '', password: env.SMTP_PASS ?? '' }, authType: 'plain' },
      { from: env.MAIL_FROM, to: m.to, subject: m.subject, text: m.text, html: m.html, attachments: [{ filename: 'stay.ics', content: b64, mimeType: 'text/calendar' }] },
    )
    return 'smtp'
  }
  console.log('[mail not configured, would send]', m.to, m.subject, '\n' + m.text)
  return null
}

function emailFor(env: Env, b: Row & { rooms: { name: string }[]; total: number; balance: number }, link: string, kind: 'confirm' | 'reminder' = 'confirm') {
  const rooms = b.rooms.map((r) => r.name).join(', ')
  const n = nights(b.check_in, b.check_out)
  const first = b.guest_name.split(' ')[0]
  const pay = b.paid > 0 ? `Paid: ${money(env, b.paid)}${b.balance > 0 ? `  |  Balance due: ${money(env, b.balance)}` : '  (paid in full)'}` : `Total due: ${money(env, b.total)}`
  const heading = kind === 'reminder' ? `We look forward to seeing you tomorrow at ${env.RESORT_NAME}` : `Your stay at ${env.RESORT_NAME} is confirmed`
  const lines = `Arrive: ${pretty(b.check_in)}\nDepart: ${pretty(b.check_out)} (${n} night${n > 1 ? 's' : ''})\nGuests: ${b.guests}\nRooms: ${rooms}\n${pay}`
  const text = `Hello ${first},\n\n${heading}.\n\n${lines}\n${link ? `\nYour booking page: ${link}\n` : ''}${kind === 'confirm' ? 'The attached file adds the stay to your calendar.\n' : ''}`
  const html = `<div style="font-family:Georgia,serif;color:#0d2b33;max-width:480px"><h2 style="margin:0 0 12px">${esc(heading)}</h2><p>Hello ${esc(first)},</p><p><b>Arrive</b> ${pretty(b.check_in)}<br><b>Depart</b> ${pretty(b.check_out)} (${n} night${n > 1 ? 's' : ''})<br><b>Guests</b> ${b.guests}<br><b>Rooms</b> ${esc(rooms)}<br><b>${b.paid > 0 ? (b.balance > 0 ? `Paid ${money(env, b.paid)}, balance due ${money(env, b.balance)}` : `Paid in full ${money(env, b.paid)}`) : `Total ${money(env, b.total)}`}</b></p>${link ? `<p><a href="${link}">Open your booking page</a></p>` : ''}${kind === 'confirm' ? '<p style="color:#5b6b6f;font-size:13px">The attached file adds the stay to your calendar.</p>' : ''}</div>`
  return { subject: kind === 'reminder' ? `See you tomorrow at ${env.RESORT_NAME}` : `Booking confirmed: ${pretty(b.check_in)} to ${pretty(b.check_out)}`, text, html }
}

async function sendReminders(env: Env, actor = 'system') {
  // check-ins tomorrow (UTC date), not reminded yet. Runs from the daily cron.
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10)
  const { results } = await env.DB.prepare("SELECT * FROM bookings WHERE status = 'confirmed' AND check_in = ? AND reminded = 0").bind(tomorrow).all<Row>()
  let sent = 0
  for (const b of await withRooms(env, results)) {
    try {
      const via = await sendMail(env, { to: b.email, ...emailFor(env, b, env.APP_URL ? `${env.APP_URL.replace(/\/$/, '')}/b/${b.token}` : '', 'reminder'), ics: makeIcs(b, env.RESORT_NAME, 'resort') })
      if (via) { await env.DB.prepare('UPDATE bookings SET reminded = 1 WHERE id = ?').bind(b.id).run(); sent++ }
    } catch (e) { console.error('reminder failed', b.id, e) }
  }
  if (sent) await audit(env, { action: 'reminders.sent', actor, summary: `Sent ${sent} reminder email${sent > 1 ? 's' : ''} for check-ins on ${tomorrow}` })
  return { due: results.length, sent }
}

async function resortName(env: Env) {
  try {
    const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'resort_name'").first<{ value: string }>()
    return row?.value || env.RESORT_NAME
  } catch { return env.RESORT_NAME } // settings table not created yet
}

// ---------- router ----------
export default {
  async scheduled(_e: ScheduledController, rawEnv: Env, ctx: ExecutionContext) {
    ctx.waitUntil((async () => { console.log('reminders', await sendReminders({ ...rawEnv, RESORT_NAME: await resortName(rawEnv) })) })())
  },
  async fetch(req: Request, rawEnv: Env): Promise<Response> {
    const url = new URL(req.url)
    const path = url.pathname
    if (!path.startsWith('/api/')) return rawEnv.ASSETS.fetch(req)
    // the resort name is editable in Settings; fall back to the wrangler var
    const env: Env = { ...rawEnv, RESORT_NAME: await resortName(rawEnv) }

    try {
      // public: guest booking page + calendar file, addressed by unguessable token
      const pub = /^\/api\/public\/([a-f0-9]{32})(\.ics)?$/.exec(path)
      const feed = /^\/api\/calendar\/([a-f0-9]{32})\.ics$/.exec(path)
      if (feed && req.method === 'GET') {
        // private subscription URL for staff calendars (Google, Apple, Outlook)
        if (!same(feed[1], await calendarToken(env))) return fail('Not found', 404)
        const since = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10)
        const { results } = await env.DB.prepare("SELECT * FROM bookings WHERE status = 'confirmed' AND check_out >= ? ORDER BY check_in").bind(since).all<Row>()
        const day = (d: string) => d.replaceAll('-', '')
        const stamp = new Date().toISOString().replace(/[-:]|\.\d{3}/g, '')
        const events = (await withRooms(env, results)).flatMap((b) => [
          'BEGIN:VEVENT', `UID:${b.token}@${url.host}`, `DTSTAMP:${stamp}`,
          `DTSTART;VALUE=DATE:${day(b.check_in)}`, `DTEND;VALUE=DATE:${day(b.check_out)}`,
          `SUMMARY:${icsText(`${b.guest_name} (${b.guests}) - ${b.rooms.map((r) => r.name).join(', ')}`)}`,
          `DESCRIPTION:${icsText([b.phone && `Phone: ${b.phone}`, b.email, b.balance > 0 ? `Balance due: ${money(env, b.balance)}` : 'Paid in full', b.notes].filter(Boolean).join('\n'))}`,
          'END:VEVENT',
        ])
        return new Response(['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Resort Booking//Staff//EN', `X-WR-CALNAME:${icsText(env.RESORT_NAME + ' bookings')}`, 'REFRESH-INTERVAL;VALUE=DURATION:PT1H', ...events, 'END:VCALENDAR'].join('\r\n'), { headers: { 'content-type': 'text/calendar; charset=utf-8', 'cache-control': 'no-store' } })
      }

      if (pub && req.method === 'GET') {
        const row = await env.DB.prepare('SELECT * FROM bookings WHERE token=?').bind(pub[1]).first<Row>()
        if (!row) return fail('Not found', 404)
        const [b] = await withRooms(env, [row])
        if (pub[2]) {
          return new Response(makeIcs(b, env.RESORT_NAME, url.host), {
            headers: { 'content-type': 'text/calendar; charset=utf-8', 'content-disposition': 'attachment; filename="stay.ics"' },
          })
        }
        // do not expose phone/notes/email on the public page
        return json({ resort: env.RESORT_NAME, guest_name: b.guest_name, check_in: b.check_in, check_out: b.check_out, status: b.status, rooms: b.rooms.map((r) => ({ name: r.name })), nights: b.nights, total: b.total, wk_nights: b.wk_nights + b.we_nights ? b.wk_nights : b.nights, we_nights: b.we_nights, lines: b.rooms.map((l) => ({ name: l.name, basis: l.basis, rate: l.rate, weekend_rate: l.weekend_rate, pax: l.pax, extra_beds: l.extra_beds, extra_rate: l.extra_rate })), paid: b.paid, balance: b.balance, guests: b.guests, ref: b.token.slice(0, 8).toUpperCase(), currency: env.CURRENCY || 'INR' })
      }

      if (path === '/api/login' && req.method === 'POST') {
        // until all three secrets are set, nobody can sign in (an unset password must never match anything)
        if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD || !env.SESSION_SECRET) return fail('Sign-in is not set up yet. The site owner still needs to set ADMIN_EMAIL, ADMIN_PASSWORD and SESSION_SECRET.', 503)
        const b = (await req.json().catch(() => ({}))) as { email?: string; password?: string }
        // hash both sides so compare is constant-time regardless of length
        const [a1, a2] = await Promise.all([sign('x', `${b.email}|${b.password}`), sign('x', `${env.ADMIN_EMAIL}|${env.ADMIN_PASSWORD}`)])
        const ip = req.headers.get('cf-connecting-ip') ?? 'local'
        if (!b.email || !b.password || !same(a1, a2)) {
          await audit(env, { action: 'auth.login_failed', actor: String(b.email ?? 'unknown').slice(0, 80), summary: 'Failed sign-in attempt', changes: [{ field: 'from', to: ip }] })
          return fail('Wrong email or password', 401)
        }
        await audit(env, { action: 'auth.login', actor: b.email, summary: 'Signed in', changes: [{ field: 'from', to: ip }] })
        const exp = String(Date.now() + 7 * 864e5)
        const secure = url.protocol === 'https:' ? '; Secure' : ''
        return json({ ok: true }, 200, { 'set-cookie': `s=${exp}.${await sign(env.SESSION_SECRET, exp)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 86400}${secure}` })
      }
      if (path === '/api/logout' && req.method === 'POST') {
        if (await isAdmin(req, env)) await audit(env, { action: 'auth.logout', summary: 'Signed out' })
      }
      if (path === '/api/logout' && req.method === 'POST') return json({ ok: true }, 200, { 'set-cookie': 's=; HttpOnly; Path=/; Max-Age=0' })

      // everything below needs a session
      if (!(await isAdmin(req, env))) return fail('Sign in required', 401)
      if (path === '/api/settings' && req.method === 'PUT') {
        const b = (await req.json().catch(() => ({}))) as { resort?: string; weekend_days?: unknown }
        if (b.resort !== undefined) {
          const name = String(b.resort).trim().slice(0, 60)
          if (!name) return fail('Resort name cannot be empty')
          await env.DB.prepare("INSERT INTO settings (key, value) VALUES ('resort_name', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(name).run()
          if (name !== env.RESORT_NAME) await audit(env, { action: 'settings.renamed', entity: 'settings', summary: 'Changed the resort name', changes: [{ field: 'resort name', from: env.RESORT_NAME, to: name }] })
        }
        if (b.weekend_days !== undefined) {
          if (!Array.isArray(b.weekend_days) || b.weekend_days.some((x) => !Number.isInteger(x) || x < 0 || x > 6)) return fail('Weekend days must be days of the week')
          const days = [...new Set(b.weekend_days as number[])].sort((a, c) => a - c)
          const before = await weekendDays(env)
          await env.DB.prepare("INSERT INTO settings (key, value) VALUES ('weekend_days', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(days.join(',')).run()
          const label = (d: number[]) => (d.length ? d.map((x) => DAY_NAMES[x]).join(', ') : 'none')
          if (label(before) !== label(days)) await audit(env, { action: 'settings.weekend', entity: 'settings', summary: 'Changed which nights use the weekend price', changes: [{ field: 'weekend nights', from: label(before), to: label(days) }] })
        }
        return json({ resort: env.RESORT_NAME, weekend_days: await weekendDays(env) })
      }
      if (path === '/api/settings' && req.method === 'GET') {
        return json({ resort: env.RESORT_NAME, weekend_days: await weekendDays(env), calendar_url: `${url.origin}/api/calendar/${await calendarToken(env)}.ics` })
      }
      if (path === '/api/settings/calendar-token' && req.method === 'POST') {
        await audit(env, { action: 'settings.calendar_link', entity: 'settings', summary: 'Made a new staff calendar link (the old one stopped working)' })
        return json({ calendar_url: `${url.origin}/api/calendar/${await calendarToken(env, true)}.ics` })
      }
      if (path === '/api/reminders/run' && req.method === 'POST') return json(await sendReminders(env, env.ADMIN_EMAIL))

      if (path === '/api/today' && req.method === 'GET') {
        const d = validDate(url.searchParams.get('date')) ? url.searchParams.get('date')! : new Date().toISOString().slice(0, 10)
        const { results: rows } = await env.DB.prepare("SELECT * FROM bookings WHERE status = 'confirmed' AND check_in <= ?1 AND check_out >= ?1 ORDER BY check_in, id").bind(d).all<Row>()
        const all = await withRooms(env, rows)
        const tonight = all.filter((b) => b.check_in <= d && b.check_out > d)
        const busy = new Set(tonight.flatMap((b) => b.rooms.map((r) => r.id)))
        const { results: rooms } = await env.DB.prepare('SELECT id, name, kind, sleeps FROM rooms WHERE active = 1 ORDER BY kind, name').all<{ id: number; name: string; kind: string; sleeps: number }>()
        const first = new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 6, 1)).toISOString().slice(0, 7) + '-01'
        const { results: months } = await env.DB.prepare(
          `SELECT substr(check_in, 1, 7) AS month, SUM(${TOTAL_SQL}) AS revenue, SUM(paid) AS collected FROM bookings WHERE status = 'confirmed' AND check_in >= ? GROUP BY month ORDER BY month`,
        ).bind(first).all<{ month: string; revenue: number; collected: number }>()
        const due = await env.DB.prepare(`SELECT COUNT(*) AS n, COALESCE(SUM(${TOTAL_SQL} - paid), 0) AS amount FROM bookings WHERE status = 'confirmed' AND paid < ${TOTAL_SQL}`).first<{ n: number; amount: number }>()
        return json({
          date: d,
          arrivals: all.filter((b) => b.check_in === d),
          departures: all.filter((b) => b.check_out === d),
          inhouse: all.filter((b) => b.check_in < d && b.check_out > d),
          occupied: busy.size, totalRooms: rooms.length, guestsStaying: tonight.reduce((t, b) => t + b.guests, 0),
          free: rooms.filter((r) => !busy.has(r.id)),
          months: months.map((m) => ({ ...m, revenue: Math.round(m.revenue), collected: Math.round(m.collected) })),
          due: { count: due!.n, amount: Math.round(due!.amount) },
        })
      }
      if (path === '/api/me') return json({ ok: true, resort: env.RESORT_NAME, currency: env.CURRENCY || 'INR', weekend_days: await weekendDays(env) })

      if (path === '/api/rooms' && req.method === 'GET') {
        const { results } = await env.DB.prepare(
          `SELECT id, name, kind, sleeps, price, weekend_price, pricing, extra_bed_price, max_extra_beds, active FROM rooms ${url.searchParams.has('all') ? '' : 'WHERE active = 1'} ORDER BY kind, name`,
        ).all()
        return json(results)
      }
      const roomPath = /^\/api\/rooms(?:\/(\d+))?$/.exec(path)
      if (roomPath?.[1] && req.method === 'DELETE') {
        // a room that was ever booked stays (archive it): deleting would blank its name in history and break old totals
        const id = Number(roomPath[1])
        const room = await env.DB.prepare('SELECT name FROM rooms WHERE id = ?').bind(id).first<{ name: string }>()
        if (!room) return fail('Room not found', 404)
        const used = await env.DB.prepare('SELECT COUNT(*) AS n FROM booking_rooms WHERE room_id = ?').bind(id).first<{ n: number }>()
        if (used!.n) return json({ error: `${room.name} appears in ${used!.n} booking${used!.n > 1 ? 's' : ''} in your history, so it can only be archived. Archiving hides it but keeps that history.`, canArchive: true }, 409)
        await env.DB.prepare('DELETE FROM rooms WHERE id = ?').bind(id).run()
        await audit(env, { action: 'room.deleted', entity: 'room', id, summary: `Deleted room ${room.name}` })
        return json({ ok: true })
      }
      if (roomPath && (req.method === 'POST' || req.method === 'PUT')) {
        const b = (await req.json().catch(() => ({}))) as Record<string, unknown>
        const name = String(b.name ?? '').trim().slice(0, 60)
        const kind = String(b.kind ?? '').trim().slice(0, 40)
        const sleeps = Number(b.sleeps), price = Number(b.price)
        if (!name) return fail('Room name is required')
        if (!kind) return fail('Room type is required')
        if (!Number.isInteger(sleeps) || sleeps < 1 || sleeps > 50) return fail('Max guests must be a whole number from 1 to 50')
        if (!Number.isInteger(price) || price < 0) return fail('Price must be a whole number, 0 or more')
        const weekendPrice = Number(b.weekend_price ?? 0)
        if (!Number.isInteger(weekendPrice) || weekendPrice < 0) return fail('Weekend price must be a whole number, 0 or more (0 means the same as the normal price)')
        const pricing = b.pricing === 'person' ? 'person' : 'room'
        const extraPrice = Number(b.extra_bed_price ?? 0), maxExtra = Number(b.max_extra_beds ?? 0)
        if (!Number.isInteger(extraPrice) || extraPrice < 0) return fail('Extra mattress price must be a whole number, 0 or more')
        if (!Number.isInteger(maxExtra) || maxExtra < 0 || maxExtra > 10) return fail('Extra mattresses must be a whole number from 0 to 10')
        const id = roomPath[1] ? Number(roomPath[1]) : 0
        const dupe = await env.DB.prepare('SELECT 1 FROM rooms WHERE lower(name) = lower(?) AND active = 1 AND id != ?').bind(name, id).first()
        if (dupe) return fail(`A room called "${name}" already exists`, 409)
        if (req.method === 'POST') {
          const r = await env.DB.prepare('INSERT INTO rooms (name, kind, sleeps, price, weekend_price, pricing, extra_bed_price, max_extra_beds) VALUES (?,?,?,?,?,?,?,?)').bind(name, kind, sleeps, price, weekendPrice, pricing, extraPrice, maxExtra).run()
          await audit(env, { action: 'room.created', entity: 'room', id: r.meta.last_row_id as number, summary: `Added room ${name}`, changes: [{ field: 'type', to: kind }, { field: 'sleeps', to: sleeps }, { field: pricing === 'person' ? 'price per person' : 'price per night', to: price }, ...(maxExtra ? [{ field: 'extra mattress', to: `${extraPrice} a night, up to ${maxExtra}` }] : [])] })
          return json({ id: r.meta.last_row_id }, 201)
        }
        const active = b.active === false || b.active === 0 ? 0 : 1
        if (!active) {
          // never hide a room that still has guests coming
          const today = new Date().toISOString().slice(0, 10)
          const busy = await env.DB.prepare(
            "SELECT b.guest_name, b.check_in FROM booking_rooms br JOIN bookings b ON b.id = br.booking_id WHERE br.room_id = ? AND b.status = 'confirmed' AND b.check_out > ? ORDER BY b.check_in LIMIT 1",
          ).bind(id, today).first<{ guest_name: string; check_in: string }>()
          if (busy) return fail(`Cannot archive: ${busy.guest_name} is booked from ${busy.check_in}. Move or cancel that booking first.`, 409)
        }
        // price changes only affect new bookings: existing ones keep the rate they were quoted
        const prev = await env.DB.prepare('SELECT * FROM rooms WHERE id = ?').bind(id).first<{ name: string; kind: string; sleeps: number; price: number; weekend_price: number; pricing: string; extra_bed_price: number; max_extra_beds: number; active: number }>()
        if (!prev) return fail('Room not found', 404)
        await env.DB.prepare('UPDATE rooms SET name=?, kind=?, sleeps=?, price=?, weekend_price=?, pricing=?, extra_bed_price=?, max_extra_beds=?, active=? WHERE id=?').bind(name, kind, sleeps, price, weekendPrice, pricing, extraPrice, maxExtra, active, id).run()
        const changes = changesOf([['name', prev.name, name], ['type', prev.kind, kind], ['max guests', prev.sleeps, sleeps], ['price', prev.price, price], ['weekend price', prev.weekend_price, weekendPrice], ['charged', prev.pricing, pricing], ['extra mattress price', prev.extra_bed_price, extraPrice], ['most extra mattresses', prev.max_extra_beds, maxExtra]])
        if (changes.length) await audit(env, { action: 'room.updated', entity: 'room', id, summary: `Edited room ${name}`, changes })
        if (prev.active !== active) await audit(env, { action: active ? 'room.restored' : 'room.archived', entity: 'room', id, summary: `${active ? 'Restored' : 'Archived'} room ${name}` })
        return json({ id })
      }

      if (path === '/api/audit' && req.method === 'GET') {
        const g = (k: string) => url.searchParams.get(k) ?? ''
        const where: string[] = []
        const args: (string | number)[] = []
        const q = g('q').trim().replace(/[%_]/g, '')
        if (q) { where.push('(summary LIKE ? OR actor LIKE ? OR detail LIKE ?)'); args.push(`%${q}%`, `%${q}%`, `%${q}%`) }
        if (['booking', 'room', 'settings', 'auth', 'reminders'].includes(g('type'))) { where.push('action LIKE ?'); args.push(`${g('type')}.%`) }
        if (g('entity') && Number(g('id'))) { where.push('entity = ? AND entity_id = ?'); args.push(g('entity'), Number(g('id'))) }
        const W = where.length ? 'WHERE ' + where.join(' AND ') : ''
        const size = 30, page = Math.max(1, Number(g('page')) || 1)
        const [{ results }, n] = await Promise.all([
          env.DB.prepare(`SELECT * FROM audit_log ${W} ORDER BY id DESC LIMIT ${size} OFFSET ${(page - 1) * size}`).bind(...args).all<{ detail: string | null }>(),
          env.DB.prepare(`SELECT COUNT(*) AS n FROM audit_log ${W}`).bind(...args).first<{ n: number }>(),
        ])
        return json({ rows: results.map((r) => ({ ...r, detail: r.detail ? JSON.parse(r.detail) : [] })), count: n!.n, page, pages: Math.max(1, Math.ceil(n!.n / size)) })
      }

      if (path === '/api/history' && req.method === 'GET') {
        // every booking ever made (cancelled too). Filters: q, status, when (+today), sort, page.
        const g = (k: string) => url.searchParams.get(k) ?? ''
        const where: string[] = []
        const args: (string | number)[] = []
        const q = g('q').trim().replace(/[%_]/g, '')
        if (q) { where.push('(guest_name LIKE ? OR email LIKE ? OR phone LIKE ?)'); args.push(`%${q}%`, `%${q}%`, `%${q}%`) }
        if (g('status') === 'confirmed' || g('status') === 'cancelled') { where.push('status = ?'); args.push(g('status')) }
        // stays that overlap [from, to] (either end optional)
        if (validDate(g('from'))) { where.push('check_out > ?'); args.push(g('from')) }
        if (validDate(g('to'))) { where.push('check_in <= ?'); args.push(g('to')) }
        if (g('pay') === 'due') where.push(`status = 'confirmed' AND paid < ${TOTAL_SQL}`)
        else if (g('pay') === 'paid') where.push(`status = 'confirmed' AND paid >= ${TOTAL_SQL}`)
        const today = validDate(g('today')) ? g('today') : new Date().toISOString().slice(0, 10)
        const when = g('when')
        if (when === 'upcoming') { where.push('check_in > ?'); args.push(today) }
        else if (when === 'now') { where.push('check_in <= ? AND check_out > ?'); args.push(today, today) }
        else if (when === 'past') { where.push('check_out <= ?'); args.push(today) }
        const W = where.length ? 'WHERE ' + where.join(' AND ') : ''
        const order = ({ stay_asc: 'check_in ASC, id ASC', booked_desc: 'id DESC' } as Record<string, string>)[g('sort')] ?? 'check_in DESC, id DESC'
        const size = 25
        const page = Math.max(1, Number(g('page')) || 1)
        const [{ results }, agg] = await Promise.all([
          env.DB.prepare(`SELECT * FROM bookings ${W} ORDER BY ${order} LIMIT ${size} OFFSET ${(page - 1) * size}`).bind(...args).all<Row>(),
          env.DB.prepare(
            `SELECT COUNT(*) AS n, COALESCE(SUM(CASE WHEN status='confirmed' THEN ${TOTAL_SQL} END),0) AS revenue FROM bookings ${W}`,
          ).bind(...args).first<{ n: number; revenue: number }>(),
        ])
        return json({ rows: await withRooms(env, results), count: agg!.n, revenue: Math.round(agg!.revenue), page, pages: Math.max(1, Math.ceil(agg!.n / size)) })
      }

      if (path === '/api/bookings' && req.method === 'GET') {
        const from = url.searchParams.get('from'), to = url.searchParams.get('to')
        if (!validDate(from) || !validDate(to)) return fail('from and to required')
        const { results } = await env.DB.prepare(
          "SELECT * FROM bookings WHERE status='confirmed' AND check_in < ?2 AND check_out > ?1 ORDER BY check_in",
        ).bind(from, to).all<Row>()
        return json(await withRooms(env, results))
      }

      if (path === '/api/bookings' && req.method === 'POST') {
        const r = await saveBooking(env, null, await req.json().catch(() => null))
        return 'error' in r ? json(r, r.status) : json(r, 201)
      }

      const one = /^\/api\/bookings\/(\d+)(\/email)?$/.exec(path)
      if (one) {
        const id = Number(one[1])
        const row = await env.DB.prepare('SELECT * FROM bookings WHERE id=?').bind(id).first<Row>()
        if (!row) return fail('Not found', 404)

        if (one[2] && req.method === 'POST') {
          const [b] = await withRooms(env, [row])
          const link = `${url.origin}/b/${b.token}`
          const via = await sendMail(env, { to: b.email, ...emailFor(env, b, link), ics: makeIcs(b, env.RESORT_NAME, url.host) })
          await audit(env, { action: 'booking.emailed', entity: 'booking', id, summary: `Emailed ${b.guest_name}'s booking to ${b.email}`, changes: [{ field: 'delivery', to: via ? `sent by ${via}` : 'not sent (email is not set up)' }] })
          return json({ sent: !!via, via, link })
        }
        if (req.method === 'PUT') {
          const r = await saveBooking(env, id, await req.json().catch(() => null))
          return 'error' in r ? json(r, r.status) : json(r)
        }
        if (req.method === 'DELETE') {
          await env.DB.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").bind(id).run()
          if (row.status !== 'cancelled') await audit(env, { action: 'booking.cancelled', entity: 'booking', id, summary: `Cancelled ${row.guest_name}'s booking (${row.check_in} to ${row.check_out})` })
          return json({ ok: true })
        }
      }
      return fail('Not found', 404)
    } catch (e) {
      console.error(e)
      return fail(e instanceof Error ? e.message : 'Server error', 500)
    }
  },
}
