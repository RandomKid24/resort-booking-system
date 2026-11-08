import { useEffect, useState } from 'react'
import { api, fmt, type Booking, type HistoryPage } from './api'
import { go } from './nav'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ActivityIcon, CalendarDaysIcon, HistoryIcon, HomeIcon, MoonIcon, PlusIcon, SettingsIcon, UserIcon } from '@/components/ui/icons'

/** Ctrl or Cmd + K: jump anywhere, start a booking, or find a guest by name, email or phone. */
export function CommandPalette({ open, onOpenChange, onNew, onOpenBooking, onToggleTheme }: {
  open: boolean; onOpenChange: (o: boolean) => void; onNew: () => void; onOpenBooking: (b: Booking) => void; onToggleTheme: () => void
}) {
  const [q, setQ] = useState('')
  const [guests, setGuests] = useState<Booking[]>([])

  useEffect(() => { if (!open) { setQ(''); setGuests([]) } }, [open])
  useEffect(() => {
    if (q.trim().length < 2) { setGuests([]); return }
    const t = setTimeout(() => {
      api<HistoryPage>(`/api/history?${new URLSearchParams({ q: q.trim(), today: new Date().toISOString().slice(0, 10) })}`).then((r) => setGuests(r.rows.slice(0, 6))).catch(() => {})
    }, 200)
    return () => clearTimeout(t)
  }, [q])

  const run = (fn: () => void) => () => { onOpenChange(false); fn() }
  const pages = [['Today', '/today', HomeIcon], ['Board', '/board', CalendarDaysIcon], ['History', '/history', HistoryIcon], ['Activity', '/activity', ActivityIcon], ['Settings', '/settings', SettingsIcon]] as const

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} label="Search or jump to">
      <CommandInput placeholder="Type a name, or a page or action" value={q} onValueChange={setQ} />
      <CommandList>
        <CommandEmpty>Nothing matches.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem value="new booking add" onSelect={run(onNew)}><PlusIcon />New booking</CommandItem>
          <CommandItem value="switch theme dark light mode" onSelect={run(onToggleTheme)}><MoonIcon />Switch light or dark mode</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Go to">
          {pages.map(([label, to, Icon]) => <CommandItem key={to} value={`go ${label}`} onSelect={run(() => go(to))}><Icon />{label}</CommandItem>)}
        </CommandGroup>
        {!!guests.length && (
          <CommandGroup heading="Guests">
            {guests.map((b) => (
              <CommandItem key={b.id} value={`${b.guest_name} ${b.email} ${b.phone} ${b.id}`} onSelect={run(() => (b.status === 'cancelled' ? go(`/history?q=${encodeURIComponent(b.guest_name)}`) : onOpenBooking(b)))}>
                <UserIcon />
                <span className="font-medium">{b.guest_name}</span>
                <span className="ml-auto text-xs text-muted-foreground" data-tabular>{fmt(b.check_in, { day: 'numeric', month: 'short' })} to {fmt(b.check_out, { day: 'numeric', month: 'short' })}{b.status === 'cancelled' ? ' (cancelled)' : ''}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
