import type { Card, ComposeState, SlotItem } from '../types'
import type { Lang } from './i18n'

const TERMINAL_PUNCT = /[。！？.!?]$/

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 渲染单张卡片文本：已填写值 > 默认值 > 保留 {占位符}（值读取用 v.key 以兼容英译层） */
export function renderCardText(card: Card, vars: Record<string, string>): string {
  let text = card.text
  for (const v of card.vars) {
    const value = (vars[v.key ?? v.name] ?? v.default ?? '').trim()
    if (!value) continue
    const token = new RegExp('\\{' + escapeRegExp(v.name) + '\\}', 'g')
    text = text.replace(token, value)
  }
  return text.trim()
}

function renderItems(items: SlotItem[], cardsById: Map<string, Card>): string[] {
  const out: string[] = []
  for (const item of items) {
    if (!item.enabled) continue
    const card = cardsById.get(item.cardId)
    if (!card) continue
    const text = renderCardText(card, item.vars)
    if (text) out.push(text)
  }
  return out
}

/**
 * 槽位拼装规则（spec §5）：
 * [前缀区] + 基础句 + [后缀区] + [段落区]
 * - 前缀/后缀槽内各段连接、前缀与基础句连接：zh 用「，」，en 用「, 」
 * - 基础句为空则前缀与后缀直连
 * - 基础句以终结标点结尾时，后缀直接连接（en 下补一个空格）
 * - 段落独立成段，与前文及彼此之间空行分隔
 */
export function composePrompt(state: ComposeState, cardsById: Map<string, Card>, lang: Lang = 'zh'): string {
  const sep = lang === 'en' ? ', ' : '，'
  const prefix = renderItems(state.slots.prefix, cardsById).join(sep)
  const suffix = renderItems(state.slots.suffix, cardsById).join(sep)
  const blocks = renderItems(state.slots.block, cardsById)

  const base = state.baseSentence.trim()
  let head = base ? (prefix ? `${prefix}${sep}${base}` : base) : prefix

  if (suffix) {
    if (!head) head = suffix
    else if (TERMINAL_PUNCT.test(head)) head += (lang === 'en' ? ' ' : '') + suffix
    else head += sep + suffix
  }

  return [head, ...blocks].filter((s) => s.length > 0).join('\n\n')
}
