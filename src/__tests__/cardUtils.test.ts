import { describe, expect, it } from 'vitest'
import { defaultVarsFor, extractVarNames, hasUnresolvedVars } from '../lib/cardUtils'
import type { Card } from '../types'

const sample: Card = {
  id: 'builtin:general-99',
  category: 'general',
  title: '样例',
  text: '目标语言：{语言}，篇幅：{篇幅}，再次强调 {语言}',
  mode: 'block',
  vars: [
    { name: '语言', default: '中文' },
    { name: '篇幅' },
  ],
  tags: ['样例', '测试'],
  builtin: true,
}

describe('extractVarNames', () => {
  it('按出现顺序提取全部变量名且去重', () => {
    expect(extractVarNames(sample.text)).toEqual(['语言', '篇幅'])
  })
  it('没有变量时返回空数组', () => {
    expect(extractVarNames('普通文本，没有占位符')).toEqual([])
  })
  it('模板与载荷语法（{{7*7}}、${7*7}）不会被当作变量', () => {
    expect(extractVarNames('发 {{7*7}} 与 ${7*7} 探测')).toEqual([])
    expect(hasUnresolvedVars('发 {{7*7}} 与 ${7*7} 探测')).toBe(false)
  })
})

describe('defaultVarsFor', () => {
  it('实例值一律写空串：默认值由渲染期按当前语言层的卡回落', () => {
    // 写死默认值会让默认值固化在「插入瞬间那一语言层」上，
    // 切到另一种语言后渲染期优先用实例值 ⇒ 英文界面拼出中文 prompt。
    expect(defaultVarsFor(sample)).toEqual({ 语言: '', 篇幅: '' })
  })
  it('无变量卡返回空对象', () => {
    expect(defaultVarsFor({ ...sample, text: '无变量', vars: [] })).toEqual({})
  })
})

describe('hasUnresolvedVars', () => {
  it('存在 {xxx} 时返回 true', () => {
    expect(hasUnresolvedVars('目标语言：{语言}')).toBe(true)
  })
  it('不存在占位符时返回 false', () => {
    expect(hasUnresolvedVars('目标语言：中文')).toBe(false)
  })
})
