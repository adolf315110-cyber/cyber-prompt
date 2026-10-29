import { useMemo, useState } from 'react'
import type { UiStrings } from '../lib/i18n'
import { CATEGORIES, type Card } from '../types'
import { CardItem } from './CardItem'
import { MyCardsList } from './MyCardsList'

interface Props {
  cards: Card[]
  onInsert: (card: Card) => void
  onNewCard: () => void
  onCopyToCustom: (card: Card) => void
  onEditCard: (card: Card) => void
  onDeleteCard: (card: Card) => void
  ui: UiStrings
}

type LibTab = 'preset' | 'mine'

/** 左栏：搜索 + 分栏（预置卡库 / 我的卡片）+ 点击插入 */
export function CardLibrary({ cards, onInsert, onNewCard, onCopyToCustom, onEditCard, onDeleteCard, ui }: Props) {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [tab, setTab] = useState<LibTab>('preset')

  const preset = useMemo(() => cards.filter((c) => c.builtin), [cards])
  const mine = useMemo(() => cards.filter((c) => !c.builtin), [cards])
  const source = tab === 'preset' ? preset : mine

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return source
    return source.filter((c) => [c.title, c.text, ...c.tags].some((s) => s.toLowerCase().includes(q)))
  }, [source, query])

  const groups = useMemo(
    () => CATEGORIES.map((cat) => ({ ...cat, items: filtered.filter((c) => c.category === cat.id) })),
    [filtered],
  )

  const searching = query.trim().length > 0

  return (
    <aside className="pane card-library">
      <div className="pane-head">
        <h2>{ui.library}</h2>
        <span className="muted">
          {searching ? ui.filteredCount(filtered.length, source.length) : ui.cardCount(source.length)}
        </span>
      </div>
      <input
        className="search"
        type="search"
        placeholder={ui.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="lib-tabs">
        <button
          type="button"
          className={tab === 'preset' ? 'active' : ''}
          aria-pressed={tab === 'preset'}
          onClick={() => setTab('preset')}
        >
          {ui.presetTab}
          <span className="muted">{preset.length}</span>
        </button>
        <button
          type="button"
          className={tab === 'mine' ? 'active' : ''}
          aria-pressed={tab === 'mine'}
          onClick={() => setTab('mine')}
        >
          {ui.myCardsTab}
          <span className="muted">{mine.length}</span>
        </button>
        {tab === 'mine' && (
          <button type="button" className="lib-new" onClick={onNewCard}>
            + {ui.newCard}
          </button>
        )}
      </div>

      {tab === 'mine' ? (
        <div className="card-groups">
          <MyCardsList cards={filtered} onInsert={onInsert} onEdit={onEditCard} onDelete={onDeleteCard} ui={ui} />
        </div>
      ) : (
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
                      <CardItem key={card.id} card={card} onInsert={onInsert} onCopyToCustom={onCopyToCustom} ui={ui} />
                    ))}
                    {g.items.length === 0 && searching && <p className="muted empty">{ui.noMatches}</p>}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </aside>
  )
}
