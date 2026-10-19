import { EN_CARDS } from '../data/preset/en'
import type { Card, CardI18n } from '../types'
import type { Lang } from './i18n'

/**
 * 卡片本地化：
 * - zh：原样返回（同一对象，不做拷贝）
 * - en：用内置英译层覆写 title/text/tags；变量名换成英文 token，
 *   同时用 key 指回原变量名，拼装区已填的值跨语言不丢失。
 * - 未登记英译的卡（用户自定义卡等）回退原文。
 */
export function localizeCard(card: Card, lang: Lang, en: Record<string, CardI18n> = EN_CARDS): Card {
  if (lang === 'zh') return card
  const ov = en[card.id]
  if (!ov) return card
  return {
    ...card,
    title: ov.title,
    text: ov.text,
    tags: ov.tags,
    vars: card.vars.map((v) => {
      const t = ov.vars?.[v.name]
      return t
        ? { name: t.name, default: t.default, key: v.key ?? v.name }
        : { ...v, key: v.key ?? v.name }
    }),
  }
}
