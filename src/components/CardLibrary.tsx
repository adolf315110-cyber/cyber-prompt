import { useMemo, useState } from 'react'
import type { UiStrings } from '../lib/i18n'
import { CATEGORIES, type Card } from '../types'
import { CardItem } from './CardItem'

interface Props {
  cards: Card[]
  onInsert: (card: Card) => void
  ui: UiStrings
}

/** 左栏：搜索 + 分类分组 + 点击插入 */
export function CardLibrary({ cards, onInsert, ui }: Props) {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cards
    return cards.filter((c) => [c.title, c.text, ...c.tags].some((s) => s.toLowerCase().includes(q)))
  }, [cards, query])

  const groups = useMemo(
    () => CATEGORIES.map((cat) => ({ ...cat, items: filtered.filter((c) => c.category === cat.id) })),
    [filtered],
  )

  const searching = query.trim().length > 0

  return (
    <aside className="pane card-library">
      <div className="pane-head">
        <h2>{ui.library}</h2>
        <span className="muted">{searching ? ui.filteredCount(filtered.length, cards.length) : ui.cardCount(cards.length)}</span>
      </div>
      <input
        className="search"
        type="search"
        placeholder={ui.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="card-groups">
        {groups.map((g) => {
          const isCollapsed = searching ? false : Boolean(collapsed[g.id])
          return (
            <section key={g.id} className="card-group">
              <button
                type="button"
                className="group-head"
                onClick={() => setCollapsed((prev) => ({ ...prev, [g.id]: !prev[g.id] }))}
              >
                <span className="chev">{isCollapsed ? '▸' : '▾'}</span>
                {ui.categoryLabels[g.id]}
                <span className="muted">{g.items.length}</span>
              </button>
              {!isCollapsed && (
                <div className="card-grid">
                  {g.items.map((card) => (
                    <CardItem key={card.id} card={card} onInsert={onInsert} ui={ui} />
                  ))}
                  {g.items.length === 0 && searching && <p className="muted empty">{ui.noMatches}</p>}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </aside>
  )
}
