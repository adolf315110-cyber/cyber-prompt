import { useRef } from 'react'
import type { UiStrings } from '../lib/i18n'
import { Modal } from './Modal'

interface Props {
  onExport: () => void
  onImport: (file: File) => void
  onClear: () => void
  onClose: () => void
  ui: UiStrings
}

/** 数据管理弹窗：导出 / 导入 / 清空本地数据 */
export function DataDialog({ onExport, onImport, onClear, onClose, ui }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <Modal title={ui.dataTitle} closeLabel={ui.close} onClose={onClose}>
      <div className="data-actions">
        <button type="button" onClick={onExport}>
          {ui.exportData}
        </button>
        <button type="button" onClick={() => fileRef.current?.click()}>
          {ui.importData}
        </button>
        <button type="button" className="danger-ghost" onClick={onClear}>
          {ui.clearData}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden-file"
        aria-label={ui.importData}
        onChange={(e) => {
          const file = e.target.files?.[0]
          // 重置 value，才能连续导入同一个文件
          e.target.value = ''
          if (file) onImport(file)
        }}
      />
    </Modal>
  )
}
