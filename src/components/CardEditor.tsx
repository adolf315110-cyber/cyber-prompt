import { useMemo, useState } from 'react'
import {
  extractVarNames,
  normalizeTags,
  readVar,
  toSingleLine,
  USER_CARD_LIMITS,
  validateCard,
  withVarDefault,
} from '../lib/cardUtils'
import type { UiStrings } from '../lib/i18n'
import { CATEGORIES, type Card, type Mode } from '../types'
import { Modal } from './Modal'

interface Props {
  /** 表单初始值（新建时为空白草稿，复制时为预置卡的副本） */
  initial: Card
  /** 非 null 表示在编辑一张已存在的卡（表单会显示删除按钮） */
  existing: Card | null
  onSave: (card: Card) => void
  onDelete: (card: Card) => void
  onCancel: () => void
  ui: UiStrings
}

const MODES: Mode[] = ['prefix', 'suffix', 'block']

/**
 * 用户自定义卡编辑器。
 * 变量从正文自动提取：正文里出现 {x} 就生成一个变量输入框，
 * 删掉占位符则该变量随之消失（存盘时只保留正文里真实出现的变量）。
 */
export function CardEditor({ initial, existing, onSave, onDelete, onCancel, ui }: Props) {
  const [title, setTitle] = useState(initial.title)
  const [category, setCategory] = useState(initial.category)
  const [mode, setMode] = useState<Mode>(initial.mode)
  const [text, setText] = useState(initial.text)
  const [tagsInput, setTagsInput] = useState(initial.tags.join('，'))
  const [varDefaults, setVarDefaults] = useState<Record<string, string>>(() =>
    // null 原型：变量名若是 __proto__ / constructor，普通对象会命中原型链
    Object.assign(Object.create(null) as Record<string, string>, {
      ...Object.fromEntries(initial.vars.map((v) => [v.name, v.default ?? ''])),
    }),
  )

  const varNames = useMemo(() => extractVarNames(text), [text])
  const tags = useMemo(() => normalizeTags(tagsInput), [tagsInput])

  const draft: Card = {
    ...initial,
    title: title.trim(),
    category,
    mode,
    text: text.trim(),
    tags,
    vars: varNames.map((name) => {
      // 必须走 readVar：变量名可能是 constructor / __proto__，直读会命中原型链拿到函数
      const raw = readVar(varDefaults, name)
      const d = (typeof raw === 'string' ? raw : '').trim()
      return d ? { name, default: d } : { name }
    }),
    builtin: false,
  }

  const issues = validateCard(draft)

  const handleSave = () => {
    if (issues.length > 0) return
    onSave(draft)
  }

  return (
    <Modal
      title={existing ? ui.editorEditTitle : ui.editorNewTitle}
      closeLabel={ui.close}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="primary" onClick={handleSave} disabled={issues.length > 0}>
            {ui.save}
          </button>
          <button type="button" onClick={onCancel}>
            {ui.cancel}
          </button>
          {existing && (
            <button type="button" className="danger-ghost" onClick={() => onDelete(existing)}>
              {ui.deleteCard}
            </button>
          )}
        </>
      }
    >
      {issues.length > 0 && (
        <ul className="form-errors">
          {issues.map((issue) => (
            <li key={issue}>{ui.formErrors[issue]}</li>
          ))}
        </ul>
      )}

      <label className="form-field">
        <span className="form-label">
          {ui.fieldTitle}
          <span className="counter">
            {title.trim().length}/{USER_CARD_LIMITS.titleMax}
          </span>
        </span>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={ui.fieldTitle} />
      </label>

      <div className="form-row">
        <label className="form-field">
          <span className="form-label">{ui.fieldCategory}</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as Card['category'])}>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {ui.categoryLabels[cat.id]}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span className="form-label">{ui.fieldMode}</span>
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {ui.modeLabels[m]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="form-field">
        <span className="form-label">
          {ui.fieldText}
          <span className="counter">
            {text.trim().length}/{USER_CARD_LIMITS.textMax}
          </span>
        </span>
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(toSingleLine(e.target.value))}
          placeholder="例：并给出每条问题的最小可复现 PoC"
        />
      </label>

      <label className="form-field">
        <span className="form-label">{ui.fieldTags}</span>
        <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="CWE, 污点分析" />
      </label>

      {varNames.length > 0 && (
        <div className="form-field">
          <span className="form-label">{ui.fieldVars}</span>
          <div className="var-edit-list">
            {varNames.map((name) => (
              <label key={name} className="var-field">
                <span>{`{${name}}`}</span>
                <input
                  type="text"
                  value={readVar(varDefaults, name)}
                  placeholder={ui.varDefault}
                  onChange={(e) => setVarDefaults((prev) => withVarDefault(prev, name, e.target.value))}
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
