import type { Card } from '../types'

const VAR_PATTERN = /\{([^{}]+)\}/g

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
  return /\{[^{}]+\}/.test(text)
}
