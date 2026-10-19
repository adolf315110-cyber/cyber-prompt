import type { Dispatch } from 'react'
import type { UiStrings } from '../lib/i18n'
import type { AppAction } from '../lib/reducer'
import type { Card, Mode, SlotItem } from '../types'
import { SlotItemRow } from './SlotItemRow'

interface Props {
  mode: Mode
  title: string
  items: SlotItem[]
  cardsById: Map<string, Card>
  dispatch: Dispatch<AppAction>
  highlightInstanceId: string | null
  ui: UiStrings
}

/** 单个槽位：标题 + 实例列表 */
export function SlotSection({ mode, title, items, cardsById, dispatch, highlightInstanceId, ui }: Props) {
  return (
    <div className="slot">
      <div className="slot-head">
        <h3>{title}</h3>
        <span className="muted">{items.length > 0 ? ui.slotCount(items.length) : ui.slotEmpty[mode]}</span>
      </div>
      {items.map((item, index) => (
        <SlotItemRow
          key={item.instanceId}
          item={item}
          card={cardsById.get(item.cardId)}
          slot={mode}
          index={index}
          count={items.length}
          dispatch={dispatch}
          highlight={item.instanceId === highlightInstanceId}
          ui={ui}
        />
      ))}
    </div>
  )
}
