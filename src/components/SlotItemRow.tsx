import type { Dispatch } from 'react'
import { hasUnresolvedVars } from '../lib/cardUtils'
import { renderCardText } from '../lib/compose'
import type { UiStrings } from '../lib/i18n'
import type { AppAction } from '../lib/reducer'
import type { Card, Mode, SlotItem } from '../types'

interface Props {
  item: SlotItem
  card: Card | undefined
  slot: Mode
  index: number
  count: number
  dispatch: Dispatch<AppAction>
  highlight: boolean
  ui: UiStrings
}

/** 拼装区里的一张已插入卡：启停/上移/下移/移除 + 变量内联输入 */
export function SlotItemRow({ item, card, slot, index, count, dispatch, highlight, ui }: Props) {
  const rendered = card ? renderCardText(card, item.vars) : ''
  const hasVars = Boolean(card && card.vars.length > 0)

  return (
    <div className={`slot-item${item.enabled ? '' : ' disabled'}${highlight ? ' flash' : ''}`}>
      <div className="slot-main">
        <span className="slot-title" title={rendered}>
          {card ? card.title : ui.cardDeleted}
        </span>
        <div className="slot-actions">
          <button
            type="button"
            title={item.enabled ? ui.disable : ui.enable}
            onClick={() => dispatch({ type: 'toggleItem', slot, instanceId: item.instanceId })}
          >
            {item.enabled ? '⏸' : '▶'}
          </button>
          <button
            type="button"
            title={ui.moveUp}
            disabled={index === 0}
            onClick={() => dispatch({ type: 'moveItem', slot, instanceId: item.instanceId, direction: -1 })}
          >
            ↑
          </button>
          <button
            type="button"
            title={ui.moveDown}
            disabled={index === count - 1}
            onClick={() => dispatch({ type: 'moveItem', slot, instanceId: item.instanceId, direction: 1 })}
          >
            ↓
          </button>
          <button
            type="button"
            title={ui.remove}
            onClick={() => dispatch({ type: 'removeItem', slot, instanceId: item.instanceId })}
          >
            ×
          </button>
        </div>
      </div>
      {hasVars && card && (
        <div className="slot-vars">
          {card.vars.map((v) => (
            <label key={v.name} className="var-field">
              <span>{v.name}</span>
              <input
                type="text"
                value={item.vars[v.name] ?? ''}
                placeholder={v.default ?? v.name}
                onChange={(e) =>
                  dispatch({ type: 'setVar', slot, instanceId: item.instanceId, name: v.name, value: e.target.value })
                }
              />
            </label>
          ))}
        </div>
      )}
      {hasVars && hasUnresolvedVars(rendered) && <p className="slot-warn">{ui.unresolvedHint}</p>}
    </div>
  )
}
