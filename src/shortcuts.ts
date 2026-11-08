/** One list drives both the key handler (Board.tsx) and the table in Settings, so they cannot drift apart. */
export const SHORTCUTS: { keys: string[]; then?: boolean; what: string; where: string }[] = [
  { keys: ['N'], what: 'Start a new booking', where: 'Anywhere' },
  { keys: ['Ctrl', 'K'], what: 'Search guests, jump to a page', where: 'Anywhere' },
  { keys: ['G', 'T'], then: true, what: 'Go to Today', where: 'Anywhere' },
  { keys: ['G', 'B'], then: true, what: 'Go to the Board', where: 'Anywhere' },
  { keys: ['G', 'H'], then: true, what: 'Go to History', where: 'Anywhere' },
  { keys: ['G', 'A'], then: true, what: 'Go to Activity', where: 'Anywhere' },
  { keys: ['G', 'S'], then: true, what: 'Go to Settings', where: 'Anywhere' },
  { keys: ['←'], what: 'Show the previous week', where: 'Board' },
  { keys: ['→'], what: 'Show the next week', where: 'Board' },
  { keys: ['T'], what: 'Jump to this week', where: 'Board' },
  { keys: ['/'], what: 'Search bookings', where: 'History' },
  { keys: ['?'], what: 'Show this list', where: 'Anywhere' },
  { keys: ['Esc'], what: 'Close a window', where: 'Windows' },
]
