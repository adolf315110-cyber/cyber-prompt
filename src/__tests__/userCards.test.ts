import { describe, expect, it } from 'vitest'
import { defaultVarsFor, normalizeTags, readVar, toSingleLine, USER_CARD_LIMITS, validateCard, varsFromText, withVarDefault } from '../lib/cardUtils'
import { renderCardText } from '../lib/compose'
import { localizeCard } from '../lib/localize'
import type { Card } from '../types'

function card(over: Partial<Card> = {}): Card {
  return {
    id: 'user:test',
    category: 'general',
    title: '标题',
    text: '正文内容',
    mode: 'suffix',
    vars: [],
    tags: ['a', 'b'],
    builtin: false,
    ...over,
  }
}

describe('validateCard（用户自定义卡校验）', () => {
  it('合法卡无问题', () => {
    expect(validateCard(card())).toEqual([])
  })

  it('标题为空 → titleRequired', () => {
    expect(validateCard(card({ title: '   ' }))).toContain('titleRequired')
  })

  it('标题超长 → titleTooLong', () => {
    expect(validateCard(card({ title: 'x'.repeat(USER_CARD_LIMITS.titleMax + 1) }))).toContain('titleTooLong')
  })

  it('标题刚好 24 字不算超长', () => {
    expect(validateCard(card({ title: 'x'.repeat(USER_CARD_LIMITS.titleMax) }))).not.toContain('titleTooLong')
  })

  it('正文为空 → textRequired', () => {
    expect(validateCard(card({ text: '' }))).toContain('textRequired')
  })

  it('正文超长 → textTooLong', () => {
    expect(validateCard(card({ text: 'x'.repeat(USER_CARD_LIMITS.textMax + 1) }))).toContain('textTooLong')
  })

  it('正文含换行 → textNotSingleLine', () => {
    expect(validateCard(card({ text: '第一行\n第二行' }))).toContain('textNotSingleLine')
  })

  it('标签超过 4 个 → tooManyTags；恰好 4 个不算', () => {
    expect(validateCard(card({ tags: ['1', '2', '3', '4', '5'] }))).toContain('tooManyTags')
    expect(validateCard(card({ tags: ['1', '2', '3', '4'] }))).not.toContain('tooManyTags')
  })

  it('不因标题与预置卡重名而报错（复制为自定义的正常用例）', () => {
    expect(validateCard(card({ title: '先划信任边界' }))).toEqual([])
  })
})

