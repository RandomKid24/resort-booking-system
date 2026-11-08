import { Fragment, useEffect, useState } from 'react'
import { api, fmt, money, ymd, type Booking, type HistoryPage } from './api'
import { toast } from '@/components/ui/toast'
import { go } from './nav'
import { Block, PageHeader } from './Page'
import { useShell } from './Board'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { CopyIcon, DownloadIcon, FilterIcon, MailIcon, PhoneIcon, SearchIcon } from '@/components/ui/icons'

const WHEN = [['', 'All'], ['upcoming', 'Upcoming'], ['now', 'Staying now'], ['past', 'Past']] as const
const SORT = [['stay_desc', 'Stay date, newest'], ['stay_asc', 'Stay date, oldest'], ['booked_desc', 'Recently booked']] as const

const csv = (rows: Booking[]) =>
  [['Guest', 'Email', 'Phone', 'Check-in', 'Check-out', 'Nights', 'Guests', 'Rooms', 'Total', 'Status', 'Notes', 'Booked on'],
   ...rows.map((b) => [b.guest_name, b.email, b.phone, b.check_in, b.check_out, b.nights, b.guests, b.rooms.map((r) => r.name).join(' + '), b.total, b.status, b.notes, b.created_at])]
    .map((r) => r.map((c) => `"${String(c ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')

function stage(b: Booking, today: string) {
  if (b.status === 'cancelled') return { label: 'Cancelled', tone: 'text-destructive' }
  if (b.check_in > today) return { label: 'Upcoming', tone: 'text-primary' }
  if (b.check_out > today) return { label: 'Staying now', tone: 'text-success' }
  return { label: 'Completed', tone: 'text-muted-foreground' }
}

export function History({ params, currency }: { params: URLSearchParams; currency: string }) {
  const { open, version } = useShell()
  const today = ymd(new Date())
  const q = params.get('q') ?? ''
  const status = params.get('status') ?? ''
  const when = params.get('when') ?? ''
  const sort = params.get('sort') ?? 'stay_desc'
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''
  const pay = params.get('pay') ?? ''
  const page = Math.max(1, Number(params.get('page')) || 1)

  const [data, setData] = useState<HistoryPage | null>(null)
  const [failed, setFailed] = useState(false)
  const [typed, setTyped] = useState(q)

  const set = (patch: Record<string, string>, keepPage = false) => {
    const n = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) v ? n.set(k, v) : n.delete(k)
    if (!keepPage) n.delete('page')
    go(`/history${n.size ? '?' + n : ''}`, 'q' in patch)
  }

  // the box is typed into freely; the URL (and so the fetch) follows after a short pause
  useEffect(() => { setTyped(q) }, [q])
  useEffect(() => {
    if (typed === q) return
    const t = setTimeout(() => set({ q: typed }), 250)
    return () => clearTimeout(t)
  }, [typed]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const qs = new URLSearchParams({ q, status, when, sort, from, to, pay, page: String(page), today })
    api<HistoryPage>(`/api/history?${qs}`).then((r) => { setData(r); setFailed(false) }).catch(() => setFailed(true))
  }, [q, status, when, sort, from, to, pay, page, today, version])

  async function download() {
    // the CSV is the whole filtered set, not just this page
    const all: Booking[] = []
    for (let p = 1; ; p++) {
      const r = await api<HistoryPage>(`/api/history?${new URLSearchParams({ q, status, when, sort, page: String(p), from, to, pay, today })}`)
      all.push(...r.rows)
      if (p >= r.pages) break
    }
    const url = URL.createObjectURL(new Blob([csv(all)], { type: 'text/csv' }))
    Object.assign(document.createElement('a'), { href: url, download: 'bookings.csv' }).click()
    URL.revokeObjectURL(url)
  }

  const filtered = !!(q || status || when || from || to || pay)
  const advanced = !!(from || to || status || pay || sort !== 'stay_desc')
  const [more, setMore] = useState(advanced)
  const byMonth = sort !== 'booked_desc'
  let lastMonth = ''
  const lab = 'grid gap-1 text-xs text-muted-foreground'

  return (
    <div>
      <PageHeader title="History" description="Every booking ever made, including cancelled ones. Click a booking to open it." />
      <div className="divide-y-2 divide-border border-t-2">
      <Block size="sm" title="Find a booking" description="Search by name, email or phone. Filters narrow it by dates, payment and order.">
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <div className="min-w-0 flex-1 basis-56">
          <Input leftIcon={<SearchIcon />} placeholder="Search name, email or phone" value={typed} onChange={(e) => setTyped(e.target.value)} aria-label="Search bookings" />
        </div>
        <Button variant="outline" aria-expanded={more} onClick={() => setMore(!more)} aria-label="Filters">
          <FilterIcon /><span className="hidden sm:inline">Filters</span>{advanced && <span className="size-1.5 rounded-full bg-primary" aria-label="active" />}
        </Button>
      </div>

      {more && (
        <div className="mb-3 flex flex-wrap items-end gap-x-5 gap-y-3 border-y py-3">
          <label className={lab}>Stays from<input type="date" value={from} max={to || undefined} onChange={(e) => set({ from: e.target.value })} className="h-(--control-h-sm) rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/15" /></label>
          <label className={lab}>Stays until<input type="date" value={to} min={from || undefined} onChange={(e) => set({ to: e.target.value })} className="h-(--control-h-sm) rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/15" /></label>
          <label className={lab}>Show
            <select value={status} onChange={(e) => set({ status: e.target.value })} className="h-(--control-h-sm) rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/15">
              <option value="">All bookings</option><option value="confirmed">Confirmed only</option><option value="cancelled">Cancelled only</option>
            </select>
          </label>
          <label className={lab}>Payment
            <select value={pay} onChange={(e) => set({ pay: e.target.value })} className="h-(--control-h-sm) rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/15">
              <option value="">Any</option><option value="due">Balance due</option><option value="paid">Paid in full</option>
            </select>
          </label>
          <label className={lab}>Sort by
            <select value={sort} onChange={(e) => set({ sort: e.target.value === 'stay_desc' ? '' : e.target.value })} className="h-(--control-h-sm) rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/15">
              {SORT.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>
      )}

      </Block>
      <Block size="sm" title="Bookings" description="Tap a tab to see only upcoming, current or past stays."
        action={<Button variant="outline" onClick={download} disabled={!data?.count} aria-label="Download CSV"><DownloadIcon /><span className="hidden sm:inline">Download CSV</span></Button>}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-b">
        <div className="-mb-px flex max-w-full gap-5 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="When">
          {WHEN.map(([v, label]) => (
            <button key={v} aria-pressed={when === v} onClick={() => set({ when: v })}
              className={`whitespace-nowrap border-b-2 px-0.5 py-2.5 text-sm outline-none transition-colors focus-visible:text-foreground ${when === v ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{label}</button>
          ))}
        </div>
        <p className="pb-2.5 text-sm text-muted-foreground" aria-live="polite">
          {data ? <><b className="font-medium text-foreground" data-tabular>{data.count}</b> booking{data.count === 1 ? '' : 's'}{data.count > 0 && <> &middot; <span data-tabular>{money(data.revenue, currency)}</span></>}</> : failed ? '' : 'Loading'}
          {filtered && <> &middot; <button className="text-primary underline-offset-4 hover:underline" onClick={() => { setTyped(''); go('/history') }}>Clear</button></>}
        </p>
      </div>

      {failed && <p role="alert" className="py-6 text-sm text-destructive">Could not load history. <button className="underline" onClick={() => location.reload()}>Try again</button></p>}
      {!data && !failed && <div className="grid gap-3 py-4" aria-busy="true" aria-label="Loading bookings">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {data && !data.rows.length && (
        <EmptyState className="my-8" icon={<SearchIcon />} title={filtered ? 'No bookings match' : 'No bookings yet'}
          description={filtered ? 'Try different words or clear the filters.' : 'Bookings you make will show up here.'}
          action={filtered ? <Button variant="outline" size="sm" onClick={() => { setTyped(''); go('/history') }}>Clear filters</Button> : undefined} />
      )}

      {!!data?.rows.length && (
        <div className="hidden md:block">
          <table className="w-full text-left text-sm">
            <thead className="sr-only"><tr><th>Guest</th><th>Stay</th><th>Rooms</th><th>Total</th><th>Status</th><th>Share</th></tr></thead>
            <tbody>
              {data.rows.map((b) => {
                const st = stage(b, today)
                const month = fmt(b.check_in, { month: 'long', year: 'numeric' })
                const head = byMonth && month !== lastMonth
                lastMonth = month
                return (
                  <Fragment key={b.id}>
                    {head && <tr><th colSpan={6} scope="colgroup" className="pt-6 pb-2 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">{month}</th></tr>}
                    <tr onClick={() => open(b)} className={`group cursor-pointer border-t align-middle transition-colors hover:bg-accent/50 ${b.status === 'cancelled' ? 'text-muted-foreground' : ''}`}>
                      <td className="py-3.5 pr-4">
                        <button className="text-left font-medium text-foreground outline-none focus-visible:underline" onClick={() => open(b)}>{b.guest_name}</button>
                        <div className="text-xs">{b.email}</div>
                        {b.phone && <div className="text-xs" data-tabular>{b.phone}</div>}
                      </td>
                      <td className="py-3.5 pr-4 whitespace-nowrap" data-tabular>
                        {fmt(b.check_in, { weekday: 'short', day: 'numeric', month: 'short' })} &rarr; {fmt(b.check_out, { weekday: 'short', day: 'numeric', month: 'short' })}
                        <div className="text-xs">{b.nights} night{b.nights > 1 ? 's' : ''} &middot; {b.guests} guest{b.guests > 1 ? 's' : ''}</div>
                      </td>
                      <td className="max-w-[16rem] py-3.5 pr-4">{b.rooms.map((r) => r.name).join(', ')}</td>
                      <td className="py-3.5 pr-4 text-right whitespace-nowrap" data-tabular>{money(b.total, currency)}<PayNote b={b} currency={currency} /></td>
                      <td className={`py-3.5 pr-3 pl-2 whitespace-nowrap ${st.tone}`}>{st.label}</td>
                      <td className="w-28 py-2 pr-1 text-right whitespace-nowrap opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100" onClick={(e) => e.stopPropagation()}>
                        {b.status !== 'cancelled' && <ShareButtons b={b} />}
                      </td>
                    </tr>
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {!!data?.rows.length && (
        <ul className="md:hidden">
          {data.rows.map((b) => {
            const st = stage(b, today)
            return (
              <li key={b.id} className={`border-b ${b.status === 'cancelled' ? 'text-muted-foreground' : ''}`}>
                <button className="grid w-full grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 py-3.5 text-left outline-none active:bg-accent/60 focus-visible:bg-accent/60" onClick={() => open(b)}>
                  <span className="font-medium text-foreground">{b.guest_name}</span>
                  <span className="text-right text-sm" data-tabular>{money(b.total, currency)}<PayNote b={b} currency={currency} /></span>
                  <span className="text-sm" data-tabular>{fmt(b.check_in, { day: 'numeric', month: 'short', year: 'numeric' })} &rarr; {fmt(b.check_out, { day: 'numeric', month: 'short' })}</span>
                  <span className={`text-right text-xs ${st.tone}`}>{st.label}</span>
                  <span className="col-span-2 text-xs">{b.rooms.map((r) => r.name).join(', ')} &middot; {b.guests} guest{b.guests > 1 ? 's' : ''} &middot; {b.nights} night{b.nights > 1 ? 's' : ''}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {!!data && data.pages > 1 && (
        <nav className="flex items-center justify-between pt-4 text-sm" aria-label="Pages of results">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => set({ page: String(page - 1) }, true)}>Previous</Button>
          <span className="text-muted-foreground" data-tabular>Page {data.page} of {data.pages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => set({ page: String(page + 1) }, true)}>Next</Button>
        </nav>
      )}
      </Block>
      </div>
    </div>
  )
}

function PayNote({ b, currency }: { b: Booking; currency: string }) {
  if (b.status === 'cancelled') return null
  return b.balance > 0
    ? <div className="text-xs text-warning">{money(b.balance, currency)} due</div>
    : <div className="text-xs text-success">Paid</div>
}

function ShareButtons({ b }: { b: Booking }) {
  const link = `${location.origin}/b/${b.token}`
  const wa = `https://wa.me/${b.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${b.guest_name}, your stay is booked (${fmt(b.check_in)} to ${fmt(b.check_out)}). Details and calendar file: ${link}`)}`
  return (
    <div className="flex justify-end">
      <Tooltip content="Email booking and calendar file" side="top"><Button variant="ghost" size="icon-sm" aria-label={`Email ${b.guest_name} their booking`} onClick={async () => {
        try { const r = await api(`/api/bookings/${b.id}/email`, { method: 'POST' }); r.sent ? toast.success(`Email sent to ${b.email}`) : toast.info('Email is not set up yet', 'It was printed in the server log.') }
        catch (e) { toast.error('Email failed', (e as Error).message) }
      }}><MailIcon /></Button></Tooltip>
      <Tooltip content="Copy booking link" side="top"><Button variant="ghost" size="icon-sm" aria-label="Copy booking link" onClick={() => { navigator.clipboard.writeText(link); toast.success('Booking link copied') }}><CopyIcon /></Button></Tooltip>
      {b.phone && <Tooltip content="Send on WhatsApp" side="top"><Button variant="ghost" size="icon-sm" asChild><a href={wa} target="_blank" rel="noreferrer" aria-label="Send on WhatsApp"><PhoneIcon /></a></Button></Tooltip>}
    </div>
  )
}
