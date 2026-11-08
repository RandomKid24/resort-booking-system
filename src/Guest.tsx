import { useEffect, useState } from 'react'
import { api, diff, fmt, money } from './api'
import { Button } from '@/components/ui/button'
import { CalendarIcon, PrinterIcon } from '@/components/ui/icons'
import { StatusDot } from '@/components/ui/status-dot'
import { Skeleton } from '@/components/ui/skeleton'

type Pub = {
  resort: string; guest_name: string; check_in: string; check_out: string; status: string
  rooms: { name: string }[]; lines: { name: string; basis: 'room' | 'person'; rate: number; pax: number; extra_beds: number; extra_rate: number }[]; total: number; paid: number; balance: number; guests: number; ref: string; currency: string
}

export function Guest({ token }: { token: string }) {
  const [b, setB] = useState<Pub | null>(null)
  const [missing, setMissing] = useState(false)
  useEffect(() => { api<Pub>(`/api/public/${token}`).then((r) => { setB(r); document.title = `${r.resort}: your booking` }).catch(() => setMissing(true)) }, [token])

  if (missing) return <main className="grid min-h-dvh place-items-center p-6"><p>This booking link is not valid.</p></main>
  if (!b) return <main className="mx-auto grid max-w-xl gap-4 px-6 py-16"><Skeleton className="h-6 w-40" /><Skeleton className="h-12 w-full" /><Skeleton className="h-40 w-full" /></main>

  const n = diff(b.check_in, b.check_out)
  const long: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  const ok = b.status === 'confirmed'
  return (
    <main className="mx-auto grid min-h-dvh max-w-xl content-center gap-8 px-6 py-12">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm tracking-wide text-muted-foreground uppercase">{b.resort}</p>
        <p className="text-xs text-muted-foreground" data-tabular>Ref {b.ref}</p>
      </div>
      <h1 className="font-display text-4xl font-semibold">{ok ? `See you soon, ${b.guest_name.split(' ')[0]}.` : 'This booking was cancelled.'}</h1>
      {ok && (
        <>
          <dl className="grid grid-cols-2 gap-y-5 border-y py-6">
            <Item label="Arrive" value={fmt(b.check_in, long)} />
            <Item label="Depart" value={fmt(b.check_out, long)} />
            <Item label="Stay" value={`${n} night${n > 1 ? 's' : ''}, ${b.guests} guest${b.guests > 1 ? 's' : ''}`} />
            <Item label="Rooms" value={b.rooms.map((r) => r.name).join(', ')} />
          </dl>
          <ul className="grid gap-1.5 text-sm" data-tabular>
            {b.lines.flatMap((l) => [
              <li key={l.name} className="flex justify-between gap-4">
                <span>{l.name} <span className="text-muted-foreground">{l.basis === 'person' ? `${l.pax} guest${l.pax > 1 ? 's' : ''} × ${n} night${n > 1 ? 's' : ''} × ${money(l.rate, b.currency)}` : `${n} night${n > 1 ? 's' : ''} × ${money(l.rate, b.currency)}`}</span></span>
                <span>{money((l.basis === 'person' ? l.rate * l.pax : l.rate) * n, b.currency)}</span>
              </li>,
              ...(l.extra_beds ? [<li key={l.name + 'x'} className="flex justify-between gap-4"><span className="text-muted-foreground">&nbsp;&nbsp;Extra mattress × {l.extra_beds}, {n} night{n > 1 ? 's' : ''} × {money(l.extra_rate, b.currency)}</span><span>{money(l.extra_beds * l.extra_rate * n, b.currency)}</span></li>] : []),
            ])}
          </ul>
          <dl className="grid gap-2 text-lg" data-tabular>
            <div className="flex justify-between border-t pt-3"><dt className="text-muted-foreground">Total</dt><dd>{money(b.total, b.currency)}</dd></div>
            {b.paid > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Received</dt><dd>{money(b.paid, b.currency)}</dd></div>}
            <div className="flex items-center justify-between border-t pt-2 font-medium">
              <dt>{b.balance > 0 ? 'Balance to pay' : 'Balance'}</dt>
              <dd>{b.balance > 0 ? money(b.balance, b.currency) : <StatusDot tone="success">Paid in full</StatusDot>}</dd>
            </div>
          </dl>
          <div className="no-print flex flex-wrap gap-3">
            <Button asChild size="lg"><a href={`/api/public/${token}.ics`}><CalendarIcon />Add to my calendar</a></Button>
            <Button variant="outline" size="lg" onClick={() => print()}><PrinterIcon />Print or save as PDF</Button>
          </div>
        </>
      )}
    </main>
  )
}

const Item = ({ label, value }: { label: string; value: string }) => (
  <div><dt className="text-xs text-muted-foreground uppercase">{label}</dt><dd className="mt-1 text-lg">{value}</dd></div>
)
