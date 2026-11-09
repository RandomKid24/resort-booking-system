import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api, addDays, fmt, parse, ymd, type Booking, type Room } from './api'
import { Button } from '@/components/ui/button'
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, ActivityIcon, HistoryIcon, HomeIcon, LogOutIcon, PlusIcon, SearchIcon, SettingsIcon } from '@/components/ui/icons'
import { Tooltip } from '@/components/ui/tooltip'
import { ThemeToggle, useTheme } from '@/components/ui/theme-toggle'
import { CommandPalette } from './CommandPalette'
import { go, onLink } from './nav'
import { PageHeader } from './Page'
import { BookingDialog, type Draft } from './BookingDialog'
import { toast } from '@/components/ui/toast'

const DAYS = 21
const monday = (d: Date) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return ymd(x) }

/** Pages inside the shell (history) open the booking dialog through this; `version` bumps after any save. */
export const ShellCtx = createContext<{ open: (b: Booking) => void; version: number; bump: () => void; rename: (name: string) => void; resort: string}>({ open: () => {}, version: 0, bump: () => {}, rename: () => {}, resort: '' })
export const useShell = () => useContext(ShellCtx)

export function Board({ me, path, onLogout, onRename, children }: { me: { resort: string; currency: string }; path: string; onLogout: () => void; onRename: (name: string) => void; children?: React.ReactNode }) {
  const { resort, currency } = me
  const week = new URLSearchParams(location.search).get('week')
  const start = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? monday(parse(week)) : monday(new Date())
  // replace, not push: stepping through weeks should not fill the back button
  const setStart = (s: string) => go(`/board?week=${s}`, true)
  const [rooms, setRooms] = useState<Room[]>([])
  // bookings are fetched for a wide window around the week, so stepping to a nearby week needs no request and never shows stale bars
  const [data, setData] = useState<{ from: string; to: string; items: Booking[] } | null>(null)
  const [version, setVersion] = useState(0)
  const [palette, setPalette] = useState(false)
  const theme = useTheme()
  const [draft, setDraft] = useState<Draft | null>(null)
  const view = path.slice(1)
  const bump = () => setVersion((v) => v + 1)
  const end = addDays(start, DAYS)
  const today = ymd(new Date())
  const days = useMemo(() => Array.from({ length: DAYS }, (_, i) => addDays(start, i)), [start])

  const fetchWindow = useCallback((s: string) => {
    const from = addDays(s, -28), to = addDays(s, DAYS + 28)
    api<Booking[]>(`/api/bookings?from=${from}&to=${to}`).then((items) => setData({ from, to, items })).catch((e) => e.status === 401 ? onLogout() : toast.error('Could not load bookings', e.message))
  }, [onLogout])
  useEffect(() => { if (!data || start < data.from || end > data.to) fetchWindow(start) }, [start]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (version) fetchWindow(start) }, [version]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { api<Room[]>('/api/rooms').then(setRooms).catch(() => {}) }, [version])
  useEffect(() => { document.title = `${resort} bookings` }, [resort])
  const bookings = (data?.items ?? []).filter((b) => b.check_out > start && b.check_in < end)

  const grid = { gridTemplateColumns: `var(--lab) repeat(${DAYS}, minmax(2.6rem, 1fr))` }
  const kinds = [...new Set(rooms.map((r) => r.kind))]
  const first = days.find((d) => d.endsWith('-01')) ?? start

  const newBooking = () => setDraft({ check_in: today, check_out: addDays(today, 1), guests: 1, room_ids: [] })
  const signOut = async () => { await api('/api/logout', { method: 'POST' }); onLogout() }
  // Keyboard shortcuts (listed in Settings). Ignored while typing, with a window open, or with a modifier held.
  const onKey = useRef<(e: KeyboardEvent) => void>(() => {})
  const gAt = useRef(0)
  onKey.current = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((o) => !o); return }
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    if ((e.target as HTMLElement).closest?.('input, textarea, select, [contenteditable="true"]') || document.querySelector('[role="dialog"]')) return
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
    if (Date.now() - gAt.current < 1200) {
      gAt.current = 0
      const to = ({ t: '/today', b: '/board', h: '/history', a: '/activity', s: '/settings' } as Record<string, string>)[k]
      if (to) { e.preventDefault(); go(to) }
      return
    }
    if (k === 'g') { gAt.current = Date.now(); return }
    if (k === 'n') { e.preventDefault(); newBooking() }
    else if (k === '?') { e.preventDefault(); go('/settings?tab=shortcuts') }
    else if (view === 'board' && k === 'ArrowLeft') { e.preventDefault(); setStart(addDays(start, -7)) }
    else if (view === 'board' && k === 'ArrowRight') { e.preventDefault(); setStart(addDays(start, 7)) }
    else if (view === 'board' && k === 't') setStart(monday(new Date()))
    else if (view === 'history' && k === '/') { e.preventDefault(); document.querySelector<HTMLInputElement>('input[aria-label="Search bookings"]')?.focus() }
  }
  useEffect(() => {
    const f = (e: KeyboardEvent) => onKey.current(e)
    addEventListener('keydown', f)
    return () => removeEventListener('keydown', f)
  }, [])

  const openBooking = (b: Booking) => (b.status === 'cancelled' ? toast.info('This booking was cancelled', 'Make a new booking to reuse the rooms.') : setDraft({ ...b, room_ids: b.rooms.map((r) => r.id) }))
  const NAV = [['today', 'Today', HomeIcon], ['board', 'Board', CalendarDaysIcon], ['history', 'History', HistoryIcon], ['activity', 'Activity', ActivityIcon], ['settings', 'Settings', SettingsIcon]] as const

  return (
    <div className="mx-auto max-w-[96rem] px-4 pb-28 md:px-8 md:pb-16 [--lab:6.25rem] md:[--lab:10rem]">
      <header className="py-4 md:py-5">
        <div className="flex items-center gap-3">
          <h1 className="font-display mr-auto truncate text-xl font-semibold md:text-2xl">{resort}</h1>
          <Button className="hidden md:inline-flex" onClick={newBooking} title="New booking (N)"><PlusIcon />New booking</Button>
          <Button size="icon-sm" className="md:hidden" onClick={newBooking} aria-label="New booking"><PlusIcon /></Button>
          <Tooltip content="Search or jump to" shortcut={['Ctrl', 'K']} side="bottom"><Button variant="ghost" size="icon-sm" onClick={() => setPalette(true)} aria-label="Search or jump to"><SearchIcon /></Button></Tooltip>
          <Tooltip content="Light or dark" side="bottom"><span><ThemeToggle /></span></Tooltip>
          <Tooltip content="Sign out" side="bottom"><Button variant="ghost" size="icon-sm" onClick={signOut} aria-label="Sign out"><LogOutIcon /></Button></Tooltip>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3">
          <nav className="flex max-w-full gap-1" aria-label="Pages">
            {NAV.map(([v, label, Icon]) => (
              <Button key={v} variant={view === v ? 'secondary' : 'ghost'} size="sm" asChild>
                <a href={`/${v}`} onClick={onLink} aria-label={label} aria-current={view === v ? 'page' : undefined}><Icon /><span className={view === v ? '' : 'hidden sm:inline'}>{label}</span></a>
              </Button>
            ))}
          </nav>
          {view === 'board' && (
            <div className="flex items-center gap-1 md:ml-auto" role="group" aria-label="Move the board">
              <Button variant="outline" size="icon-sm" aria-label="Previous week" title="Previous week (←)" onClick={() => setStart(addDays(start, -7))}><ChevronLeftIcon /></Button>
              <Button variant="outline" size="sm" title="This week (T)" onClick={() => setStart(monday(new Date()))}>This week</Button>
              <Button variant="outline" size="icon-sm" aria-label="Next week" title="Next week (→)" onClick={() => setStart(addDays(start, 7))}><ChevronRightIcon /></Button>
            </div>
          )}
        </div>
      </header>

      <div className="safe-b fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 px-4 pt-3 backdrop-blur md:hidden">
        <Button size="lg" className="w-full" onClick={newBooking}><PlusIcon />New booking</Button>
      </div>

      {view !== 'board' && (
        <ShellCtx.Provider value={{ version, bump, resort, rename: onRename, open: openBooking }}>{children}</ShellCtx.Provider>
      )}
      {view === 'board' && <><PageHeader title="Board" description="Rooms by date. Click a free day to start a booking, or a booked stay to edit or share it." />
      <div className="overflow-x-auto border-y-2" role="grid" aria-label="Rooms by date">
        <div key={start} className="board-anim min-w-[56rem]">
        <div className="grid text-sm" style={grid} role="row">
          <div className="sticky left-0 z-10 bg-background py-2 pl-1 text-xs text-muted-foreground">{fmt(first, { month: 'long', year: 'numeric' })}</div>
          {days.map((d) => {
            const dt = parse(d)
            const wk = dt.getDay() === 0 || dt.getDay() === 6
            return (
              <div key={d} role="columnheader" className={`border-l py-2 text-center leading-tight ${wk ? 'bg-muted' : ''} ${d === today ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                <div className="text-[11px] uppercase">{dt.toLocaleDateString('en-GB', { weekday: 'short' })}</div>
                <div className="text-base text-foreground" data-tabular>{dt.getDate()}</div>
              </div>
            )
          })}
        </div>

        {kinds.map((kind) => (
          <div key={kind}>
            <div className="border-t bg-muted/60 px-1 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{kind}</div>
            {rooms.filter((r) => r.kind === kind).map((room) => (
              <div key={room.id} className="relative grid min-w-[56rem] border-t" style={grid} role="row">
                <div className="sticky left-0 z-10 flex items-center overflow-hidden bg-background pl-1 text-sm font-medium">
                  {room.name}<span className="ml-2 hidden text-xs font-normal text-muted-foreground md:inline">sleeps {room.sleeps}</span>
                </div>
                {days.map((d, i) => {
                  const wk = [0, 6].includes(parse(d).getDay())
                  return (
                    <button
                      key={d} role="gridcell" style={{ gridColumn: i + 2, gridRow: 1 }}
                      aria-label={`${room.name}, ${fmt(d)}, free. Start a booking`}
                      onClick={() => setDraft({ check_in: d, check_out: addDays(d, 1), room_ids: [room.id] })}
                      className={`h-11 border-l outline-none transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset ${wk ? 'bg-muted/60' : ''} ${d === today ? 'shadow-[inset_2px_0_0_var(--primary)]' : ''}`}
                    />
                  )
                })}
                {bookings.filter((b) => b.rooms.some((r) => r.id === room.id)).map((b) => {
                  const s = Math.max(0, Math.round((parse(b.check_in).getTime() - parse(start).getTime()) / 864e5))
                  const e = Math.min(DAYS, Math.round((parse(b.check_out).getTime() - parse(start).getTime()) / 864e5))
                  const clippedL = b.check_in < start
                  return (
                    <button
                      key={b.id}
                      style={{ gridColumn: `${s + 2} / ${e + 2}`, gridRow: 1 }}
                      onClick={() => setDraft({ ...b, room_ids: b.rooms.map((r) => r.id) })}
                      title={`${b.guest_name}: ${fmt(b.check_in)} to ${fmt(b.check_out)}`}
                      className={`z-[1] my-1 mr-1 ml-2 flex min-w-0 items-center truncate bg-primary px-2 text-left text-xs font-medium text-primary-foreground outline-none transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-foreground ${clippedL ? 'ml-0 rounded-l-none' : 'rounded-l-md'} rounded-r-sm [clip-path:polygon(0_0,100%_0,calc(100%-6px)_50%,100%_100%,0_100%)]`}
                    >
                      <span className="truncate">{b.guest_name}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        ))}
        </div>
        {!rooms.length && <p className="p-6 text-sm text-muted-foreground">No rooms yet. Run the seed file to add your rooms.</p>}
      </div>
</>}

      <CommandPalette open={palette} onOpenChange={setPalette} onNew={newBooking} onOpenBooking={openBooking} onToggleTheme={theme.toggle} />
      {draft && <BookingDialog draft={draft} rooms={rooms} currency={currency} onClose={() => setDraft(null)} onSaved={bump} />}
    </div>
  )
}
