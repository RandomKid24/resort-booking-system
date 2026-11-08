export type Room = { id: number; name: string; kind: string; sleeps: number; price: number; pricing: 'room' | 'person'; extra_bed_price: number; max_extra_beds: number; active: number }
export type Line = { id: number; name: string; rate: number; basis: 'room' | 'person'; pax: number; extra_beds: number; extra_rate: number }
/** One night's charge for a room line: the room rate (or rate x guests for per-person rooms) plus extra mattresses. */
export const lineNight = (l: Pick<Line, 'rate' | 'basis' | 'pax' | 'extra_beds' | 'extra_rate'>) => (l.basis === 'person' ? l.rate * l.pax : l.rate) + l.extra_beds * l.extra_rate
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
