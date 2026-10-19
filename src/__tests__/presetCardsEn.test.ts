import { describe, expect, it } from 'vitest'
import { EN_CARDS } from '../data/preset/en'
import { PRESET_CARDS } from '../data/presetCards'
import { extractVarNames } from '../lib/cardUtils'
import { localizeCard } from '../lib/localize'

describe('内置英译层（src/data/preset/en）', () => {
  it('覆盖全部预置卡且无多余条目', () => {
    expect(Object.keys(EN_CARDS).sort()).toEqual(PRESET_CARDS.map((c) => c.id).sort())
  })

  it('字段非空：标题 ≤ 64 字符、正文 ≤ 480 字符、tags 2-4 个', () => {
    for (const [id, ov] of Object.entries(EN_CARDS)) {
      expect(ov.title.trim(), `${id} 标题为空`).not.toBe('')
      expect(ov.title.length, `${id} 标题超长`).toBeLessThanOrEqual(64)
      expect(ov.text.trim(), `${id} 正文为空`).not.toBe('')
      expect(ov.text.length, `${id} 正文超长`).toBeLessThanOrEqual(480)
      expect(ov.tags.length, `${id} tags 过少`).toBeGreaterThanOrEqual(2)
      expect(ov.tags.length, `${id} tags 过多`).toBeLessThanOrEqual(4)
    }
  })

  it('英文标题与正文互相唯一（防复制粘贴撞车）', () => {
    const titles = Object.values(EN_CARDS).map((o) => o.title.trim())
    const texts = Object.values(EN_CARDS).map((o) => o.text.trim())
    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(texts).size).toBe(texts.length)
  })

  it('en 本地化后：正文 {变量} 均已登记，默认值非空，原变量名都有英译', () => {
    for (const card of PRESET_CARDS) {
      const en = localizeCard(card, 'en')
      const declared = new Set(en.vars.map((v) => v.name))
      for (const name of extractVarNames(en.text)) {
        expect(declared.has(name), `${card.id} 正文变量 {${name}} 未登记`).toBe(true)
      }
      for (const v of en.vars) {
        expect((v.default ?? '').length, `${card.id} 变量 ${v.name} 缺默认值`).toBeGreaterThan(0)
      }
      if (card.vars.length > 0) {
        const ov = EN_CARDS[card.id]
        for (const v of card.vars) {
          expect(ov.vars?.[v.name], `${card.id} 缺变量英译：${v.name}`).toBeTruthy()
        }
      }
    }
  })

  it('en 本地化：name 换英文 token，key 指回原变量名；zh 原样返回', () => {
    const card = PRESET_CARDS.find((c) => c.id === 'builtin:sec-audit-04')!
    expect(localizeCard(card, 'zh')).toBe(card)

    const en = localizeCard(card, 'en')
    expect(en.title).toBe('Language-specific dangerous patterns')
    expect(en.text).toContain('{language}')
    expect(en.vars).toEqual([{ name: 'language', default: 'Java', key: '语言' }])
  })
})
