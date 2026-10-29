import {
  CATEGORIES,
  type Card,
  type CardVar,
  type ComposeState,
  type ExportFile,
  type Mode,
  type PersistedData,
  type Recipe,
  type RecipeItem,
  type SlotItem,
} from '../types'
import { toSingleLine, validateCard, varsFromText } from './cardUtils'

export const STORAGE_KEY = 'prompt-blocks:v1'
export const SCHEMA_VERSION = 1
/** 导出文件的 app 标识：导入时用来识别「这是不是本工具导出的文件」 */
export const EXPORT_APP = 'prompt-blocks'
/** 预置卡 id 前缀：导入时用它识别并拒绝文件里冒牌的预置卡 */
export const BUILTIN_CARD_PREFIX = 'builtin:'

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
    Array.isArray(c.slots.block) &&
    c.slots.prefix.every(isSlotItem) &&
    c.slots.suffix.every(isSlotItem) &&
    c.slots.block.every(isSlotItem)
  )
}

/** 槽位模式守卫 */
function isMode(value: unknown): value is Mode {
  return value === 'prefix' || value === 'suffix' || value === 'block'
}

/** 变量值守卫：非字符串值（手改的导入文件等）会在渲染期让 .trim() 抛错 */
function isVarTable(vars: unknown): vars is Record<string, string> {
  if (typeof vars !== 'object' || vars === null || Array.isArray(vars)) return false
  return Object.values(vars as Record<string, unknown>).every((v) => typeof v === 'string')
}

/** 槽位实例守卫：字段不全的实例会让渲染时读 vars 抛错 */
function isSlotItem(value: unknown): value is SlotItem {
  if (typeof value !== 'object' || value === null) return false
  const i = value as Partial<SlotItem>
  return (
    typeof i.instanceId === 'string' &&
    typeof i.cardId === 'string' &&
    typeof i.enabled === 'boolean' &&
    isVarTable(i.vars)
  )
}

function isPersistedData(value: unknown): value is PersistedData {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Partial<PersistedData>
  return (
    v.schemaVersion === SCHEMA_VERSION &&
    Array.isArray(v.userCards) &&
    v.userCards.every(isCard) &&
    Array.isArray(v.recipes) &&
    v.recipes.every(isRecipe) &&
    isComposeState(v.compose)
  )
}

/** 数据损坏时原始内容的备份键：避免随后写回默认值把原数据抹掉 */
export const CORRUPT_BACKUP_KEY = 'prompt-blocks:v1:corrupt-backup'

/** 上次 loadData 是否因数据损坏/版本不符而回退到了默认值 */
let loadWasCorrupt = false

/** 读取后是否发生了「回退到默认值」（App 据此提示用户） */
export function lastLoadCorrupted(): boolean {
  return loadWasCorrupt
}

/** 数据损坏/版本不符：把原始内容另存一份，再回退默认值 */
function fallbackWithBackup(raw: string, storage: StorageLike): PersistedData {
  loadWasCorrupt = true
  try {
    storage.setItem(CORRUPT_BACKUP_KEY, raw)
  } catch {
    /* 备份失败也要继续用默认值，不能卡住启动 */
  }
  return defaultData()
}

/** 读取本地数据；任何异常/版本不符都回退默认值（未来迁移：在此按 schemaVersion 转换） */
export function loadData(storage: StorageLike | null = localStorageSafe()): PersistedData {
  loadWasCorrupt = false
  if (!storage) return defaultData()
  let raw: string | null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return defaultData()
  }
  if (!raw) return defaultData()
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return fallbackWithBackup(raw, storage)
  }
  if (!isPersistedData(parsed)) {
    return fallbackWithBackup(raw, storage)
  }
  return parsed
}

