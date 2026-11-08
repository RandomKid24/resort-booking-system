import { useCallback, useEffect, useState } from 'react'
import { api, money, type Room } from './api'
import { useShell } from './Board'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/segmented'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { MinusIcon, PlusIcon, CopyIcon } from '@/components/ui/icons'
import { SHORTCUTS } from './shortcuts'
import { Block, PageHeader, SubHead } from './Page'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { CheckIcon, MailIcon, RefreshIcon } from '@/components/ui/icons'

type Fields = { name: string; kind: string; sleeps: string; price: string; pricing: 'room' | 'person'; extra_price: string; max_extra: string }
const fromRoom = (r: Room): Fields => ({ name: r.name, kind: r.kind, sleeps: String(r.sleeps), price: String(r.price), pricing: r.pricing, extra_price: String(r.extra_bed_price), max_extra: String(r.max_extra_beds) })
const toApi = (f: Fields) => ({ name: f.name, kind: f.kind, sleeps: Number(f.sleeps), price: f.price === '' ? NaN : Number(f.price), pricing: f.pricing, extra_bed_price: Number(f.extra_price || 0), max_extra_beds: Number(f.max_extra || 0) })
type Draft = Fields & { key: number }

// "Palm 3" -> "Palm 4": the usual next room when you copy one
const nextName = (n: string) => (/^(.*?)(\d+)\s*$/.test(n) ? n.replace(/(\d+)\s*$/, (d) => String(Number(d) + 1)) : `${n} 2`)

