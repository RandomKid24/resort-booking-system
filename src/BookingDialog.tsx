import { useEffect, useMemo, useState } from 'react'
import { api, diff, fmt, money, parse, rangeText, ratesText, roomDayRates, stayTotal, symbol, ymd, type AuditPage, type Booking, type HistoryPage, type Room } from './api'
import { Entry } from './Activity'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar, type DateRange } from '@/components/ui/calendar'
import { Input, Textarea } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { CheckCircleIcon, CheckIcon, CopyIcon, MailIcon, PhoneIcon } from '@/components/ui/icons'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { CurrencyInput } from '@/components/ui/currency-input'
import { NumberStepper } from '@/components/ui/number-stepper'
import { Segmented } from '@/components/ui/segmented'
import { StatusDot } from '@/components/ui/status-dot'

export type Draft = Partial<Booking> & { check_in: string; check_out: string; room_ids: number[] }

const short: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }

function Section({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3">
      <h3 className="flex items-baseline gap-2 text-sm font-medium">
        <span className="font-display text-muted-foreground" data-tabular>{n}</span>{title}
        {hint && <span className="font-normal text-muted-foreground">{hint}</span>}
      </h3>
      {children}
    </section>
  )
}

const label = 'grid gap-1.5 text-sm'

export function BookingDialog({ draft, rooms, currency, onClose, onSaved }: { draft: Draft; rooms: Room[]; currency: string; onClose: () => void; onSaved: () => void }) {
  const fresh = () => ({ from: parse(draft.check_in), to: parse(draft.check_out) })
  const [saved, setSaved] = useState<{ id: number; token: string } | null>(draft.id ? { id: draft.id, token: draft.token! } : null)
  const [done, setDone] = useState(false)
  const [range, setRange] = useState<DateRange>(fresh)
  const [roomIds, setRoomIds] = useState(draft.room_ids)
  // guests and extra mattresses are set per room; old bookings (before this existed) get their guests spread over the rooms
  const [pax, setPax] = useState<Record<number, number>>(() => {
    const m: Record<number, number> = {}
    let left = draft.guests ?? 1
    draft.room_ids.forEach((id, i) => {
      const saved = draft.rooms?.find((r) => r.id === id)?.pax
      const cap = rooms.find((r) => r.id === id)?.sleeps ?? 1
      m[id] = saved || (i === draft.room_ids.length - 1 ? Math.max(1, left) : Math.max(1, Math.min(cap, left - (draft.room_ids.length - 1 - i))))
      left -= m[id]
    })
    return m
  })
  const [extras, setExtras] = useState<Record<number, number>>(() => Object.fromEntries((draft.rooms ?? []).map((r) => [r.id, r.extra_beds])))
  const [paid, setPaid] = useState<number>(draft.paid ?? 0)
  const [method, setMethod] = useState(draft.pay_method ?? '')
  const [askCancel, setAskCancel] = useState(false)
  const [f, setF] = useState({ guest_name: draft.guest_name ?? '', email: draft.email ?? '', phone: draft.phone ?? '', notes: draft.notes ?? '' })
  const [busy, setBusy] = useState<Map<number, string>>(new Map())
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [mailing, setMailing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sugs, setSugs] = useState<Booking[]>([])
  const [typing, setTyping] = useState(false)
  const [log, setLog] = useState<AuditPage | null>(null)
  useEffect(() => { if (draft.id) api<AuditPage>(`/api/audit?entity=booking&id=${draft.id}`).then(setLog).catch(() => {}) }, [draft.id])

  const from = range.from && ymd(range.from)
  const to = range.to && ymd(range.to)
  const n = from && to ? diff(from, to) : 0
  // keep the rate already quoted for rooms on an existing booking; today's price for newly added ones
  const quoted = new Map((draft.rooms ?? []).map((r) => [r.id, r]))
  const chosen = roomIds.map((id) => rooms.find((r) => r.id === id)).filter((r): r is Room => !!r)
  const terms = (r: Room) => { const q = quoted.get(r.id); return { rate: q?.rate ?? r.price, day_rates: q?.day_rates ?? roomDayRates(r), basis: q?.basis ?? r.pricing, extra_rate: q?.extra_rate ?? r.extra_bed_price } }
  const lineOf = (r: Room) => ({ ...terms(r), pax: pax[r.id] ?? 1, extra_beds: extras[r.id] ?? 0 })
  const guests = chosen.reduce((t, r) => t + (pax[r.id] ?? 1), 0)
  const over = (r: Room) => (pax[r.id] ?? 1) > r.sleeps + (extras[r.id] ?? 0)
  const overCount = chosen.filter(over).length
  // every night is priced by the day it starts, using the prices this booking was quoted (or today's prices for new rooms)
  const total = from && to && n > 0 ? stayTotal(chosen.map(lineOf), from, to) : 0
  const balance = Math.max(0, total - paid)
  useEffect(() => { if (total > 0 && paid > total) setPaid(total) }, [total]) // eslint-disable-line react-hooks/exhaustive-deps
  const link = saved ? `${location.origin}/b/${saved.token}` : ''
  const kinds = useMemo(() => [...new Set(rooms.map((r) => r.kind))], [rooms])

  // which rooms are taken for the chosen dates, and by whom (this booking itself does not count)
  useEffect(() => {
    if (!from || !to || n < 1) return
    api<Booking[]>(`/api/bookings?from=${from}&to=${to}`).then((all) => {
      const m = new Map<number, string>()
      all.filter((b) => b.id !== draft.id).forEach((b) => b.rooms.forEach((r) => m.set(r.id, b.guest_name)))
      setBusy(m)
      setRoomIds((ids) => ids.filter((id) => !m.has(id)))
    }).catch(() => {})
  }, [from, to, n, draft.id])

  // returning guests: suggest from past bookings while typing a name on a new booking
  useEffect(() => {
    const q = f.guest_name.trim()
    if (draft.id || !typing || q.length < 2) { setSugs([]); return }
    const t = setTimeout(() => {
      api<HistoryPage>(`/api/history?${new URLSearchParams({ q, today: ymd(new Date()) })}`).then((r) => {
        const seen = new Set<string>()
        setSugs(r.rows.filter((b) => { const k = b.email.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true }).slice(0, 4))
      }).catch(() => {})
    }, 200)
    return () => clearTimeout(t)
  }, [f.guest_name, typing, draft.id])

  async function save(e?: React.FormEvent) {
    e?.preventDefault()
    if (!from || !to || n < 1) return setErr('Pick check-in and check-out dates on the calendar')
    setSaving(true); setErr('')
    try {
      const body = { ...f, check_in: from, check_out: to, rooms: chosen.map((r) => ({ id: r.id, pax: pax[r.id] ?? 1, extra_beds: extras[r.id] ?? 0 })), paid, pay_method: method }
      const r = saved
        ? await api(`/api/bookings/${saved.id}`, { method: 'PUT', json: body })
        : await api('/api/bookings', { method: 'POST', json: body })
      setSaved({ id: r.id, token: r.token ?? saved?.token })
      onSaved()
      if (draft.id) { toast.success('Booking updated'); onClose() } else setDone(true)
    } catch (x) { setErr((x as Error).message) } finally { setSaving(false) }
  }

  async function sendEmail() {
    if (!saved) return
    setMailing(true)
    try {
      const r = await api(`/api/bookings/${saved.id}/email`, { method: 'POST' })
      r.sent ? toast.success(`Email sent to ${f.email}`, `via ${r.via}`) : toast.info('Email is not set up yet', 'Add Resend or SMTP settings. The email was printed in the server log.')
    } catch (x) { toast.error('Email failed', (x as Error).message) } finally { setMailing(false) }
  }

  async function cancel() {
    if (!saved) return
    await api(`/api/bookings/${saved.id}`, { method: 'DELETE' }); toast.success('Booking cancelled'); onSaved(); onClose()
  }

  function another() {
    setSaved(null); setDone(false); setRange(fresh()); setRoomIds([]); setPax({}); setExtras({}); setPaid(0); setMethod('')
    setF({ guest_name: '', email: '', phone: '', notes: '' }); setErr('')
  }

  const wa = `https://wa.me/${f.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${f.guest_name}, your stay is booked (${from && fmt(from)} to ${to && fmt(to)}). Details and calendar file: ${link}`)}`
  const share = (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" loading={mailing} onClick={sendEmail}><MailIcon />Email with calendar file</Button>
      <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>{copied ? <CheckIcon /> : <CopyIcon />}{copied ? 'Copied' : 'Copy booking link'}</Button>
      {f.phone && <Button variant="outline" size="sm" asChild><a href={wa} target="_blank" rel="noreferrer"><PhoneIcon />WhatsApp</a></Button>}
    </div>
  )

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0 max-sm:inset-0 max-sm:left-0 max-sm:top-0 max-sm:h-dvh max-sm:max-h-none max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none">
        <DialogHeader className="gap-1 border-b px-5 pt-5 pb-4 pr-14">
          <DialogTitle className="font-display text-xl">{done ? 'Booking saved' : draft.id ? 'Booking' : 'New booking'}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {n > 0 ? (
                <>
                  <span>Check-in <b className="font-medium text-foreground">{fmt(from!, short)}</b></span>
                  <span aria-hidden>&rarr;</span>
                  <span>Check-out <b className="font-medium text-foreground">{fmt(to!, short)}</b></span>
                  <span data-tabular>&middot; {n} night{n > 1 ? 's' : ''}</span>
                </>
              ) : <span>Pick check-in, then check-out on the calendar.</span>}
            </div>
          </DialogDescription>
        </DialogHeader>

        {done && saved ? (
          <div className="grid flex-1 content-start gap-5 overflow-y-auto px-5 py-8 sm:px-10">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="mt-0.5 size-6 text-success" />
              <div>
                <p className="font-display text-xl font-semibold">{f.guest_name}</p>
                <p className="text-sm text-muted-foreground">{chosen.map((r) => r.name).join(', ')} &middot; {guests} guest{guests > 1 ? 's' : ''} &middot; <span data-tabular>{money(total, currency)}</span>{balance > 0 ? <> &middot; <span className="text-warning" data-tabular>{money(balance, currency)} due</span></> : ' · paid in full'}</p>
              </div>
            </div>
            <div className="grid gap-2 border-t pt-5">
              <p className="text-sm font-medium">Send the booking to {f.guest_name.split(' ')[0]}</p>
              {share}
              <p className="break-all text-xs text-muted-foreground">{link}</p>
            </div>
          </div>
        ) : (
          <form id="booking-form" onSubmit={save} noValidate className="grid flex-1 gap-x-10 gap-y-8 overflow-y-auto px-5 py-5 md:grid-cols-[19rem_1fr]">
            <div className="grid content-start gap-6">
              <Section n={1} title="Dates">
                <Calendar mode="range" selected={range} onSelect={setRange} weekStartsOn={1} defaultMonth={range.from} disabled={(d) => d < parse(ymd(new Date())) && !draft.id} />
              </Section>
              <Section n={2} title="Rooms" hint="free for these dates">
                <div className="grid gap-4">
                  {kinds.map((k) => {
                    const list = rooms.filter((r) => r.kind === k)
                    const free = list.filter((r) => !busy.has(r.id)).length
                    return (
                      <fieldset key={k} className="grid gap-0.5">
                        <legend className="mb-1 flex w-full items-baseline justify-between text-xs text-muted-foreground"><span>{k}</span><span data-tabular>{free} of {list.length} free</span></legend>
                        {list.map((r) => {
                          const who = busy.get(r.id)
                          return (
                            <label key={r.id} className={`flex items-center gap-2.5 rounded-md px-1.5 py-2 text-sm md:py-1.5 ${who ? 'text-muted-foreground' : 'cursor-pointer hover:bg-accent/60'}`}>
                              <input type="checkbox" className="size-5 accent-[var(--primary)] md:size-4" disabled={!!who} checked={roomIds.includes(r.id)}
                                onChange={(e) => setRoomIds(e.target.checked ? [...roomIds, r.id] : roomIds.filter((x) => x !== r.id))} />
                              <span className={who ? '' : 'font-medium'}>{r.name}</span>
                              <span className="text-xs text-muted-foreground" data-tabular>sleeps {r.sleeps}</span>
                              <span className="ml-auto text-xs" data-tabular>{who ? `with ${who.split(' ')[0]}` : <>{rangeText(terms(r).day_rates, currency)}<span className="text-muted-foreground">{terms(r).basis === 'person' ? ' per person' : ''}</span></>}</span>
                            </label>
                          )
                        })}
                      </fieldset>
                    )
                  })}
                </div>
              </Section>
            </div>

            <div className="grid content-start gap-8">
              <Section n={3} title="Guest">
                <div className="grid gap-3">
                  <label className={label}>Name
                    <Input value={f.guest_name} onChange={(e) => { setF({ ...f, guest_name: e.target.value }); setTyping(true) }} onBlur={() => setTimeout(() => setTyping(false), 150)} autoComplete="off" />
                    {!!sugs.length && (
                      <ul className="overflow-hidden rounded-md border" aria-label="Returning guests">
                        {sugs.map((g) => (
                          <li key={g.id} className="border-b last:border-b-0">
                            <button type="button" className="flex w-full items-baseline gap-2 px-3 py-2 text-left text-sm hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => { setF({ ...f, guest_name: g.guest_name, email: g.email, phone: g.phone }); setSugs([]); setTyping(false) }}>
                              <span className="font-medium">{g.guest_name}</span>
                              <span className="truncate text-xs text-muted-foreground">{g.email}</span>
                              <span className="ml-auto text-xs text-primary">Returning guest</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className={label}>Email<Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
                    <label className={label}>Phone<Input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="With country code" /></label>
                  </div>
                  <div className="grid gap-1.5 text-sm">
                    <span>Who stays where</span>
                    {!chosen.length ? <p className="text-xs text-muted-foreground">Pick rooms on the left, then say how many guests are in each.</p> : (
                      <ul className="border-y">
                        {chosen.map((r) => {
                          const t = terms(r)
                          return (
                            <li key={r.id} className="grid gap-2 border-t py-3 first:border-t-0">
                              <div>
                                <p className="font-medium">{r.name} <span className="text-xs font-normal text-muted-foreground" data-tabular>sleeps {r.sleeps + (extras[r.id] ?? 0)}</span></p>
                                <p className="text-xs text-muted-foreground" data-tabular>{ratesText(t.day_rates, t.basis, currency)}</p>
                                {over(r) && <p role="status" className="mt-0.5 text-xs text-warning">Over capacity: sleeps {r.sleeps + (extras[r.id] ?? 0)}, you have {pax[r.id]}. You can still save.</p>}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                                <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Guests</span><NumberStepper value={pax[r.id] ?? 1} onValueChange={(v) => setPax({ ...pax, [r.id]: v })} min={1} max={500} /></div>
                                {r.max_extra_beds > 0 && (
                                  <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Extra mattress{t.extra_rate ? ` ${money(t.extra_rate, currency)}` : ''}</span><NumberStepper value={extras[r.id] ?? 0} onValueChange={(v) => setExtras({ ...extras, [r.id]: v })} min={0} max={r.max_extra_beds} /></div>
                                )}
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                  <label className={label}>Notes<Textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Arrival time, requests" /></label>
                </div>
              </Section>

              <Section n={4} title="Payment" hint="optional">
                <div className="grid gap-3" aria-live="polite">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="w-44"><CurrencyInput value={paid || null} onValueChange={(v) => setPaid(Math.min(Math.round(v ?? 0), total || Infinity))} currency={symbol(currency)} aria-label="Amount received" /></div>
                    {[['25%', 0.25], ['50%', 0.5], ['Full', 1]].map(([l, p]) => (
                      <Button key={l as string} type="button" variant="outline" size="sm" disabled={!total} onClick={() => setPaid(Math.round(total * (p as number)))}>{l}</Button>
                    ))}
                  </div>
                  <Segmented value={method as 'cash'} onValueChange={setMethod} options={[{ value: 'cash', label: 'Cash' }, { value: 'upi', label: 'UPI' }, { value: 'card', label: 'Card' }, { value: 'bank', label: 'Bank' }]} className="w-fit" />
                  <p className="text-sm">
                    {total > 0 && paid >= total ? <StatusDot tone="success">Paid in full</StatusDot>
                      : <StatusDot tone={paid > 0 ? 'warning' : 'neutral'}>{paid > 0 ? 'Balance due' : 'Nothing received yet'} <b data-tabular>{money(balance, currency)}</b></StatusDot>}
                  </p>
                </div>
              </Section>

              {draft.id && (
                <Section n={5} title="Share">
                  {share}
                </Section>
              )}
              {draft.id && (
                <Section n={6} title="Activity on this booking" hint={log ? `${log.count}` : ''}>
                  {!log ? <p className="text-sm text-muted-foreground">Loading</p> : !log.rows.length ? <p className="text-sm text-muted-foreground">Nothing recorded for this booking yet.</p> : (
                    <ul className="border-b">{log.rows.map((r) => <Entry key={r.id} r={r} currency={currency} compact />)}</ul>
                  )}
                </Section>
              )}
            </div>
          </form>
        )}

        <div className="safe-b border-t bg-background px-5 pt-3">
          {err && <p role="alert" className="pb-2 text-sm text-destructive">{err}</p>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3">
            {!done && (
              <p className="mr-auto min-w-0 text-sm" aria-live="polite">
                <span className="text-muted-foreground">{chosen.length} room{chosen.length === 1 ? '' : 's'} &middot; {guests} guest{guests === 1 ? '' : 's'} &middot; {Math.max(n, 0)} night{n === 1 ? '' : 's'} &middot; </span>
                <b className="font-display text-lg font-semibold" data-tabular>{money(total, currency)}</b>
                {overCount > 0 && <span className="ml-3 text-xs text-warning">{overCount} room{overCount > 1 ? 's' : ''} over capacity</span>}
              </p>
            )}
            {done ? (
              <>
                <Button variant="ghost" className="mr-auto" onClick={another}>Add another booking</Button>
                <Button onClick={onClose}>Done</Button>
              </>
            ) : (
              <>
                {draft.id && <Button type="button" variant="ghost" className="text-destructive" onClick={() => setAskCancel(true)}>Cancel booking</Button>}
                <Button type="submit" form="booking-form" loading={saving}>{draft.id ? 'Save changes' : 'Save booking'}</Button>
              </>
            )}
          </div>
        </div>

        <AlertDialog open={askCancel} onOpenChange={setAskCancel} destructive title={`Cancel ${f.guest_name}'s booking?`} description="The rooms become free for those dates. The booking stays in History as cancelled." confirmLabel="Cancel booking" cancelLabel="Keep booking" onConfirm={cancel} />
      </DialogContent>
    </Dialog>
  )
}
