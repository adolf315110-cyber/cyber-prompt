export type Category = 'sec-audit' | 'pentest' | 'coding' | 'output' | 'general'
export type Mode = 'prefix' | 'suffix' | 'block'

export interface CardVar {
  name: string
  default?: string
  /**
   * 实例值存取键。en 模式下 name 会换成英文 token（如 language），
   * key 保留原变量名（如 语言），保证切换语言时已填的值不丢失；缺省时等于 name。
   */
  key?: string
}

export interface Card {
  id: string
  category: Category
  title: string
  text: string
  mode: Mode
  vars: CardVar[]
  tags: string[]
  note?: string
  builtin: boolean
}

/** 英译层条目（keys = 卡片 id，见 src/data/preset/en/） */
export interface CardI18n {
  title: string
  text: string
  tags: string[]
  /** 键 = 原(中)文变量名 → 英文变量名与默认值 */
  vars?: Record<string, { name: string; default: string }>
}

export interface RecipeItem {
  cardId: string
  vars: Record<string, string>
  enabled: boolean
  /**
   * 可选：存配方时所在的槽位。缺省时按该卡当前的 mode 落位。
   * 可选字段 = 只增版不破坏（spec §12），旧备份文件照样能读。
   */
  mode?: Mode
}

export interface Recipe {
  id: string
  name: string
  baseSentence: string
  items: RecipeItem[]
}

export interface SlotItem {
  instanceId: string
  cardId: string
  vars: Record<string, string>
  enabled: boolean
}

export interface SlotState {
  prefix: SlotItem[]
  suffix: SlotItem[]
  block: SlotItem[]
}

export interface ComposeState {
  baseSentence: string
  slots: SlotState
  manualText: string | null
}

export interface PersistedData {
  schemaVersion: number
  userCards: Card[]
  recipes: Recipe[]
  compose: ComposeState
}

/**
 * 导出文件格式（spec §4）：
 * 只含用户卡与配方（内置卡随代码走，不导出），拼装区状态一并带上作为完整备份。
 */
export interface ExportFile {
  schemaVersion: number
  app: 'prompt-blocks'
  exportedAt: string
  cards: Card[]
  recipes: Recipe[]
  compose: ComposeState
}

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'sec-audit', label: '安全审计' },
  { id: 'pentest', label: '渗透测试' },
  { id: 'coding', label: '编程' },
  { id: 'output', label: '输出格式' },
  { id: 'general', label: '通用' },
]
