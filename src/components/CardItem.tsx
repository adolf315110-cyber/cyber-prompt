import type { UiStrings } from '../lib/i18n'
import type { Card } from '../types'

interface Props {
  card: Card
  onInsert: (card: Card) => void
  ui: UiStrings
}

/** 单张卡片：点击插入；悬停显示全文与备注 */
export function CardItem({ card, onInsert, ui }: Props) {
  return (
    <div className="card-item">
      <button type="button" className="card-btn" onClick={() => onInsert(card)} title={ui.clickToInsert}>
        <span className="card-title">{card.title}</span>
        <span className="card-badges">
          <span className={`badge mode-${card.mode}`}>{ui.modeLabels[card.mode]}</span>
          {card.vars.length > 0 && <span className="badge vars">{ui.varsBadge}</span>}
        </span>
      </button>
      <div className="card-tip" role="tooltip">
        <p className="tip-text">{card.text}</p>
        {card.note && <p className="tip-note">{card.note}</p>}
      </div>
    </div>
  )
}
