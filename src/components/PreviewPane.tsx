import type { ReactNode } from 'react'
import { VAR_EXACT_PATTERN, VAR_SPLIT_PATTERN } from '../lib/cardUtils'

interface Props {
  text: string
  manual: boolean
  unresolved: boolean
  onManualChange: (text: string | null) => void
  onCopy: () => void
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
export function PreviewPane({ text, manual, unresolved, onManualChange, onCopy }: Props) {
  const isEmpty = text.trim() === ''

  return (
    <section className="pane preview">
      <div className="pane-head">
        <h2>预览</h2>
        {unresolved && !manual && <span className="warn">有未填变量</span>}
        {manual && <span className="muted">手动微调中，不再自动同步</span>}
      </div>
      {manual ? (
        <textarea
          className="preview-edit"
          value={text}
          onChange={(e) => onManualChange(e.target.value)}
          placeholder="在这里微调最终文本"
        />
      ) : (
        <pre className="preview-text">
          {isEmpty ? (
            <span className="muted">拼装结果会显示在这里：输入基础句，或点左侧卡片</span>
          ) : (
            renderWithHighlights(text)
          )}
        </pre>
      )}
      <div className="preview-actions">
        <button type="button" className="primary" onClick={onCopy} disabled={isEmpty}>
          复制
        </button>
        {manual ? (
          <button type="button" onClick={() => onManualChange(null)}>
            ⟳ 与拼装同步
          </button>
        ) : (
          <button type="button" onClick={() => onManualChange(text)} disabled={isEmpty}>
            手动微调
          </button>
        )}
      </div>
    </section>
  )
}
