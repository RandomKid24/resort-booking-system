import { Fragment, useEffect, useState } from 'react'
import { api, fmt, money, type AuditPage, type AuditRow } from './api'
import { go } from './nav'
import { Block, PageHeader } from './Page'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusDot } from '@/components/ui/status-dot'
import { SearchIcon, ShieldCheckIcon } from '@/components/ui/icons'

const TYPES = [['', 'Everything'], ['booking', 'Bookings'], ['room', 'Rooms'], ['settings', 'Settings'], ['auth', 'Sign-ins']] as const

const LABEL: Record<string, string> = {
  'booking.created': 'Booking created', 'booking.updated': 'Booking edited', 'booking.payment': 'Payment', 'booking.cancelled': 'Booking cancelled', 'booking.emailed': 'Email to guest',
  'room.created': 'Room added', 'room.updated': 'Room edited', 'room.archived': 'Room archived', 'room.restored': 'Room restored', 'room.deleted': 'Room deleted',
  'settings.renamed': 'Name changed', 'settings.calendar_link': 'Calendar link', 'reminders.sent': 'Reminders sent',
  'auth.login': 'Signed in', 'auth.login_failed': 'Failed sign-in', 'auth.logout': 'Signed out',
}
const tone = (a: string) => (a === 'auth.login_failed' || a === 'booking.cancelled' || a === 'room.deleted' ? 'danger' : a.startsWith('booking') ? 'success' : a.startsWith('room') ? 'info' : 'neutral') as 'danger' | 'success' | 'info' | 'neutral'

const MONEY = new Set(['total', 'amount received', 'price', 'price per night', 'price per person', 'extra mattress price'])
const DATES = new Set(['check-in', 'check-out'])
const utc = (at: string) => new Date(at.replace(' ', 'T') + 'Z')

function show(field: string, v: unknown, currency: string) {
  if (v === '' || v === null || v === undefined) return '(empty)'
  if (MONEY.has(field) && typeof v === 'number') return money(v, currency)
  if (DATES.has(field) && typeof v === 'string') return fmt(v, { day: 'numeric', month: 'short', year: 'numeric' })
  return String(v)
}

