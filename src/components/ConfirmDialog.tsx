import type { ReactNode } from 'react'
import { Modal } from './Modal'

interface Props {
  title: string
  message: ReactNode
  confirmLabel: string
  cancelLabel: string
  closeLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** 二次确认弹窗：破坏性操作（还原/删除/清空/导入）统一走这里 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  closeLabel,
  danger,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      title={title}
      closeLabel={closeLabel}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
        </>
      }
    >
      <div className="confirm-message">{message}</div>
    </Modal>
  )
}
