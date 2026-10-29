import { useEffect, type ReactNode } from 'react'

interface Props {
  title: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

/** 通用弹窗外壳：遮罩点击关闭、Esc 关闭、内容区不冒泡 */
export function Modal({ title, closeLabel, onClose, children, footer }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-mask" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose} title={closeLabel} aria-label={closeLabel}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}