/** One log entry. `compact` is used inside a booking window. */
export function Entry({ r, currency, compact }: { r: AuditRow; currency: string; compact?: boolean }) {
  const d = utc(r.at)
  return (
    <li className={`grid gap-x-4 gap-y-1 border-t py-3.5 ${compact ? 'grid-cols-[4.5rem_1fr]' : 'sm:grid-cols-[4.5rem_1fr_auto] grid-cols-[4.5rem_1fr]'}`}>
      <time dateTime={d.toISOString()} className="pt-0.5 text-xs text-muted-foreground" data-tabular>{compact ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' : ''}{d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</time>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <StatusDot tone={tone(r.action)}><span className="font-medium text-foreground">{LABEL[r.action] ?? r.action}</span></StatusDot>
          {!compact && <span className="text-sm text-muted-foreground">{r.summary}</span>}
        </p>
        {!!r.detail.length && (
          <dl className="mt-1.5 grid gap-0.5 text-sm">
            {r.detail.map((c) => (
              <div key={c.field} className="flex flex-wrap gap-x-2">
                <dt className="text-muted-foreground">{c.field.charAt(0).toUpperCase() + c.field.slice(1)}</dt>
                <dd data-tabular>
                  {c.from !== undefined && <><span className="text-muted-foreground line-through decoration-muted-foreground/50">{show(c.field, c.from, currency)}</span> <span aria-label="changed to">&rarr;</span> </>}
                  <span className="font-medium">{show(c.field, c.to, currency)}</span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {!compact && <p className="col-start-2 text-xs text-muted-foreground sm:col-start-auto sm:text-right">{r.actor}</p>}
    </li>
  )
}

export function Activity({ params, currency }: { params: URLSearchParams; currency: string }) {
  const q = params.get('q') ?? ''
  const type = params.get('type') ?? ''
  const page = Math.max(1, Number(params.get('page')) || 1)
  const [data, setData] = useState<AuditPage | null>(null)
  const [failed, setFailed] = useState(false)
  const [typed, setTyped] = useState(q)

  const set = (patch: Record<string, string>, keepPage = false) => {
    const n = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) v ? n.set(k, v) : n.delete(k)
    if (!keepPage) n.delete('page')
    go(`/activity${n.size ? '?' + n : ''}`, 'q' in patch)
  }
  useEffect(() => { setTyped(q) }, [q])
  useEffect(() => {
    if (typed === q) return
    const t = setTimeout(() => set({ q: typed }), 250)
    return () => clearTimeout(t)
  }, [typed]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    api<AuditPage>(`/api/audit?${new URLSearchParams({ q, type, page: String(page) })}`).then((r) => { setData(r); setFailed(false) }).catch(() => setFailed(true))
  }, [q, type, page])

  // group by local day
  const groups: { day: string; rows: AuditRow[] }[] = []
  data?.rows.forEach((r) => {
    const day = utc(r.at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const last = groups[groups.length - 1]
    last?.day === day ? last.rows.push(r) : groups.push({ day, rows: [r] })
  })

  return (
    <div>
      <PageHeader title="Activity" description="A permanent record of every change: what happened, who did it and when. Entries cannot be edited or deleted." />
      <div className="divide-y-2 divide-border border-t-2">
        <Block size="sm" title="Find an entry" description="Search by guest, room, person or what changed.">
          <div className="grid gap-4">
            <div className="max-w-md"><Input leftIcon={<SearchIcon />} placeholder="Search the log" value={typed} onChange={(e) => setTyped(e.target.value)} aria-label="Search the activity log" /></div>
            <div className="flex max-w-full gap-5 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b" role="group" aria-label="Kind of activity">
              {TYPES.map(([v, label]) => (
                <button key={v} aria-pressed={type === v} onClick={() => set({ type: v })}
                  className={`-mb-px whitespace-nowrap border-b-2 px-0.5 py-2.5 text-sm outline-none transition-colors focus-visible:text-foreground ${type === v ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{label}</button>
              ))}
            </div>
          </div>
        </Block>

        <Block size="sm" title={<>The log {data && <span className="text-base font-normal text-muted-foreground" data-tabular>{data.count} entr{data.count === 1 ? 'y' : 'ies'}</span>}</>}>
          {failed && <p role="alert" className="py-6 text-sm text-destructive">Could not load the log. <button className="underline" onClick={() => location.reload()}>Try again</button></p>}
          {!data && !failed && <div className="grid gap-3" aria-busy="true">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>}
          {data && !data.rows.length && <EmptyState icon={<ShieldCheckIcon />} title={q || type ? 'Nothing matches' : 'Nothing recorded yet'} description={q || type ? 'Try other words or choose Everything.' : 'Changes you make will be listed here.'} action={q || type ? <Button variant="outline" size="sm" onClick={() => { setTyped(''); go('/activity') }}>Clear filters</Button> : undefined} />}
          {groups.map((g) => (
            <Fragment key={g.day}>
              <h4 className="pt-4 pb-2 text-xs font-semibold tracking-wide text-foreground/70 uppercase first:pt-0">{g.day}</h4>
              <ul className="border-b">{g.rows.map((r) => <Entry key={r.id} r={r} currency={currency} />)}</ul>
            </Fragment>
          ))}
          {!!data && data.pages > 1 && (
            <nav className="flex items-center justify-between pt-6 text-sm" aria-label="Pages of the log">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => set({ page: String(page - 1) }, true)}>Newer</Button>
              <span className="text-muted-foreground" data-tabular>Page {data.page} of {data.pages}</span>
              <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => set({ page: String(page + 1) }, true)}>Older</Button>
            </nav>
          )}
        </Block>
      </div>
    </div>
  )
}
