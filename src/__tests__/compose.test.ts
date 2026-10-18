import { describe, expect, it } from 'vitest'
import { composePrompt, renderCardText } from '../lib/compose'
import { defaultCompose } from '../lib/storage'
import type { Card, ComposeState, Mode, SlotItem } from '../types'

let seq = 0
function card(id: string, text: string, mode: Mode, vars: Card['vars'] = []): Card {
  return { id, category: 'general', title: `标题-${id}`, text, mode, vars, tags: ['测试', '样例'], builtin: true }
}

function item(cardId: string, vars: Record<string, string> = {}, enabled = true): SlotItem {
  seq += 1
  return { instanceId: `i${seq}`, cardId, vars, enabled }
}

function state(partial: Partial<ComposeState>): ComposeState {
  return { ...defaultCompose(), ...partial }
}

function mapOf(...cards: Card[]): Map<string, Card> {
  return new Map(cards.map((c) => [c.id, c]))
}

describe('renderCardText', () => {
  it('用填写的值替换变量', () => {
    const c = card('c1', '目标语言：{语言}', 'block', [{ name: '语言', default: '中文' }])
    expect(renderCardText(c, { 语言: '英文' })).toBe('目标语言：英文')
  })
  it('未填写但有默认值时用默认值', () => {
    const c = card('c1', '目标语言：{语言}', 'block', [{ name: '语言', default: '中文' }])
    expect(renderCardText(c, {})).toBe('目标语言：中文')
  })
  it('未填写且无默认值时保留占位符', () => {
    const c = card('c1', '目标语言：{语言}', 'block', [{ name: '语言' }])
    expect(renderCardText(c, {})).toBe('目标语言：{语言}')
  })
  it('同一变量多次出现全部替换', () => {
    const c = card('c1', '{语言}输出，并用{语言}写报告', 'block', [{ name: '语言', default: '中文' }])
    expect(renderCardText(c, {})).toBe('中文输出，并用中文写报告')
  })
  it('渲染结果去掉首尾空白', () => {
    const c = card('c1', '  并给出 PoC  ', 'suffix')
    expect(renderCardText(c, {})).toBe('并给出 PoC')
  })
})

describe('composePrompt', () => {
  it('全部为空时返回空字符串', () => {
    expect(composePrompt(defaultCompose(), new Map())).toBe('')
  })
  it('前缀 + 基础句 + 后缀 用「，」连接', () => {
    const cards = mapOf(card('p', '以 OWASP Top 10 的视角', 'prefix'), card('s', '并给出可运行 PoC', 'suffix'))
    const st = state({ baseSentence: '帮我审计这段代码', slots: { prefix: [item('p')], suffix: [item('s')], block: [] } })
    expect(composePrompt(st, cards)).toBe('以 OWASP Top 10 的视角，帮我审计这段代码，并给出可运行 PoC')
  })
  it('基础句以终结标点结尾时后缀不再加「，」', () => {
    const cards = mapOf(card('s', '并给出可运行 PoC', 'suffix'))
    const st = state({ baseSentence: '帮我审计这段代码。', slots: { prefix: [], suffix: [item('s')], block: [] } })
    expect(composePrompt(st, cards)).toBe('帮我审计这段代码。并给出可运行 PoC')
  })
  it('基础句为空时前缀与后缀用「，」直连', () => {
    const cards = mapOf(card('p', '以 OWASP Top 10 的视角', 'prefix'), card('s', '并给出可运行 PoC', 'suffix'))
    const st = state({ slots: { prefix: [item('p')], suffix: [item('s')], block: [] } })
    expect(composePrompt(st, cards)).toBe('以 OWASP Top 10 的视角，并给出可运行 PoC')
  })
  it('同槽多张卡按槽内顺序以「，」连接', () => {
    const cards = mapOf(card('a', '以 OWASP Top 10 的视角', 'prefix'), card('b', '从攻击者角度思考', 'prefix'))
    const st = state({ baseSentence: '审计这段代码', slots: { prefix: [item('a'), item('b')], suffix: [], block: [] } })
    expect(composePrompt(st, cards)).toBe('以 OWASP Top 10 的视角，从攻击者角度思考，审计这段代码')
  })
  it('段落卡独立成段，与前文空行分隔', () => {
    const cards = mapOf(card('k', '输出要求：中文、含 PoC、按 CVSS 评分', 'block'))
    const st = state({ baseSentence: '帮我审计这段代码', slots: { prefix: [], suffix: [], block: [item('k')] } })
    expect(composePrompt(st, cards)).toBe('帮我审计这段代码\n\n输出要求：中文、含 PoC、按 CVSS 评分')
  })
  it('多个段落卡之间空行分隔', () => {
    const cards = mapOf(card('k1', '约束：最小改动', 'block'), card('k2', '输出要求：中文', 'block'))
    const st = state({ baseSentence: '修复这个 bug', slots: { prefix: [], suffix: [], block: [item('k1'), item('k2')] } })
    expect(composePrompt(st, cards)).toBe('修复这个 bug\n\n约束：最小改动\n\n输出要求：中文')
  })
  it('停用的实例不参与拼装', () => {
    const cards = mapOf(card('s', '并给出 PoC', 'suffix'))
    const st = state({ baseSentence: '审计代码', slots: { prefix: [], suffix: [item('s', {}, false)], block: [] } })
    expect(composePrompt(st, cards)).toBe('审计代码')
  })
  it('卡片已被删除的实例被跳过', () => {
    const st = state({ baseSentence: '审计代码', slots: { prefix: [], suffix: [item('ghost')], block: [] } })
    expect(composePrompt(st, new Map())).toBe('审计代码')
  })
  it('变量未填时预览保留占位符原样', () => {
    const cards = mapOf(card('v', '目标语言：{语言}', 'block', [{ name: '语言' }]))
    const st = state({ baseSentence: '审计代码', slots: { prefix: [], suffix: [], block: [item('v')] } })
    expect(composePrompt(st, cards)).toBe('审计代码\n\n目标语言：{语言}')
  })
  it('变量已填时替换为填写值', () => {
    const cards = mapOf(card('v', '目标语言：{语言}', 'block', [{ name: '语言', default: '中文' }]))
    const st = state({ baseSentence: '审计代码', slots: { prefix: [], suffix: [], block: [item('v', { 语言: '英文' })] } })
    expect(composePrompt(st, cards)).toBe('审计代码\n\n目标语言：英文')
  })
})
