import type { ComposeState, PersistedData } from '../types'

export const STORAGE_KEY = 'prompt-blocks:v1'
export const SCHEMA_VERSION = 1

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function defaultCompose(): ComposeState {
  return {
    baseSentence: '',
    slots: { prefix: [], suffix: [], block: [] },
    manualText: null,
  }
}

export function defaultData(): PersistedData {
  return { schemaVersion: SCHEMA_VERSION, userCards: [], recipes: [], compose: defaultCompose() }
}

function localStorageSafe(): StorageLike | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

function isComposeState(value: unknown): value is ComposeState {
  if (typeof value !== 'object' || value === null) return false
  const c = value as Partial<ComposeState>
  return (
    typeof c.baseSentence === 'string' &&
    (c.manualText === null || typeof c.manualText === 'string') &&
    typeof c.slots === 'object' &&
    c.slots !== null &&
    Array.isArray(c.slots.prefix) &&
    Array.isArray(c.slots.suffix) &&
    Array.isArray(c.slots.block)
  )
}

function isPersistedData(value: unknown): value is PersistedData {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Partial<PersistedData>
  return (
    v.schemaVersion === SCHEMA_VERSION &&
    Array.isArray(v.userCards) &&
    Array.isArray(v.recipes) &&
    isComposeState(v.compose)
  )
}

/** 读取本地数据；任何异常/版本不符都回退默认值（未来迁移：在此按 schemaVersion 转换） */
export function loadData(storage: StorageLike | null = localStorageSafe()): PersistedData {
  if (!storage) return defaultData()
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    const parsed: unknown = JSON.parse(raw)
    if (!isPersistedData(parsed)) return defaultData()
    return parsed
  } catch {
    return defaultData()
  }
}

/** 写入本地数据；配额/隐私模式失败时静默降级，不打断使用 */
export function saveData(data: PersistedData, storage: StorageLike | null = localStorageSafe()): void {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* 静默降级 */
  }
}
