import { useState } from 'react'
import { api } from './api'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr('')
    try { await api('/api/login', { method: 'POST', json: { email, password } }); onDone() }
    catch (x) { setErr((x as Error).message) }
    finally { setBusy(false) }
  }

  return (
    <main className="grid min-h-dvh md:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-foreground text-background md:block" aria-hidden>
        <svg viewBox="0 0 600 800" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
          {/* low tide: shore lines drawn as slightly uneven strokes */}
          {Array.from({ length: 16 }, (_, i) => {
            const y = 360 + i * 26
            const w = 14 + (i % 3) * 5
            return <path key={i} d={`M-10 ${y} q ${80 + w} ${-w} 160 0 t 160 0 t 160 0 t 160 ${i % 2 ? 3 : -2}`} fill="none" stroke="#7fc5c4" strokeOpacity={0.9 - i * 0.052} strokeWidth={i < 2 ? 2.4 : 1.4} />
          })}
          <circle cx="430" cy="210" r="62" fill="#e9c27a" />
          <path d="M0 640 q 120 -30 240 -6 t 360 -18 V800 H0z" fill="#0a1f25" opacity=".7" />
        </svg>
        <div className="absolute bottom-10 left-10 right-10">
          <p className="font-display text-4xl leading-tight">Rooms, dates,<br />one clear board.</p>
        </div>
      </section>
      <section className="grid place-items-center px-6 py-12">
        <form onSubmit={submit} className="grid w-full max-w-sm gap-5" noValidate>
          <div>
            <h1 className="font-display text-3xl font-semibold">Staff sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Use the admin email and password set for this resort.</p>
          </div>
          <Field label="Email" required>
            <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </Field>
          <Field label="Password" required error={err}>
            <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!err} />
          </Field>
          <Button type="submit" loading={busy} size="lg">Sign in</Button>
        </form>
      </section>
    </main>
  )
}
