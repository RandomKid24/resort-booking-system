import { useEffect, useState } from 'react'
import { api, addDays, fmt, money, parse, ymd, type Booking, type Today as TodayData } from './api'
import { useShell } from './Board'
import { ProgressRing } from '@/components/ui/progress-ring'
import { BarChart } from '@/components/ui/charts'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusDot } from '@/components/ui/status-dot'
import { Badge } from '@/components/ui/badge'

const short: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }

export function Today({ currency }: { currency: string }) {
  const { open, version } = useShell()
  const today = ymd(new Date())
  const tomorrow = addDays(today, 1)
  const [d, setD] = useState<TodayData | null>(null)
  const [next, setNext] = useState<TodayData | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    api<TodayData>(`/api/today?date=${today}`).then((r) => { setD(r); setFailed(false) }).catch(() => setFailed(true))
    api<TodayData>(`/api/today?date=${tomorrow}`).then(setNext).catch(() => {})
  }, [today, tomorrow, version])

  if (failed) return <p role="alert" className="py-8 text-sm text-destructive">Could not load today. <button className="underline" onClick={() => location.reload()}>Try again</button></p>
  if (!d) return <TodaySkeleton />

  const pct = d.totalRooms ? Math.round((d.occupied / d.totalRooms) * 100) : 0
  const thisMonth = d.months.find((m) => m.month === today.slice(0, 7))
  const maxK = Math.max(...d.months.map((m) => m.revenue), 1)
  const series = lastSix(today).map((m) => ({ label: parse(m + '-01').toLocaleDateString('en-GB', { month: 'short' }), value: Math.round((d.months.find((x) => x.month === m)?.revenue ?? 0) / 1000) }))
  const jump = (id: string) => () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-6 pb-6">
          <div>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">{parse(today).toLocaleDateString('en-GB', { weekday: 'long' })}</h2>
            <p className="text-muted-foreground">{fmt(today, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden text-right text-xs text-muted-foreground sm:block">Rooms taken<br />tonight</p>
            <ProgressRing value={pct} size={88} stroke={9} aria-label={`${pct} percent of rooms occupied tonight`}>{pct}%</ProgressRing>
          </div>
        </div>

        <dl className="grid grid-cols-2 border-y sm:grid-cols-4">
          <Stat label="Arriving" value={d.arrivals.length} onClick={jump('arriving')} />
          <Stat label="Leaving" value={d.departures.length} onClick={jump('leaving')} />
          <Stat label="Guests staying" value={d.guestsStaying} sub={`${d.occupied} of ${d.totalRooms} rooms`} onClick={jump('staying')} />
          <Stat label="Rooms free tonight" value={d.free.length} onClick={jump('free')} />
        </dl>

        {next && (next.arrivals.length > 0 || next.departures.length > 0) && (
          <p className="border-b py-3 text-sm" data-tabular>
            <span className="font-medium">Tomorrow</span>
            <span className="text-muted-foreground"> &middot; {next.arrivals.length} arriving, {next.departures.length} leaving</span>
          </p>
        )}

        <Group id="arriving" title="Arriving today" rows={d.arrivals} empty="No one arrives today." currency={currency} onOpen={open} showUntil />
        <Group id="leaving" title="Leaving today" rows={d.departures} empty="No one leaves today." currency={currency} onOpen={open} />
        <Group id="staying" title="Already staying" rows={d.inhouse} empty="No guests are staying over from earlier days." currency={currency} onOpen={open} showUntil />
        {next && next.arrivals.length > 0 && <Group id="tomorrow" title="Arriving tomorrow" rows={next.arrivals} empty="" currency={currency} onOpen={open} showUntil />}

        <section id="free" className="scroll-mt-6 pt-8">
          <h3 className="pb-2 text-base font-semibold">Free tonight <span className="font-normal text-muted-foreground" data-tabular>{d.free.length || ''}</span></h3>
          {d.free.length ? (
            <ul className="grid gap-1.5 border-t pt-3 text-sm">
              {[...new Set(d.free.map((r) => r.kind))].map((k) => (
                <li key={k}><span className="font-medium">{k}</span> <span className="text-muted-foreground">&middot;</span> {d.free.filter((r) => r.kind === k).map((r) => `${r.name} (${r.sleeps})`).join(', ')}</li>
              ))}
            </ul>
          ) : <p className="border-t py-3 text-sm text-muted-foreground">Every room is taken tonight.</p>}
        </section>
      </div>

      <aside className="min-w-0 lg:border-l lg:pl-10" aria-label="Money">
        <h3 className="pb-3 text-base font-semibold">{fmt(today, { month: 'long' })} so far</h3>
        <dl className="grid gap-4">
          <Money label="Booked for stays this month" value={money(thisMonth?.revenue ?? 0, currency)} />
          <Money label="Received" value={money(thisMonth?.collected ?? 0, currency)} />
        </dl>
        <div className="mt-6 border-t pt-4">
          <p className="pb-3 text-sm font-semibold">Revenue by month <span className="font-normal text-muted-foreground">in thousands</span></p>
          {maxK > 1 ? <BarChart data={series} height={150} /> : <p className="text-sm text-muted-foreground">Revenue shows here once you have bookings.</p>}
        </div>
        <div className="mt-6 border-t pt-4">
          <p className="text-sm font-semibold">Still to collect</p>
          <p className="font-display text-2xl font-semibold" data-tabular>{money(d.due.amount, currency)}</p>
          <p className="text-sm text-muted-foreground">{d.due.count === 0 ? 'Everyone has paid in full.' : `across ${d.due.count} booking${d.due.count > 1 ? 's' : ''}`}</p>
        </div>
      </aside>
    </div>
  )
}