export function Settings({ currency }: { currency: string }) {
  const { bump, resort, rename } = useShell()
  const [rooms, setRooms] = useState<Room[] | null>(null)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [deleting, setDeleting] = useState<Room | null>(null)

  const load = useCallback(() => { api<Room[]>('/api/rooms?all=1').then(setRooms).catch((e) => toast.error('Could not load rooms', e.message)) }, [])
  useEffect(load, [load])
  useEffect(() => { if (location.hash === '#shortcuts') setTimeout(() => document.getElementById('shortcuts')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150) }, [])
  const changed = () => { load(); bump() }

  const live = rooms?.filter((r) => r.active) ?? []
  const archived = rooms?.filter((r) => !r.active) ?? []
  const kinds = [...new Set(live.map((r) => r.kind))].sort()
  const addDraft = (f: Fields) => setDrafts((d) => [{ ...f, key: Date.now() + d.length }, ...d])

  const jump = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.replaceState(null, '', `#${id}`) }
  const sections = [['resort', 'Resort'], ['rooms', 'Rooms'], ['automation', 'Calendar and reminders'], ['shortcuts', 'Keyboard shortcuts']] as const

  return (
    <div>
      <PageHeader title="Settings" description="Your resort, rooms, calendar and shortcuts." />
      <nav aria-label="Jump to a section" className="-mt-2 mb-8 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
        <span className="mr-2 text-muted-foreground">Jump to</span>
        {sections.map(([id, label]) => <a key={id} href={`#${id}`} onClick={jump(id)} className="rounded-sm px-2 py-1 font-medium text-primary underline-offset-4 outline-none hover:bg-accent hover:underline focus-visible:bg-accent">{label}</a>)}
      </nav>

      <div className="divide-y-2 divide-border border-t-2">
        <Block id="resort" title="Resort" description="The name guests see in emails, on their booking page and at the top of every page.">
          <ResortName current={resort} onSaved={rename} />
        </Block>

        <Block id="rooms" title="Rooms" description="Add, price and arrange the rooms you rent out. Edit a row, then press Save on that row."
          action={<Button onClick={() => addDraft({ name: '', kind: kinds[0] ?? '', sleeps: '2', price: '', pricing: 'room', extra_price: '', max_extra: '0' })}><PlusIcon />Add room</Button>}>
          <SubHead>Rooms on the board <span className="font-normal text-muted-foreground" data-tabular>{rooms ? `${live.length}, sleeping ${live.reduce((t, r) => t + r.sleeps, 0)} guests in total` : ''}</span></SubHead>
          <div className="hidden grid-cols-[1.4fr_1fr_8.5rem_9rem_auto] gap-x-3 border-b-2 pb-2 text-xs font-semibold tracking-wide text-foreground/70 uppercase md:grid" aria-hidden>
            <span>Room name</span><span>Type</span><span>Max guests</span><span>Price</span><span className="w-[16.5rem]" />
          </div>
          <datalist id="room-kinds">{kinds.map((k) => <option key={k} value={k} />)}</datalist>
          <ul className="border-b">
            {drafts.map((d) => (
              <RoomRow key={d.key} initial={d} kinds={kinds} currency={currency}
                onDone={() => { setDrafts((x) => x.filter((y) => y.key !== d.key)); changed() }}
                onCancel={() => setDrafts((x) => x.filter((y) => y.key !== d.key))} />
            ))}
            {live.map((r) => (
              <RoomRow key={r.id} room={r} initial={fromRoom(r)} kinds={kinds} currency={currency}
                onDone={changed} onDelete={() => setDeleting(r)} onCopy={() => addDraft({ ...fromRoom(r), name: nextName(r.name) })} />
            ))}
          </ul>
          {rooms && !live.length && !drafts.length && <p className="py-10 text-sm text-muted-foreground">No rooms yet. Press "Add room" to create your first one.</p>}

          {!!archived.length && (
            <div className="mt-10">
              <SubHead>Archived rooms <span className="font-normal text-muted-foreground" data-tabular>{archived.length}</span></SubHead>
              <p className="pb-3 text-sm text-muted-foreground">Hidden from the board and new bookings. Past bookings keep them. Restore a room any time.</p>
              <ul className="border-b">
                {archived.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 border-t py-2.5 text-sm text-muted-foreground">
                    <span className="mr-auto"><span className="font-medium text-foreground">{r.name}</span> <span className="text-xs">&middot; {r.kind} &middot; {r.sleeps} guests &middot; {money(r.price, currency)}</span></span>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleting(r)}>Delete</Button>
                    <Button size="sm" variant="outline" onClick={async () => { try { await api(`/api/rooms/${r.id}`, { method: 'PUT', json: { ...r, active: 1 } }); toast.success(`${r.name} is back on the board`); changed() } catch (e) { toast.error('Could not restore', (e as Error).message) } }}>Restore</Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Block>

        <Block id="automation" title="Calendar and reminders" description="Keep staff calendars up to date and remind guests before they arrive.">
          <CalendarFeed />
        </Block>

        <Block id="shortcuts" title="Keyboard shortcuts" description={<>For a computer keyboard. They pause while you type in a box or have a window open. Press <Kbd>?</Kbd> anywhere to come back here.</>}>
          <Shortcuts />
        </Block>
      </div>
      {deleting && <ConfirmDelete room={deleting} onClose={() => setDeleting(null)} onDone={() => { setDeleting(null); changed() }} />}
    </div>
  )
}

function ConfirmDelete({ room, onClose, onDone }: { room: Room; onClose: () => void; onDone: () => void }) {
  const [busy, setBusy] = useState(false)
  const [blocked, setBlocked] = useState('')
  async function del() {
    setBusy(true)
    try { await api(`/api/rooms/${room.id}`, { method: 'DELETE' }); toast.success(`${room.name} deleted`); onDone() }
    catch (e) { setBlocked((e as Error).message) } finally { setBusy(false) }
  }
  async function archive() {
    try { await api(`/api/rooms/${room.id}`, { method: 'PUT', json: { ...room, active: 0 } }); toast.success(`${room.name} archived`); onDone() }
    catch (e) { setBlocked((e as Error).message) }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Delete {room.name}?</DialogTitle>
          <DialogDescription>{blocked || 'This removes the room for good and cannot be undone. Rooms that have been booked before cannot be deleted, only archived.'}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-wrap gap-2">
          <Button variant="ghost" onClick={onClose}>{blocked ? 'Close' : 'Keep room'}</Button>
          {blocked && !!room.active && <Button variant="outline" onClick={archive}>Archive instead</Button>}
          {!blocked && <Button variant="destructive" loading={busy} onClick={del}>Delete room</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CalendarFeed() {
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [ask, setAsk] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => { api('/api/settings').then((r) => setUrl(r.calendar_url)).catch(() => {}) }, [])

  async function sendReminders() {
    setBusy(true)
    try {
      const r = await api('/api/reminders/run', { method: 'POST' })
      r.due === 0 ? toast.info('Nothing to send', 'No one checks in tomorrow, or they were already reminded.') : r.sent ? toast.success(`${r.sent} reminder${r.sent > 1 ? 's' : ''} sent`) : toast.info('Email is not set up yet', `${r.due} reminder${r.due > 1 ? 's are' : ' is'} waiting. Add Resend or SMTP settings.`)
    } catch (e) { toast.error('Could not send reminders', (e as Error).message) } finally { setBusy(false) }
  }

  return (
    <div>
      <div className="grid gap-1.5 sm:max-w-2xl">
        <SubHead>Staff calendar link</SubHead>
        <label htmlFor="cal-url" className="sr-only">Staff calendar link</label>
        <div className="flex gap-2">
          <Input id="cal-url" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500) }} disabled={!url}>{copied ? <CheckIcon /> : <CopyIcon />}{copied ? 'Copied' : 'Copy'}</Button>
        </div>
        <p className="text-xs text-muted-foreground">Every confirmed booking, kept up to date. In Google Calendar choose Other calendars, then From URL. On iPhone or Mac, add a calendar subscription. Anyone with this link can see guest names, so share it with staff only.</p>
        <div><Button variant="ghost" size="sm" onClick={() => setAsk(true)}><RefreshIcon />Make a new link</Button></div>
      </div>

      <div className="mt-8 grid gap-1.5 border-t pt-8 sm:max-w-2xl">
        <SubHead>Reminder emails</SubHead>
        <p className="text-xs text-muted-foreground">Each guest gets an email the evening before they check in, once the site is online. Use the button to send tomorrow's reminders right now.</p>
        <div><Button variant="outline" size="sm" loading={busy} onClick={sendReminders}><MailIcon />Send tomorrow's reminders</Button></div>
      </div>

      <AlertDialog open={ask} onOpenChange={setAsk} destructive title="Make a new calendar link?" description="The old link stops working. Anyone subscribed to it must add the new one." confirmLabel="Make new link" onConfirm={async () => { const r = await api('/api/settings/calendar-token', { method: 'POST' }); setUrl(r.calendar_url); toast.success('New link ready') }} />
    </div>
  )
}

