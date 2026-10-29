import type { UiStrings } from '../lib/i18n'
import type { Card } from '../types'

interface Props {
  card: Card
  onInsert: (card: Card) => void
  /** 提供时显示「复制为自定义」按钮（仅预置卡有） */
  onCopyToCustom?: (card: Card) => void
  copyLabel?: string
  ui: UiStrings
}

/** 单张卡片：点击插入；悬停显示全文与备注 */
export function CardItem({ card, onInsert, onCopyToCustom, copyLabel, ui }: Props) {
  return (
    <div className="card-item">
      <button type="button" className="card-btn" onClick={() => onInsert(card)}>
        <span className="card-title">{card.title}</span>
        <span className="card-badges">
          <span className={`badge mode-${card.mode}`}>{ui.modeLabels[card.mode]}</span>
          {card.vars.length > 0 && <span className="badge vars">{ui.varsBadge}</span>}
        </span>
      </button>
      {onCopyToCustom && (
        <button
          type="button"
          className="card-copy"
          onClick={() => onCopyToCustom(card)}
          title={copyLabel ?? ui.copyToCustom}
          aria-label={copyLabel ?? ui.copyToCustom}
        >
          ⧉
        </button>
      )}
      <div className="card-tip" role="tooltip">
        <p className="tip-text">{card.text}</p>
        {card.note && <p className="tip-note">{card.note}</p>}
        <p className="tip-hint">{ui.clickToInsert}</p>
      </div>
    </div>
  )
}
