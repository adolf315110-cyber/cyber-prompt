import { MODE_LABELS, type Card } from '../types'

interface Props {
  card: Card
  onInsert: (card: Card) => void
}

/** 单张卡片：点击插入；悬停显示全文与备注 */
export function CardItem({ card, onInsert }: Props) {
  return (
    <div className="card-item">
      <button type="button" className="card-btn" onClick={() => onInsert(card)} title="点击插入">
        <span className="card-title">{card.title}</span>
        <span className="card-badges">
          <span className={`badge mode-${card.mode}`}>{MODE_LABELS[card.mode]}</span>
          {card.vars.length > 0 && <span className="badge vars">变量</span>}
        </span>
      </button>
      <div className="card-tip" role="tooltip">
        <p className="tip-text">{card.text}</p>
        {card.note && <p className="tip-note">{card.note}</p>}
      </div>
    </div>
  )
}
