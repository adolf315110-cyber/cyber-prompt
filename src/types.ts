export type Category = 'sec-audit' | 'pentest' | 'coding' | 'output' | 'general'
export type Mode = 'prefix' | 'suffix' | 'block'

export interface CardVar {
  name: string
  default?: string
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

export interface RecipeItem {
  cardId: string
  vars: Record<string, string>
  enabled: boolean
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

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'sec-audit', label: '安全审计' },
  { id: 'pentest', label: '渗透测试' },
  { id: 'coding', label: '编程' },
  { id: 'output', label: '输出格式' },
  { id: 'general', label: '通用' },
]

export const MODE_LABELS: Record<Mode, string> = {
  prefix: '前缀',
  suffix: '后缀',
  block: '段落',
}
