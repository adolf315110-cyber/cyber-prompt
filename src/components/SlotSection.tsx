import type { Dispatch } from 'react'
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
}

const EMPTY_HINT: Record<Mode, string> = {
  prefix: '插入「前缀」卡会出现在这里（句子前段）',
  suffix: '插入「后缀」卡会出现在这里（接在句尾）',
  block: '插入「段落」卡会出现在这里（附在最后）',
}

/** 单个槽位：标题 + 实例列表 */
export function SlotSection({ mode, title, items, cardsById, dispatch, highlightInstanceId }: Props) {
  return (
    <div className="slot">
      <div className="slot-head">
        <h3>{title}</h3>
        <span className="muted">{items.length > 0 ? `${items.length} 张` : EMPTY_HINT[mode]}</span>
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
        />
      ))}
    </div>
  )
}