const lastSix = (today: string) => Array.from({ length: 6 }, (_, i) => { const x = parse(today); x.setDate(1); x.setMonth(x.getMonth() - 3 + i); return ymd(x).slice(0, 7) })

function Stat({ label, value, sub, onClick }: { label: string; value: number; sub?: string; onClick: () => void }) {
  return (
    <div className="border-l first:border-l-0 max-sm:nth-[3]:border-l-0 max-sm:nth-[n+3]:border-t">
      <button onClick={onClick} className="block w-full px-4 py-4 text-left outline-none transition-colors hover:bg-accent/50 focus-visible:bg-accent/50" aria-label={`${label}: ${value}. Jump to the list`}>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-display text-3xl font-semibold" data-tabular>{value}</dd>
        {sub && <dd className="text-xs text-muted-foreground">{sub}</dd>}
      </button>
    </div>
  )
}

function Money({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="font-display text-2xl font-semibold" data-tabular>{value}</dd></div>
}

function Group({ id, title, rows, empty, currency, onOpen, showUntil }: { id: string; title: string; rows: Booking[]; empty: string; currency: string; onOpen: (b: Booking) => void; showUntil?: boolean }) {
  return (
    <section id={id} className="scroll-mt-6 pt-8">
      <h3 className="pb-2 text-base font-semibold">{title} <span className="font-normal text-muted-foreground" data-tabular>{rows.length || ''}</span></h3>
      {!rows.length ? <p className="border-t py-3 text-sm text-muted-foreground">{empty}</p> : (
        <ul className="border-b">
          {rows.map((b) => (
            <li key={b.id} className="border-t">
              <button onClick={() => onOpen(b)} className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 py-3 text-left outline-none transition-colors hover:bg-accent/50 focus-visible:bg-accent/50">
                <span className="font-medium">{b.guest_name}</span>
                <span className="text-right">{b.balance > 0 ? <Badge variant="warning" className="rounded-sm">{money(b.balance, currency)} due</Badge> : <StatusDot tone="success">Paid</StatusDot>}</span>
                <span className="text-sm text-muted-foreground">
                  <span className="text-foreground">{b.rooms.map((r) => r.name).join(', ')}</span> &middot; {b.guests} guest{b.guests > 1 ? 's' : ''} &middot; {b.nights} night{b.nights > 1 ? 's' : ''}{showUntil && <> &middot; until {fmt(b.check_out, short)}</>}
                </span>
                <span className="text-right text-xs text-muted-foreground" data-tabular>{b.phone}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function TodaySkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Loading today">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
