import { useEffect, useState } from 'react'

/** Tiny history router: the URL is the source of truth, so back, forward and reload all work. */
export function go(to: string, replace = false) {
  history[replace ? 'replaceState' : 'pushState'](null, '', to)
  dispatchEvent(new Event('nav'))
}

export function useLocation() {
  const read = () => ({ path: location.pathname, params: new URLSearchParams(location.search) })
  const [loc, setLoc] = useState(read)
  useEffect(() => {
    const f = () => setLoc(read())
    addEventListener('popstate', f); addEventListener('nav', f)
    return () => { removeEventListener('popstate', f); removeEventListener('nav', f) }
  }, [])
  return loc
}

/** Link that navigates without a reload (still a real <a>: middle-click and copy-link work). */
export function onLink(e: React.MouseEvent<HTMLAnchorElement>) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
  e.preventDefault()
  go(e.currentTarget.getAttribute('href')!)
}
