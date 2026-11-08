import { useEffect, useState } from 'react'
import { api } from './api'
import { go, useLocation } from './nav'
import { Login } from './Login'
import { Board } from './Board'
import { History } from './History'
import { Settings } from './Settings'
import { Today } from './Today'
import { Activity } from './Activity'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Guest } from './Guest'
import { Toaster } from '@/components/ui/toast'

type Me = { resort: string; currency: string }

export default function App() {
  const { path, params } = useLocation()
  const guest = /^\/b\/([a-f0-9]{32})$/.exec(path)
  const [me, setMe] = useState<Me | null | 'out'>(null)
  useEffect(() => { if (!guest && me === null) api('/api/me').then(setMe).catch(() => setMe('out')) }, [guest, me])

  // route guards: signed out goes to /login (remembering where you were), signed in never sees /login, unknown paths go to /board
  useEffect(() => {
    if (guest || me === null) return
    if (me === 'out' && path !== '/login') go(`/login?next=${encodeURIComponent(path + location.search)}`, true)
    else if (me !== 'out' && !['/today', '/board', '/history', '/activity', '/settings'].includes(path)) go(path === '/login' ? (/^\/(?!\/)/.test(params.get('next') ?? '') ? params.get('next')! : '/today') : '/today', true)
  }, [guest, me, path, params])

  const logout = () => { setMe('out') }
  let page = null
  if (guest) page = <Guest token={guest[1]} />
  else if (me === 'out') page = path === '/login' ? <Login onDone={() => api('/api/me').then(setMe)} /> : null
  else if (me) page = <Board me={me} path={path} onLogout={logout} onRename={(resort) => setMe({ ...me, resort })}>{path === '/today' && <Today currency={me.currency} />}{path === '/history' && <History params={params} currency={me.currency} />}{path === '/activity' && <Activity params={params} currency={me.currency} />}{path === '/settings' && <Settings currency={me.currency} />}</Board>
  return <TooltipProvider>{page}<Toaster /></TooltipProvider>
}