describe('normalizeTags', () => {
  it('中英文逗号/顿号/分号都能切分', () => {
    expect(normalizeTags('a，b、c;d,e')).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('去空白、去空项、去重', () => {
    expect(normalizeTags('  a ,, b ,a, ')).toEqual(['a', 'b'])
  })

  it('空输入 → 空数组', () => {
    expect(normalizeTags('   ')).toEqual([])
  })
})

describe('toSingleLine', () => {
  it('换行折成空格且不吞掉尾随空格', () => {
    expect(toSingleLine('a\nb\r\nc')).toBe('a b c')
    expect(toSingleLine('a ')).toBe('a ')
  })
})

describe('varsFromText', () => {
  it('按出现顺序提取变量并带上默认值', () => {
    expect(varsFromText('用 {语言} 审计 {框架} 的 {语言} 代码', { 语言: 'Java' })).toEqual([
      { name: '语言', default: 'Java' },
      { name: '框架' },
    ])
  })

  it('默认值表里的原型链名字不会污染变量表', () => {
    // 默认值表里显式给了 constructor（自有属性）→ 正常采纳
    expect(varsFromText('用 {constructor}', { constructor: 'Java' })).toEqual([
      { name: 'constructor', default: 'Java' },
    ])
    // 默认值表里没有 → 不能从原型链上捡到 Object.prototype.constructor
    expect(varsFromText('用 {constructor} 和 {__proto__}')).toEqual([
      { name: 'constructor' },
      { name: '__proto__' },
    ])
  })

  it('正文里没有占位符 → 空数组', () => {
    expect(varsFromText('没有变量')).toEqual([])
  })

  it('不会把 {{7*7}} 误认成变量', () => {
    expect(varsFromText('载荷 {{7*7}}')).toEqual([])
  })
})

describe('用户卡与英译层', () => {
  it('没有英译条目的用户卡原样返回（不报错、不丢内容）', () => {
    const c = card({ vars: [{ name: '语言', default: 'Java' }], text: '用 {语言} 审计' })
    const en = localizeCard(c, 'en')
    expect(en.text).toBe(c.text)
    expect(en.title).toBe(c.title)
    expect(en.vars[0].name).toBe('语言')
  })

  it('用户卡的变量值在中英两种界面都能正常渲染', () => {
    const c = card({ vars: [{ name: '语言', default: 'Java' }], text: '用 {语言} 审计' })
    for (const lang of ['zh', 'en'] as const) {
      const localized = localizeCard(c, lang)
      const vars = defaultVarsFor(localized)
      expect(renderCardText(localized, vars)).toBe('用 Java 审计')
    }
  })

  it('英文变量名的用户卡同样能渲染（从英文界面复制来的卡）', () => {
    const c = card({ vars: [{ name: 'language', default: 'Python' }], text: 'audit with {language}' })
    const vars = defaultVarsFor(c)
    expect(renderCardText(c, vars)).toBe('audit with Python')
  })

  it('中文界面下用户卡保持同一对象（不复制）', () => {
    const c = card()
    expect(localizeCard(c, 'zh')).toBe(c)
  })
})

describe('危险变量名不炸渲染', () => {
  it('变量名为 __proto__ 时能正常渲染（不读原型链）', () => {
    const c = card({ text: '载荷 {__proto__}', vars: [{ name: '__proto__', default: 'x' }] })
    const vars = defaultVarsFor(c)
    expect(renderCardText(c, vars)).toBe('载荷 x')
  })

  it('未填 __proto__ 变量时保留占位符，不抛错', () => {
    const c = card({ text: '载荷 {__proto__}', vars: [{ name: '__proto__' }] })
    const vars = defaultVarsFor(c)
    expect(renderCardText(c, vars)).toBe('载荷 {__proto__}')
  })

  it('变量表不含原型链上的键', () => {
    const c = card({ vars: [{ name: '__proto__', default: 'x' }] })
    const vars = defaultVarsFor(c)
    expect(Object.prototype.hasOwnProperty.call(vars, '__proto__')).toBe(true)
    expect(Object.getPrototypeOf(vars)).toBeNull()
  })
})

describe('英译层不直读原型链（N2）', () => {
  it('英译条目里没有该变量时，变量名不会被改成 Object', () => {
    const c = card({ id: 'user:x', vars: [{ name: 'constructor' }] })
    const en = { 'user:x': { title: 't', text: 'x', tags: [] } }
    const out = localizeCard(c, 'en', en)
    expect(out.vars[0].name).toBe('constructor')
    expect(out.vars[0].default).toBeUndefined()
  })

  it('卡 id 命中原型链时，不把原型上的东西当英译条目（P1）', () => {
    const c = card({ id: 'constructor', title: '原标题', text: '原文案', vars: [{ name: '语言', default: 'Java' }] })
    const out = localizeCard(c, 'en', {} as Record<string, never>)
    expect(out.title).toBe('原标题')
    expect(out.text).toBe('原文案')
    expect(out.vars[0].name).toBe('语言')
    expect(out.vars[0].default).toBe('Java')
  })

  it('英译条目里确实有该变量时，正常采用英译映射', () => {
    const c = card({ id: 'user:x', vars: [{ name: '语言' }] })
    const en = { 'user:x': { title: 't', text: 'x', tags: [], vars: { 语言: { name: 'language', default: 'Java' } } } }
    const out = localizeCard(c, 'en', en)
    expect(out.vars[0].name).toBe('language')
    expect(out.vars[0].default).toBe('Java')
    expect(out.vars[0].key).toBe('语言')
  })
})

describe('withVarDefault（编辑器写入变量默认值）', () => {  it('保持 null 原型：写完还能安全读回原型链名字', () => {
    const vars = withVarDefault(Object.create(null) as Record<string, string>, 'constructor', 'Java')
    expect(Object.getPrototypeOf(vars)).toBeNull()
    expect(readVar(vars, 'constructor')).toBe('Java')
  })

  it('写一个原型链上不存在的名字也不会把原型链带回来', () => {
    const vars = withVarDefault({ 语言: 'Java' } as Record<string, string>, 'constructor', 'x')
    expect(Object.getPrototypeOf(vars)).toBeNull()
    expect(readVar(vars, '语言')).toBe('Java')
    expect(readVar(vars, 'toString')).toBe('')
  })

  it('覆盖已有值', () => {
    const vars = withVarDefault({ 语言: 'Java' } as Record<string, string>, '语言', 'Python')
    expect(readVar(vars, '语言')).toBe('Python')
  })
})
