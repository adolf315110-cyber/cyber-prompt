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
  // 只认自有属性：卡 id 可能是 constructor / __proto__，直读会命中原型链拿到不相干的东西
  const ov = Object.prototype.hasOwnProperty.call(en, card.id) ? en[card.id] : undefined
  if (!ov) return card
  return {
    ...card,
    title: ov.title,
    text: ov.text,
    tags: ov.tags,
    vars: card.vars.map((v) => {
      // 只认自有属性：变量名可能是 constructor / __proto__，直读会命中原型链
      const t =
        ov.vars && Object.prototype.hasOwnProperty.call(ov.vars, v.name) ? ov.vars[v.name] : undefined
      return t
        ? { name: t.name, default: t.default, key: v.key ?? v.name }
        : { ...v, key: v.key ?? v.name }
    }),
  }
}
