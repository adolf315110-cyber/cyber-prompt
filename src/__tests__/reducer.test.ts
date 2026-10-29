import { describe, expect, it } from 'vitest'
import { appReducer } from '../lib/reducer'
import { defaultCompose, defaultData } from '../lib/storage'
import type { Card, PersistedData, Recipe } from '../types'

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

describe('appReducer · 自定义卡', () => {
  const userCard: Card = {
    id: 'user:2',
    category: 'coding',
    title: '新卡',
    text: '内容',
    mode: 'block',
    vars: [],
    tags: ['x'],
    builtin: false,
  }

  it('addUserCard 追加到用户卡列表末尾', () => {
    const data = withData()
    const next = appReducer(data, { type: 'addUserCard', card: userCard })
    expect(next.userCards.map((c) => c.id)).toEqual(['user:1', 'user:2'])
    expect(data.userCards).toHaveLength(1)
  })

  it('updateUserCard 只替换同 id 的卡', () => {
    const data = withData()
    const next = appReducer(data, { type: 'updateUserCard', card: { ...userCard, id: 'user:1', title: '改过的' } })
    expect(next.userCards[0].title).toBe('改过的')
    expect(next.userCards).toHaveLength(1)
  })

  it('updateUserCard 对不存在的 id 不新增卡', () => {
    const data = withData()
    const next = appReducer(data, { type: 'updateUserCard', card: { ...userCard, id: 'user:不存在' } })
    expect(next.userCards).toHaveLength(1)
  })

  it('removeUserCard 只删指定卡', () => {
    const data = withData()
    const withTwo = appReducer(data, { type: 'addUserCard', card: userCard })
    const next = appReducer(withTwo, { type: 'removeUserCard', cardId: 'user:1' })
    expect(next.userCards.map((c) => c.id)).toEqual(['user:2'])
  })
})

describe('appReducer · 配方', () => {
  const recipe: Recipe = { id: 'r2', name: '新配方', baseSentence: '基础', items: [] }

  it('saveRecipe 追加配方', () => {
    const next = appReducer(withData(), { type: 'saveRecipe', recipe })
    expect(next.recipes.map((r) => r.id)).toEqual(['r1', 'r2'])
  })

  it('renameRecipe 只改指定配方的名字', () => {
    const next = appReducer(withData(), { type: 'renameRecipe', recipeId: 'r1', name: '改名了' })
    expect(next.recipes[0].name).toBe('改名了')
  })

  it('removeRecipe 只删指定配方', () => {
    const data = appReducer(withData(), { type: 'saveRecipe', recipe })
    const next = appReducer(data, { type: 'removeRecipe', recipeId: 'r1' })
    expect(next.recipes.map((r) => r.id)).toEqual(['r2'])
  })
})

describe('appReducer · 数据管理', () => {
  it('setCompose 整体替换拼装区', () => {
    const compose = { baseSentence: 'x', slots: { prefix: [], suffix: [], block: [] }, manualText: null }
    const next = appReducer(withData(), { type: 'setCompose', compose })
    expect(next.compose).toEqual(compose)
  })

  it('importData 覆盖用户卡、配方与拼装区', () => {
    const compose = { baseSentence: '导入的', slots: { prefix: [], suffix: [], block: [] }, manualText: null }
    const next = appReducer(withData(), {
      type: 'importData',
      userCards: [{ id: 'user:x', category: 'general', title: 't', text: 'x', mode: 'suffix', vars: [], tags: [], builtin: false }],
      recipes: [{ id: 'r9', name: 'n', baseSentence: 'b', items: [] }],
      compose,
    })
    expect(next.userCards.map((c) => c.id)).toEqual(['user:x'])
    expect(next.recipes.map((r) => r.id)).toEqual(['r9'])
    expect(next.compose).toEqual(compose)
  })

  it('clearAll 清空用户卡、配方与拼装区，但保留 schemaVersion', () => {
    const data = withData()
    data.compose.baseSentence = '旧拼装'
    const next = appReducer(data, { type: 'clearAll' })
    expect(next.userCards).toEqual([])
    expect(next.recipes).toEqual([])
    expect(next.compose).toEqual(defaultCompose())
    expect(next.schemaVersion).toBe(data.schemaVersion)
  })
})
