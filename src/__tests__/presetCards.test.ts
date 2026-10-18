import { describe, expect, it } from 'vitest'
import { PRESET_CARDS } from '../data/presetCards'
import { extractVarNames } from '../lib/cardUtils'
import { CATEGORIES, type Category } from '../types'

const EXPECTED_COUNTS: Record<Category, number> = {
  'sec-audit': 30,
  pentest: 30,
  coding: 25,
  output: 20,
  general: 20,
}

const normalize = (s: string) => s.replace(/[\s，。；：！？、（）()【】[\]"'“”‘’.,;:!?—\-]/g, '')

describe('预置卡库', () => {
  for (const cat of CATEGORIES) {
    it(`【${cat.label}】数量为 ${EXPECTED_COUNTS[cat.id]}`, () => {
      expect(PRESET_CARDS.filter((c) => c.category === cat.id).length).toBe(EXPECTED_COUNTS[cat.id])
    })
  }

  it('总数 125 张', () => {
    expect(PRESET_CARDS.length).toBe(125)
  })

  it('id 唯一且格式规范', () => {
    const ids = PRESET_CARDS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^builtin:(sec-audit|pentest|coding|output|general)-\d{2}$/)
  })

  it('标题唯一', () => {
    const titles = PRESET_CARDS.map((c) => c.title.trim())
    expect(new Set(titles).size).toBe(titles.length)
  })

  it('文本唯一（忽略空白与标点后比较）', () => {
    const texts = PRESET_CARDS.map((c) => normalize(c.text))
    expect(new Set(texts).size).toBe(texts.length)
  })

  it('字段完整：标题 ≤24 字、文本 ≤160 字、tags 2-4 个、mode 合法、builtin 为 true', () => {
    for (const c of PRESET_CARDS) {
      expect(c.title.trim().length).toBeGreaterThan(0)
      expect(c.title.length).toBeLessThanOrEqual(24)
      expect(c.text.trim().length).toBeGreaterThan(0)
      expect(c.text.length).toBeLessThanOrEqual(160)
      expect(c.tags.length).toBeGreaterThanOrEqual(2)
      expect(c.tags.length).toBeLessThanOrEqual(4)
      expect(['prefix', 'suffix', 'block']).toContain(c.mode)
      expect(c.builtin).toBe(true)
    }
  })

  it('正文中的 {变量} 全部已在 vars 登记', () => {
    for (const c of PRESET_CARDS) {
      const declared = new Set(c.vars.map((v) => v.name))
      for (const name of extractVarNames(c.text)) expect(declared.has(name)).toBe(true)
    }
  })

  it('mode 分布：前缀 ≥20、后缀 ≥25、段落 ≥20', () => {
    const count = (m: string) => PRESET_CARDS.filter((c) => c.mode === m).length
    expect(count('prefix')).toBeGreaterThanOrEqual(20)
    expect(count('suffix')).toBeGreaterThanOrEqual(25)
    expect(count('block')).toBeGreaterThanOrEqual(20)
  })

  it('含变量卡片 ≥10 张', () => {
    expect(PRESET_CARDS.filter((c) => c.vars.length > 0).length).toBeGreaterThanOrEqual(10)
  })
})
