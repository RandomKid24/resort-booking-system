/** Shared page structure: one big page title, then sections with a titled bar, a plain description and heavy dividers. */
export function PageHeader({ title, description, children }: { title: string; description?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end gap-x-6 gap-y-3 pb-6">
      <div className="mr-auto min-w-0">
        <h2 className="font-display text-3xl font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </header>
  )
}

/** A section. `lg` is a main block of the page, `sm` a smaller group inside a page. */
export function Block({ id, title, description, action, size = 'lg', children }: { id?: string; title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; size?: 'lg' | 'sm'; children: React.ReactNode }) {
  const lg = size === 'lg'
  const hid = id ? `${id}-h` : undefined
  const Heading = lg ? 'h2' : 'h3'
  return (
    <section id={id} aria-labelledby={hid} className={`scroll-mt-6 ${lg ? 'py-10' : 'py-7'}`}>
      <div className={`flex flex-wrap items-end gap-x-6 gap-y-3 ${lg ? 'pb-6' : 'pb-4'}`}>
        <div className="mr-auto max-w-2xl border-l-4 border-primary pl-3">
          <Heading id={hid} className={`font-display leading-tight font-semibold text-foreground ${lg ? 'text-2xl' : 'text-lg'}`}>{title}</Heading>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export const SubHead = ({ children }: { children: React.ReactNode }) => <h3 className="pb-3 text-base font-semibold text-foreground">{children}</h3>
