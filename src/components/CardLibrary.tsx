import { useMemo, useState } from 'react'
import { CATEGORIES, type Card } from '../types'
import { CardItem } from './CardItem'

interface Props {
  cards: Card[]
  onInsert: (card: Card) => void
}

/** 左栏：搜索 + 分类分组 + 点击插入 */
export function CardLibrary({ cards, onInsert }: Props) {
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
        <h2>卡库</h2>
        <span className="muted">{searching ? `${filtered.length} / ${cards.length} 张` : `${cards.length} 张`}</span>
      </div>
      <input
        className="search"
        type="search"
        placeholder="搜索卡片（标题 / 内容 / 标签）"
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
                {g.label}
                <span className="muted">{g.items.length}</span>
              </button>
              {!isCollapsed && (
                <div className="card-grid">
                  {g.items.map((card) => (
                    <CardItem key={card.id} card={card} onInsert={onInsert} />
                  ))}
                  {g.items.length === 0 && searching && <p className="muted empty">没有匹配的卡片</p>}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </aside>
  )
}