function Shortcuts() {
  return (
    <div>
      <dl className="border-b">
        {SHORTCUTS.map((s) => (
          <div key={s.what} className="grid grid-cols-[8rem_1fr_auto] items-center gap-x-3 border-t py-3 text-sm first:border-t-2">
            <dt className="flex items-center gap-1">
              {s.keys.map((k, i) => <span key={k} className="flex items-center gap-1">{i > 0 && <span className="text-xs text-muted-foreground">{s.then ? 'then' : '+'}</span>}<Kbd>{k}</Kbd></span>)}
            </dt>
            <dd>{s.what}</dd>
            <dd className="text-xs text-muted-foreground">{s.where}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-grid min-w-6 place-items-center rounded-[4px] border border-b-2 bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{children}</kbd>
)

function RoomRow({ room, initial, currency, onDone, onCancel, onCopy, onDelete }: {
  room?: Room; initial: Fields; kinds?: string[]; currency?: string
  onDone: () => void; onCancel?: () => void; onCopy?: () => void; onDelete?: () => void
}) {
  const [f, setF] = useState(initial)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const dirty = !room || (Object.keys(initial) as (keyof Fields)[]).some((k) => f[k] !== initial[k])
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => { setF({ ...f, [k]: e.target.value }); setErr('') }
  const step = (n: number) => setF({ ...f, sleeps: String(Math.min(50, Math.max(1, (Number(f.sleeps) || 1) + n))) })

  async function save(e?: React.FormEvent) {
    e?.preventDefault()
    if (!dirty) return
    setBusy(true); setErr('')
    try {
      await api(room ? `/api/rooms/${room.id}` : '/api/rooms', {
        method: room ? 'PUT' : 'POST',
        json: { ...toApi(f), active: 1 },
      })
      toast.success(room ? `${f.name} saved` : `${f.name} added`); onDone()
    } catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }

  async function archive() {
    try { await api(`/api/rooms/${room!.id}`, { method: 'PUT', json: { ...toApi(initial), active: 0 } }); toast.success(`${room!.name} archived`, 'Restore it from the list at the bottom.'); onDone() }
    catch (x) { setErr((x as Error).message) }
  }

  const lab = 'text-xs text-muted-foreground md:sr-only'
  return (
    <li className={`border-t py-3 ${!room ? 'bg-accent/40 px-2 md:-mx-2' : ''}`}>
      <form onSubmit={save} className="grid grid-cols-2 items-end gap-x-3 gap-y-2 md:grid-cols-[1.4fr_1fr_8.5rem_9rem_auto] md:items-center" noValidate>
        <div className="col-span-2 grid gap-1 md:col-span-1">
          <label className={lab} htmlFor={`n${room?.id ?? 'new'}`}>Room name</label>
          <Input id={`n${room?.id ?? 'new'}`} value={f.name} onChange={set('name')} placeholder="Room name" autoFocus={!room} maxLength={60} aria-invalid={!!err && !f.name.trim()} />
        </div>
        <div className="col-span-2 grid gap-1 md:col-span-1">
          <label className={lab}>Type</label>
          <Input value={f.kind} onChange={set('kind')} list="room-kinds" placeholder="Type, e.g. Villa" maxLength={40} aria-label="Room type" />
        </div>
        <div className="grid gap-1">
          <span className={lab}>Max guests</span>
          <div className="flex items-center gap-1" role="group" aria-label="Max guests">
            <Button type="button" variant="outline" size="icon-sm" aria-label="One fewer guest" onClick={() => step(-1)} disabled={Number(f.sleeps) <= 1}><MinusIcon /></Button>
            <Input value={f.sleeps} onChange={set('sleeps')} inputMode="numeric" className="w-12 px-1 text-center" aria-label="Max guests" />
            <Button type="button" variant="outline" size="icon-sm" aria-label="One more guest" onClick={() => step(1)}><PlusIcon /></Button>
          </div>
        </div>
        <div className="grid gap-1">
          <label className={lab} htmlFor={`p${room?.id ?? 'new'}`}>{f.pricing === 'person' ? 'Price per person' : 'Price per night'} ({currency})</label>
          <Input id={`p${room?.id ?? 'new'}`} value={f.price} onChange={set('price')} inputMode="numeric" placeholder={f.pricing === 'person' ? 'Per person' : 'Per night'} />
        </div>
        <div className="col-span-2 flex min-h-8 items-center justify-end gap-1 md:col-span-1 md:w-[16.5rem]">
          {dirty ? (
            <>
              <Button type="button" size="sm" variant="ghost" onClick={() => (room ? setF(initial) : onCancel?.())}>{room ? 'Undo' : 'Cancel'}</Button>
              <Button type="submit" size="sm" loading={busy}>{room ? 'Save' : 'Add room'}</Button>
            </>
          ) : (
            <>
              <Button type="button" size="sm" variant="ghost" onClick={onCopy} title="Add another room like this one"><CopyIcon />Copy</Button>
              <Button type="button" size="sm" variant="ghost" onClick={archive}>Archive</Button>
              <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={onDelete}>Delete</Button>
            </>
          )}
        </div>
        <div className="col-span-full flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-dashed pt-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Charge</span>
            <Segmented value={f.pricing} onValueChange={(v) => { setF({ ...f, pricing: v }); setErr('') }} options={[{ value: 'room', label: 'Per room, per night' }, { value: 'person', label: 'Per person, per night' }]} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Extra mattress</span>
            <Input value={f.extra_price} onChange={set('extra_price')} inputMode="numeric" placeholder="Price a night" aria-label="Extra mattress price per night" className="w-32" />
            <span className="text-muted-foreground">up to</span>
            <div className="flex items-center gap-1" role="group" aria-label="Most extra mattresses">
              <Button type="button" variant="outline" size="icon-sm" aria-label="One fewer" disabled={Number(f.max_extra) <= 0} onClick={() => setF({ ...f, max_extra: String(Math.max(0, (Number(f.max_extra) || 0) - 1)) })}><MinusIcon /></Button>
              <span className="w-6 text-center" data-tabular>{f.max_extra || 0}</span>
              <Button type="button" variant="outline" size="icon-sm" aria-label="One more" disabled={Number(f.max_extra) >= 10} onClick={() => setF({ ...f, max_extra: String((Number(f.max_extra) || 0) + 1) })}><PlusIcon /></Button>
            </div>
          </div>
        </div>
      </form>
      {err && <p role="alert" className="pt-2 text-sm text-destructive">{err}</p>}
    </li>
  )
}

function ResortName({ current, onSaved }: { current: string; onSaved: (n: string) => void }) {
  const [v, setV] = useState(current)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  useEffect(() => setV(current), [current])
  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr('')
    try { const r = await api('/api/settings', { method: 'PUT', json: { resort: v } }); onSaved(r.resort); toast.success('Name saved', 'Guests will see it in emails and on their booking page.') }
    catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }
  return (
    <form onSubmit={save} className="grid gap-1.5 sm:max-w-xl" noValidate>
      <label htmlFor="resort-name" className="text-sm font-semibold">Resort name</label>
      <div className="flex gap-2">
        <Input id="resort-name" value={v} onChange={(e) => { setV(e.target.value); setErr('') }} maxLength={60} aria-invalid={!!err} />
        <Button type="submit" loading={busy} disabled={v.trim() === current}>Save</Button>
      </div>
      {err && <p role="alert" className="text-xs text-destructive">{err}</p>}
    </form>
  )
}
