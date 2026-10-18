import { describe, expect, it } from 'vitest'
import { appReducer } from '../lib/reducer'
import { defaultData } from '../lib/storage'
import type { PersistedData } from '../types'

function withData(): PersistedData {
  const data = defaultData()
  data.userCards = [
    { id: 'user:1', category: 'general', title: '用户卡', text: '用户内容', mode: 'suffix', vars: [], tags: ['一', '二'], builtin: false },
  ]
  data.recipes = [{ id: 'r1', name: '配方', baseSentence: '基础', items: [] }]
  return data
}

describe('appReducer', () => {
  it('setBaseSentence 更新基础句', () => {
    const next = appReducer(withData(), { type: 'setBaseSentence', text: '帮我审计这段代码' })
    expect(next.compose.baseSentence).toBe('帮我审计这段代码')
  })

  it('insertCard 追加到对应槽末尾', () => {
    const data = appReducer(withData(), { type: 'insertCard', cardId: 'builtin:general-01', mode: 'prefix', instanceId: 'i1', vars: { 语言: 'Java' } })
    const next = appReducer(data, { type: 'insertCard', cardId: 'builtin:general-02', mode: 'prefix', instanceId: 'i2', vars: {} })
    expect(next.compose.slots.prefix.map((i) => i.instanceId)).toEqual(['i1', 'i2'])
    expect(next.compose.slots.prefix[0].vars).toEqual({ 语言: 'Java' })
    expect(next.compose.slots.prefix[0].enabled).toBe(true)
    expect(next.compose.slots.suffix).toEqual([])
  })

  it('removeItem 只移除指定实例', () => {
    let data = withData()
    data = appReducer(data, { type: 'insertCard', cardId: 'a', mode: 'block', instanceId: 'i1', vars: {} })
    data = appReducer(data, { type: 'insertCard', cardId: 'b', mode: 'block', instanceId: 'i2', vars: {} })
    const next = appReducer(data, { type: 'removeItem', slot: 'block', instanceId: 'i1' })
    expect(next.compose.slots.block.map((i) => i.instanceId)).toEqual(['i2'])
  })

  it('toggleItem 反转启用状态', () => {
    let data = withData()
    data = appReducer(data, { type: 'insertCard', cardId: 'a', mode: 'suffix', instanceId: 'i1', vars: {} })
    const next = appReducer(data, { type: 'toggleItem', slot: 'suffix', instanceId: 'i1' })
    expect(next.compose.slots.suffix[0].enabled).toBe(false)
    const back = appReducer(next, { type: 'toggleItem', slot: 'suffix', instanceId: 'i1' })
    expect(back.compose.slots.suffix[0].enabled).toBe(true)
  })

  it('moveItem 上移/下移交换顺序', () => {
    let data = withData()
    data = appReducer(data, { type: 'insertCard', cardId: 'a', mode: 'prefix', instanceId: 'i1', vars: {} })
    data = appReducer(data, { type: 'insertCard', cardId: 'b', mode: 'prefix', instanceId: 'i2', vars: {} })
    const up = appReducer(data, { type: 'moveItem', slot: 'prefix', instanceId: 'i2', direction: -1 })
    expect(up.compose.slots.prefix.map((i) => i.instanceId)).toEqual(['i2', 'i1'])
    const down = appReducer(up, { type: 'moveItem', slot: 'prefix', instanceId: 'i2', direction: 1 })
    expect(down.compose.slots.prefix.map((i) => i.instanceId)).toEqual(['i1', 'i2'])
  })

  it('已在顶端再上移、已在末端再下移都保持不变', () => {
    let data = withData()
    data = appReducer(data, { type: 'insertCard', cardId: 'a', mode: 'prefix', instanceId: 'i1', vars: {} })
    expect(appReducer(data, { type: 'moveItem', slot: 'prefix', instanceId: 'i1', direction: -1 })).toBe(data)
    expect(appReducer(data, { type: 'moveItem', slot: 'prefix', instanceId: 'i1', direction: 1 })).toBe(data)
  })

  it('setVar 只更新指定实例的指定变量', () => {
    let data = withData()
    data = appReducer(data, { type: 'insertCard', cardId: 'a', mode: 'block', instanceId: 'i1', vars: { 语言: 'Java', 篇幅: '' } })
    data = appReducer(data, { type: 'insertCard', cardId: 'a', mode: 'block', instanceId: 'i2', vars: { 语言: 'Java' } })
    const next = appReducer(data, { type: 'setVar', slot: 'block', instanceId: 'i1', name: '语言', value: 'Python' })
    expect(next.compose.slots.block[0].vars['语言']).toBe('Python')
    expect(next.compose.slots.block[1].vars['语言']).toBe('Java')
  })

  it('setManualText 进入手动微调 / 传 null 回到同步', () => {
    const data = withData()
    const editing = appReducer(data, { type: 'setManualText', text: '手动编辑后的文本' })
    expect(editing.compose.manualText).toBe('手动编辑后的文本')
    const synced = appReducer(editing, { type: 'setManualText', text: null })
    expect(synced.compose.manualText).toBeNull()
  })

  it('是纯函数：不修改传入的 state，也不碰 userCards / recipes', () => {
    const data = withData()
    const snapshot = JSON.parse(JSON.stringify(data))
    const next = appReducer(data, { type: 'setBaseSentence', text: 'x' })
    expect(data).toEqual(snapshot)
    expect(next.userCards).toBe(data.userCards)
    expect(next.recipes).toBe(data.recipes)
  })
})
