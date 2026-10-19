import type { Card } from '../types'

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

/** 生成实例的初始变量表：默认值优先，无默认值为空串 */
export function defaultVarsFor(card: Card): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const v of card.vars) vars[v.name] = v.default ?? ''
  return vars
}

/** 渲染结果里是否仍有未填写的 {占位符} */
export function hasUnresolvedVars(text: string): boolean {
  return UNRESOLVED_PATTERN.test(text)
}
