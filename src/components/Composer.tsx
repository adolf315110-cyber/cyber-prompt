import type { Dispatch } from 'react'
import type { AppAction } from '../lib/reducer'
import type { Card, ComposeState } from '../types'
import { SlotSection } from './SlotSection'

interface Props {
  compose: ComposeState
  cardsById: Map<string, Card>
  dispatch: Dispatch<AppAction>
  highlightInstanceId: string | null
}

/** 中栏：基础句 + 三个槽位 */
export function Composer({ compose, cardsById, dispatch, highlightInstanceId }: Props) {
  const isEmpty =
    compose.baseSentence.trim() === '' &&
    compose.slots.prefix.length === 0 &&
    compose.slots.suffix.length === 0 &&
    compose.slots.block.length === 0

  return (
    <section className="pane composer">
      <div className="pane-head">
        <h2>拼装区</h2>
        {isEmpty && <span className="muted">点左边任意卡片开始拼装</span>}
      </div>
      <label className="base-label" htmlFor="base-sentence">
        基础句
      </label>
      <textarea
        id="base-sentence"
        className="base-input"
        rows={3}
        placeholder="例：帮我审计这段代码"
        value={compose.baseSentence}
        onChange={(e) => dispatch({ type: 'setBaseSentence', text: e.target.value })}
      />
      <SlotSection
        mode="prefix"
        title="前缀区"
        items={compose.slots.prefix}
        cardsById={cardsById}
        dispatch={dispatch}
        highlightInstanceId={highlightInstanceId}
      />
      <SlotSection
        mode="suffix"
        title="后缀区"
        items={compose.slots.suffix}
        cardsById={cardsById}
        dispatch={dispatch}
        highlightInstanceId={highlightInstanceId}
      />
      <SlotSection
        mode="block"
        title="段落区"
        items={compose.slots.block}
        cardsById={cardsById}
        dispatch={dispatch}
        highlightInstanceId={highlightInstanceId}
      />
    </section>
  )
}
