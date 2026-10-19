import { describe, expect, it } from 'vitest'
import { LANG_STORAGE_KEY, UI, detectLang, loadLang, saveLang, type Lang } from '../lib/i18n'
import { CATEGORIES } from '../types'

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [`${prefix}:${typeof value}`]
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) => flattenKeys(v, `${prefix}.${k}`))
}

function flattenStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (typeof value !== 'object' || value === null) return []
  return Object.values(value).flatMap(flattenStrings)
}

function fakeStorage(init: Record<string, string> = {}) {
  const map = new Map(Object.entries(init))
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v)
    },
  }
}

describe('界面双语 i18n', () => {
  it('两种语言的键结构一致', () => {
    expect(flattenKeys(UI.zh)).toEqual(flattenKeys(UI.en))
  })

  it('无空字符串文案', () => {
    for (const lang of ['zh', 'en'] as Lang[]) {
      for (const s of flattenStrings(UI[lang])) expect(s.trim().length).toBeGreaterThan(0)
    }
  })

  it('分类与模式标签覆盖完整', () => {
    for (const lang of ['zh', 'en'] as Lang[]) {
      for (const c of CATEGORIES) expect(UI[lang].categoryLabels[c.id]).toBeTruthy()
      for (const m of ['prefix', 'suffix', 'block'] as const) {
        expect(UI[lang].modeLabels[m]).toBeTruthy()
        expect(UI[lang].slotTitles[m]).toBeTruthy()
        expect(UI[lang].slotEmpty[m]).toBeTruthy()
      }
    }
  })

  it('计数与插值文案按语言生成', () => {
    expect(UI.zh.cardCount(150)).toBe('150 张')
    expect(UI.en.cardCount(1)).toBe('1 card')
    expect(UI.en.cardCount(150)).toBe('150 cards')
    expect(UI.zh.filteredCount(3, 150)).toBe('3 / 150 张')
    expect(UI.en.inserted('越权矩阵')).toBe('Inserted: 越权矩阵')
  })

  it('detectLang 跟随浏览器语言（zh* → 中文，其余英文）', () => {
    expect(detectLang('zh-CN')).toBe('zh')
    expect(detectLang('zh-Hant-TW')).toBe('zh')
    expect(detectLang('en-US')).toBe('en')
    expect(detectLang('fr-FR')).toBe('en')
    expect(detectLang(undefined)).toBe('en')
  })

  it('loadLang：已保存选择优先于浏览器语言', () => {
    expect(loadLang(fakeStorage({ [LANG_STORAGE_KEY]: 'en' }), 'zh-CN')).toBe('en')
    expect(loadLang(fakeStorage(), 'zh-CN')).toBe('zh')
    expect(loadLang(fakeStorage(), 'en-GB')).toBe('en')
    expect(loadLang(fakeStorage({ [LANG_STORAGE_KEY]: 'xx' }), 'zh-CN')).toBe('zh')
  })

  it('saveLang 写入偏好', () => {
    const s = fakeStorage()
    saveLang('en', s)
    expect(s.getItem(LANG_STORAGE_KEY)).toBe('en')
  })
})
