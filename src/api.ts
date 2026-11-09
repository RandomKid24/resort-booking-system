export type Room = { id: number; name: string; kind: string; sleeps: number; price: number; day_prices: Record<string, number>; pricing: 'room' | 'person'; extra_bed_price: number; max_extra_beds: number; active: number }
export type Line = { id: number; name: string; rate: number; day_rates: number[]; basis: 'room' | 'person'; pax: number; extra_beds: number; extra_rate: number }
/** One night's charge for a room line: the room rate (or rate x guests for per-person rooms) plus extra mattresses. */
export type Terms = Pick<Line, 'day_rates' | 'basis' | 'pax' | 'extra_beds' | 'extra_rate'>
/** One night's charge on a day of the week (0 = Sunday): that day's rate, times guests for per-person rooms, plus extra mattresses. */
export const nightOn = (l: Terms, dow: number) => (l.basis === 'person' ? l.day_rates[dow] * l.pax : l.day_rates[dow]) + l.extra_beds * l.extra_rate
/** The whole stay: each night is priced by the day it starts. Same rule as the server. */
export function stayTotal(lines: Terms[], from: string, to: string) {
  let t = 0
  for (let d = from; d < to; d = addDays(d, 1)) for (const l of lines) t += nightOn(l, parse(d).getDay())
  return t
}
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MON_FIRST = [1, 2, 3, 4, 5, 6, 0]
/** A room's rate for each day of the week (0 = Sunday): its price for that day, or the normal price. */
export const roomDayRates = (r: Pick<Room, 'price' | 'day_prices'>) => [0, 1, 2, 3, 4, 5, 6].map((d) => r.day_prices?.[String(d)] ?? r.price)
/** Days grouped by rate, Monday first: [{ rate: 4000, days: [1, 2] }, ...] */
export function groupRates(rates: number[]) {
  const groups: { rate: number; days: number[] }[] = []
  for (const d of MON_FIRST) {
    const g = groups.find((x) => x.rate === rates[d])
    g ? g.days.push(d) : groups.push({ rate: rates[d], days: [d] })
  }
  return groups
}
/** "₹4,500 a night", or "Mon, Tue ₹4,000 · Wed, Thu ₹3,000 · Fri, Sat, Sun ₹4,500" when the price changes by day. */
export function ratesText(rates: number[], basis: string, currency: string) {
  const g = groupRates(rates)
  const per = basis === 'person' ? ' per person' : ''
  if (g.length === 1) return `${money(g[0].rate, currency)}${per} a night`
  return g.map((x) => `${x.days.map((d) => DAY_SHORT[d]).join(', ')} ${money(x.rate, currency)}`).join(' · ') + (per ? ' (per person)' : '')
}
/** "₹3,000 to ₹4,500", or just one price when every day is the same. */
export function rangeText(rates: number[], currency: string) {
  const lo = Math.min(...rates), hi = Math.max(...rates)
  return lo === hi ? money(lo, currency) : `${money(lo, currency)} to ${money(hi, currency)}`
}
export type Booking = {
  id: number; token: string; guest_name: string; email: string; phone: string; notes: string
  check_in: string; check_out: string; guests: number; paid: number; balance: number; pay_method: string; pay_status?: 'paid' | 'partial' | 'unpaid'; status?: string; created_at?: string; rooms: Line[]; nights: number; total: number
}

export async function api<T = any>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: init?.json ? { 'content-type': 'application/json' } : undefined,
    body: init?.json ? JSON.stringify(init.json) : init?.body,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error ?? 'Something went wrong'), { status: res.status, data })
  return data
}

// local-time YYYY-MM-DD (never toISOString: it shifts the day in UTC+ zones)
export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const money = (n: number, cur = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n)
export type HistoryPage = { rows: Booking[]; count: number; revenue: number; page: number; pages: number }
export const symbol = (cur = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur }).formatToParts(0).find((p) => p.type === 'currency')?.value ?? cur
export type Today = {
  date: string; arrivals: Booking[]; departures: Booking[]; inhouse: Booking[]
  occupied: number; totalRooms: number; guestsStaying: number
  free: { id: number; name: string; kind: string; sleeps: number }[]
  months: { month: string; revenue: number; collected: number }[]
  due: { count: number; amount: number }
}
export type AuditRow = { id: number; at: string; actor: string; action: string; entity: string; entity_id: number | null; summary: string; detail: { field: string; from?: unknown; to?: unknown }[] }
export type AuditPage = { rows: AuditRow[]; count: number; page: number; pages: number }
export const addDays = (s: string, n: number) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d) }
export const diff = (a: string, b: string) => Math.round((parse(b).getTime() - parse(a).getTime()) / 864e5)
export const fmt = (s: string, o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) => parse(s).toLocaleDateString('en-GB', o)