/** 写入本地数据；返回是否成功（配额满/隐私模式会失败，UI 需据此提示） */
export function saveData(data: PersistedData, storage: StorageLike | null = localStorageSafe()): boolean {
  if (!storage) return false
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

/* ---------------- 导入导出（spec §4 / §8） ---------------- */

/** 结构守卫：一张卡是不是形状合法的 Card */
export function isCard(value: unknown): value is Card {
  if (typeof value !== 'object' || value === null) return false
  const c = value as Partial<Card>
  return (
    typeof c.id === 'string' &&
    c.id.length > 0 &&
    typeof c.category === 'string' &&
    CATEGORIES.some((cat) => cat.id === c.category) &&
    typeof c.title === 'string' &&
    typeof c.text === 'string' &&
    (c.mode === 'prefix' || c.mode === 'suffix' || c.mode === 'block') &&
    Array.isArray(c.vars) &&
    c.vars.every(
      (v) =>
        typeof v === 'object' &&
        v !== null &&
        typeof (v as CardVar).name === 'string' &&
        (v as CardVar).name.length > 0 &&
        ((v as CardVar).default === undefined || typeof (v as CardVar).default === 'string') &&
        ((v as CardVar).key === undefined || typeof (v as CardVar).key === 'string'),
    ) &&
    Array.isArray(c.tags) &&
    c.tags.every((t) => typeof t === 'string') &&
    typeof c.builtin === 'boolean'
  )
}

/** 结构守卫：一个配方是不是形状合法的 Recipe */
export function isRecipe(value: unknown): value is Recipe {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Partial<Recipe>
  return (
    typeof r.id === 'string' &&
    r.id.length > 0 &&
    typeof r.name === 'string' &&
    r.name.trim().length > 0 &&
    typeof r.baseSentence === 'string' &&
    Array.isArray(r.items) &&
    r.items.every(
      (i) =>
        typeof i === 'object' &&
        i !== null &&
        typeof (i as RecipeItem).cardId === 'string' &&
        typeof (i as RecipeItem).enabled === 'boolean' &&
        ((i as RecipeItem).mode === undefined || isMode((i as RecipeItem).mode)) &&
        isVarTable((i as RecipeItem).vars),
    )
  )
}

/**
 * 生成导出文件：只导出用户卡与配方（内置卡随代码走，不导出），
 * 拼装区状态一并带上，作为完整备份。
 */
export function buildExportFile(data: PersistedData, exportedAt: string): ExportFile {
  return {
    schemaVersion: SCHEMA_VERSION,
    app: EXPORT_APP,
    exportedAt,
    cards: data.userCards,
    recipes: data.recipes,
    compose: data.compose,
  }
}

export type ImportError = 'notJson' | 'badShape' | 'versionMismatch'

export interface ParsedImport {
  ok: boolean
  error?: ImportError
  cards: Card[]
  recipes: Recipe[]
  compose: ComposeState | null
  /** 形状不合法而被丢弃的条目数 */
  invalid: number
}

/**
 * 解析导入文件。不信任外部文件：逐条过结构守卫，坏条目丢弃并计数，
 * 不让一个坏卡把整次导入拖垮。
 */
export function parseImportFile(text: string): ParsedImport {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'notJson', cards: [], recipes: [], compose: null, invalid: 0 }
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: 'badShape', cards: [], recipes: [], compose: null, invalid: 0 }
  }
  const file = parsed as Partial<ExportFile>
  // app 与 schemaVersion 必填：否则任意 JSON 都会被当成合法备份，导入后提示"成功"却什么都没导入
  if (file.app !== EXPORT_APP) {
    return { ok: false, error: 'badShape', cards: [], recipes: [], compose: null, invalid: 0 }
  }
  if (file.schemaVersion !== SCHEMA_VERSION) {
    return { ok: false, error: 'versionMismatch', cards: [], recipes: [], compose: null, invalid: 0 }
  }
  const rawCards = (Array.isArray(file.cards) ? file.cards : []).map((c) => {
    // 手改过的备份可能没有 builtin 字段，补上再走结构守卫
    if (typeof c !== 'object' || c === null) return c
    const rec = c as unknown as Record<string, unknown>
    return rec.builtin === undefined ? { ...rec, builtin: false } : c
  })
  const rawRecipes = Array.isArray(file.recipes) ? file.recipes : []
  // 导入只影响「用户卡」：
  // - 拒绝文件里冒牌的预置卡（id 以 builtin: 开头）
  // - 正文折成单行、变量按正文重新推导（与编辑器同一套规则），builtin 一律置 false
  // - 不满足用户卡写作标准的条目丢弃并计数
  const cards = rawCards
    .filter(isCard)
    .filter((c) => !c.id.startsWith(BUILTIN_CARD_PREFIX))
    .map((c) => ({
      ...c,
      text: toSingleLine(c.text),
      builtin: false,
      vars: varsFromText(
        toSingleLine(c.text),
        Object.fromEntries(c.vars.map((v) => [v.name, v.default ?? ''])),
      ),
    }))
    .filter((c) => validateCard(c).length === 0)
  const recipes = rawRecipes.filter(isRecipe)
  const invalid = rawCards.length - cards.length + (rawRecipes.length - recipes.length)
  return {
    ok: true,
    cards,
    recipes,
    compose: isComposeState(file.compose) ? file.compose : null,
    invalid,
  }
}

/**
 * 按 id 合并：已存在的 id 跳过并计数（spec §4）。
 * 返回合并后的完整列表（现有 + 新增），不修改入参。
 */
export function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): { merged: T[]; skipped: number } {
  const ids = new Set(existing.map((item) => item.id))
  const merged = [...existing]
  let skipped = 0
  for (const item of incoming) {
    if (ids.has(item.id)) {
      skipped++
      continue
    }
    ids.add(item.id)
    merged.push(item)
  }
  return { merged, skipped }
}

/** 触发浏览器下载一个 JSON 文件（file:// 下也可用） */
export function downloadJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // 立刻 revoke 会让部分浏览器来不及取数据，延迟释放
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 读本地文件为文本（file:// 下 FileReader 可用） */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('read failed'))
    reader.readAsText(file)
  })
}
