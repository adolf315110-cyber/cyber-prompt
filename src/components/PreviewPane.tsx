import type { ReactNode } from 'react'
import { VAR_EXACT_PATTERN, VAR_SPLIT_PATTERN } from '../lib/cardUtils'
import type { UiStrings } from '../lib/i18n'

interface Props {
  text: string
  manual: boolean
  unresolved: boolean
  onManualChange: (text: string | null) => void
  onCopy: () => void
  ui: UiStrings
}

/** 未填变量高亮：把 {xxx} 渲染成 <mark> */
function renderWithHighlights(text: string): ReactNode[] {
  return text.split(VAR_SPLIT_PATTERN).map((part, i) =>
    VAR_EXACT_PATTERN.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>,
  )
}

/**
 * 右栏：实时预览 / 手动微调 / 复制。
 * - 自动模式：派生文本渲染（只读），未填变量高亮
 * - 手动模式：可编辑 textarea；「⟳ 与拼装同步」退出并回到自动模式
 */
export function PreviewPane({ text, manual, unresolved, onManualChange, onCopy, ui }: Props) {
  const isEmpty = text.trim() === ''

  return (
    <section className="pane preview">
      <div className="pane-head">
        <h2>{ui.previewTitle}</h2>
        {unresolved && !manual && <span className="warn">{ui.unfilledVars}</span>}
        {manual && <span className="muted">{ui.manualSyncOff}</span>}
      </div>
      {manual ? (
        <textarea
          className="preview-edit"
          value={text}
          onChange={(e) => onManualChange(e.target.value)}
          placeholder={ui.manualPlaceholder}
        />
      ) : (
        <pre className="preview-text">
          {isEmpty ? (
            <span className="muted">{ui.previewEmpty}</span>
          ) : (
            renderWithHighlights(text)
          )}
        </pre>
      )}
      <div className="preview-actions">
        <button type="button" className="primary" onClick={onCopy} disabled={isEmpty}>
          {ui.copy}
        </button>
        {manual ? (
          <button type="button" onClick={() => onManualChange(null)}>
            {ui.sync}
          </button>
        ) : (
          <button type="button" onClick={() => onManualChange(text)} disabled={isEmpty}>
            {ui.manualEdit}
          </button>
        )}
      </div>
    </section>
  )
}
