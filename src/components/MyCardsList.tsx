import type { UiStrings } from '../lib/i18n'
import { CATEGORIES, type Card } from '../types'

interface Props {
  cards: Card[]
  onInsert: (card: Card) => void
  onEdit: (card: Card) => void
  onDelete: (card: Card) => void
  ui: UiStrings
}

/** 「我的卡片」列表：按分类分组，每行可插入 / 编辑 / 删除 */
export function MyCardsList({ cards, onInsert, onEdit, onDelete, ui }: Props) {
  if (cards.length === 0) {
    return <p className="muted empty">{ui.noUserCards}</p>
  }

  return (
    <div className="my-cards">
      {CATEGORIES.map((cat) => {
        const items = cards.filter((c) => c.category === cat.id)
        if (items.length === 0) return null
        return (
          <section key={cat.id} className="my-group">
            <h3 className="my-group-head">
              {ui.categoryLabels[cat.id]}
              <span className="muted">{items.length}</span>
            </h3>
            {items.map((card) => (
              <div key={card.id} className="my-card">
                <button type="button" className="my-card-main" onClick={() => onInsert(card)}>
                  <span className="my-card-top">
                    <span className="my-card-title">{card.title}</span>
                    <span className="card-badges">
                      <span className={`badge mode-${card.mode}`}>{ui.modeLabels[card.mode]}</span>
                      {card.vars.length > 0 && <span className="badge vars">{ui.varsBadge}</span>}
                    </span>
                  </span>
                  <span className="my-card-text">{card.text}</span>
                </button>
                <div className="my-card-actions">
                  <button type="button" onClick={() => onEdit(card)} title={ui.editCard}>
                    ✎
                  </button>
                  <button type="button" onClick={() => onDelete(card)} title={ui.deleteCard}>
                    ×
                  </button>
                </div>
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}
