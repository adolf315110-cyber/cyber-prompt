import type { Card, CardVar } from '../types'

/**
 * 变量名：以中文或字母开头。
 * 这样 {{7*7}}、${7*7} 一类探测载荷不会被误认成变量占位符。
 */
const VAR_NAME = '[A-Za-z_\\u4e00-\\u9fff][^{}]*'
const VAR_PATTERN = new RegExp(`\\{(${VAR_NAME})\\}`, 'g')
const UNRESOLVED_PATTERN = new RegExp(`\\{${VAR_NAME}\\}`)

/** 预览高亮用：拆分正则（捕获组保留分隔符）与整段判定 */
export const VAR_SPLIT_PATTERN = new RegExp(`(\\{${VAR_NAME}\\})`)
export const VAR_EXACT_PATTERN = new RegExp(`^\\{${VAR_NAME}\\}$`)

/** 按出现顺序提取文本中的变量名（去重） */
export function extractVarNames(text: string): string[] {
  const names: string[] = []
  for (const match of text.matchAll(VAR_PATTERN)) {
    if (!names.includes(match[1])) names.push(match[1])
  }
  return names
}

/** 生成实例的初始变量表：默认值优先，无默认值为空串（键用 v.key 以兼容英译层） */
export function defaultVarsFor(card: Card): Record<string, string> {
  // 用 null 原型对象：变量名若是 __proto__，普通对象的赋值会走原型 setter 而写不进去
  const vars: Record<string, string> = Object.create(null) as Record<string, string>
  for (const v of card.vars) vars[v.key ?? v.name] = v.default ?? ''
  return vars
}

/** 安全读取变量值：只认自有属性，避免 __proto__ 之类命中原型链 */
export function readVar(vars: Record<string, string>, key: string): string {
  return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : ''
}

/**
 * 合并一个变量默认值。保持 null 原型：
 * 对象展开会丢��� null 原型，之后变量名若是 constructor / __proto__ 就会读回原型链上的函数。
 */
export function withVarDefault(vars: Record<string, string>, name: string, value: string): Record<string, string> {
  return Object.assign(Object.create(null) as Record<string, string>, vars, { [name]: value })
}

/** 渲染结果里是否仍有未填写的 {占位符} */
export function hasUnresolvedVars(text: string): boolean {
  return UNRESOLVED_PATTERN.test(text)
}

/* ---------------- 用户自定义卡：校验与构造 ---------------- */

/** 用户卡校验问题码；文案由 i18n 层按码映射，逻辑层不碰文案 */
export type CardIssue = 'titleRequired' | 'titleTooLong' | 'textRequired' | 'textTooLong' | 'tooManyTags' | 'textNotSingleLine'

/** 自定义卡沿用预置卡的写作约束：标题 ≤24 字、正文 ≤160 字单行、标签 0-4 个 */
export const USER_CARD_LIMITS = {
  titleMax: 24,
  textMax: 160,
  tagsMax: 4,
} as const

/**
 * 校验一张用户卡。返回问题码列表（空数组 = 通过）。
 * 不校验标题唯一性：用户卡允许与预置卡同名（「复制为自定义」就是同名的典型用例）。
 */
export function validateCard(card: Pick<Card, 'title' | 'text' | 'tags'>): CardIssue[] {
  const issues: CardIssue[] = []
  const title = card.title.trim()
  const text = card.text.trim()
  if (!title) issues.push('titleRequired')
  else if (title.length > USER_CARD_LIMITS.titleMax) issues.push('titleTooLong')
  if (!text) issues.push('textRequired')
  else if (text.length > USER_CARD_LIMITS.textMax) issues.push('textTooLong')
  if (text.includes('\n') || text.includes('\r')) issues.push('textNotSingleLine')
  if (card.tags.length > USER_CARD_LIMITS.tagsMax) issues.push('tooManyTags')
  return issues
}

/** 标签输入：按中英文逗号/顿号/分号切分，去空白、去空项、去重 */
export function normalizeTags(raw: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of raw.split(/[,，、;；]/)) {
    const t = part.trim()
    if (!t || seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}

/** 正文里的换行会破坏「，」连接的槽位拼接，统一折成空格（不 trim，避免输入过程中吃掉尾随空格） */
export function toSingleLine(text: string): string {
  return text.replace(/[\r\n]+/g, ' ')
}

/** 按正文里出现的占位符顺序生成变量表（默认值来自传入表，缺省空串） */
export function varsFromText(text: string, defaults: Record<string, string> = {}): CardVar[] {
  return extractVarNames(text).map((name) => {
    // 只取自有属性且必须是字符串：defaults 若来自普通对象，__proto__ / constructor
    // 这类名字会命中原型链，拿到函数或对象后在渲染期抛错
    const raw = Object.prototype.hasOwnProperty.call(defaults, name) ? defaults[name] : ''
    const d = typeof raw === 'string' ? raw.trim() : ''
    return d ? { name, default: d } : { name }
  })
}
