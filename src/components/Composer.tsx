import type { Dispatch } from 'react'
import type { UiStrings } from '../lib/i18n'
import type { AppAction } from '../lib/reducer'
import type { Card, ComposeState } from '../types'
import { SlotSection } from './SlotSection'

interface Props {
  compose: ComposeState
  cardsById: Map<string, Card>
  dispatch: Dispatch<AppAction>
  highlightInstanceId: string | null
  ui: UiStrings
}

/** 中栏：基础句 + 三个槽位 */
export function Composer({ compose, cardsById, dispatch, highlightInstanceId, ui }: Props) {
  const isEmpty =
    compose.baseSentence.trim() === '' &&
    compose.slots.prefix.length === 0 &&
    compose.slots.suffix.length === 0 &&
    compose.slots.block.length === 0

  return (
    <section className="pane composer">
      <div className="pane-head">
        <h2>{ui.composerTitle}</h2>
        {isEmpty && <span className="muted">{ui.composerEmpty}</span>}
      </div>
      <label className="base-label" htmlFor="base-sentence">
        {ui.baseSentence}
      </label>
      <textarea
        id="base-sentence"
        className="base-input"
        rows={3}
        placeholder={ui.baseSentencePlaceholder}
        value={compose.baseSentence}
        onChange={(e) => dispatch({ type: 'setBaseSentence', text: e.target.value })}
      />
      <SlotSection
        mode="prefix"
        title={ui.slotTitles.prefix}
        items={compose.slots.prefix}
        cardsById={cardsById}
        dispatch={dispatch}
        highlightInstanceId={highlightInstanceId}
        ui={ui}
      />
      <SlotSection
        mode="suffix"
        title={ui.slotTitles.suffix}
        items={compose.slots.suffix}
        cardsById={cardsById}
        dispatch={dispatch}
        highlightInstanceId={highlightInstanceId}
        ui={ui}
      />
      <SlotSection
        mode="block"
        title={ui.slotTitles.block}
        items={compose.slots.block}
        cardsById={cardsById}
        dispatch={dispatch}
        highlightInstanceId={highlightInstanceId}
        ui={ui}
      />
    </section>
  )
}
