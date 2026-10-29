import { describe, expect, it } from 'vitest'
import { EN_CARDS } from '../data/preset/en'
import { PRESET_CARDS } from '../data/presetCards'
import { extractVarNames } from '../lib/cardUtils'
import { composePrompt } from '../lib/compose'
import { localizeCard } from '../lib/localize'
import type { SlotItem } from '../types'

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

  it('英译层不得出现会强制中文输出的内容（英文页要出英文 prompt）', () => {
    // 只查会进入 prompt 的字段：标题、正文、tags、变量 token 与默认值。
    // 变量「键」是中文是必须的——它指回原变量名，用来保住切语言前已填的值。
    const chinese = /[\u4e00-\u9fff]/
    const mandatesChinese = /Chinese|中文/
    for (const [id, ov] of Object.entries(EN_CARDS)) {
      expect(chinese.test(ov.title), `${id} 英文标题含中文`).toBe(false)
      expect(chinese.test(ov.text), `${id} 英文正文含中文`).toBe(false)
      expect(mandatesChinese.test(ov.title), `${id} 英文标题要求中文输出`).toBe(false)
      expect(mandatesChinese.test(ov.text), `${id} 英文正文要求中文输出`).toBe(false)
      for (const tag of ov.tags) {
        expect(chinese.test(tag), `${id} 英文 tag 含中文`).toBe(false)
        expect(mandatesChinese.test(tag), `${id} 英文 tag 要求中文输出`).toBe(false)
      }
      for (const [key, v] of Object.entries(ov.vars ?? {})) {
        expect(chinese.test(v.name), `${id} 变量 ${key} 的英文 token 含中文`).toBe(false)
        expect(mandatesChinese.test(v.default), `${id} 变量 ${key} 的默认值要求中文输出`).toBe(false)
      }
    }
  })

  it('英文页拼出的 prompt 不含中文（预置卡全链路）', () => {
    const cardsById = new Map(PRESET_CARDS.map((c) => [c.id, localizeCard(c, 'en')]))
    // 把所有卡都插进去（含带变量的卡），覆盖变量替换后的整段文本
    const slots = { prefix: [] as SlotItem[], suffix: [] as SlotItem[], block: [] as SlotItem[] }
    let n = 0
    for (const card of cardsById.values()) {
      const slot = card.mode as 'prefix' | 'suffix' | 'block'
      slots[slot].push({
        instanceId: `i${n++}`,
        cardId: card.id,
        vars: Object.fromEntries(card.vars.map((v) => [v.key ?? v.name, v.default ?? ''])),
        enabled: true,
      })
    }
    const text = composePrompt({ baseSentence: 'Audit this code', slots, manualText: null }, cardsById, 'en')
    expect(text).not.toMatch(/[\u4e00-\u9fff]/)
    expect(text).not.toMatch(/Chinese/)
  })

  it('英文页的「输出语言」卡默认指向英文', () => {
    const zh = PRESET_CARDS.find((c) => c.id === 'builtin:general-20')!
    expect(zh.vars[0].default).toBe('中文')

    const en = localizeCard(zh, 'en')
    expect(en.vars[0].default).toBe('English')
    expect(en.text).not.toMatch(/Chinese/)

    const zhOutput = PRESET_CARDS.find((c) => c.id === 'builtin:output-01')!
    expect(zhOutput.title).toBe('中文输出')

    const enOutput = localizeCard(zhOutput, 'en')
    expect(enOutput.text).toContain('English')
    expect(enOutput.text).not.toMatch(/Chinese/)
  })
})
