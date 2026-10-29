import { describe, expect, it } from 'vitest'
import { composeToRecipe, recipeToCompose } from '../lib/recipe'
import { defaultCompose } from '../lib/storage'
import type { Card, ComposeState, Recipe } from '../types'

function card(id: string, mode: Card['mode']): Card {
  return { id, category: 'general', title: id, text: id, mode, vars: [], tags: ['t'], builtin: true }
}

function composeWith(): ComposeState {
  const c = defaultCompose()
  c.baseSentence = '帮我审计这段代码'
  c.slots.prefix = [{ instanceId: 'i1', cardId: 'p1', vars: {}, enabled: true }]
  c.slots.suffix = [{ instanceId: 'i2', cardId: 's1', vars: { 语言: 'Java' }, enabled: true }]
  c.slots.block = [{ instanceId: 'i3', cardId: 'b1', vars: {}, enabled: false }]
  return c
}

describe('composeToRecipe', () => {
  it('按 前缀→后缀→段落 拍平，保留基础句与变量值', () => {
    const r = composeToRecipe('r1', '我的配方', composeWith())
    expect(r.id).toBe('r1')
    expect(r.name).toBe('我的配方')
    expect(r.baseSentence).toBe('帮我审计这段代码')
    expect(r.items.map((i) => i.cardId)).toEqual(['p1', 's1', 'b1'])
    expect(r.items[1].vars).toEqual({ 语言: 'Java' })
    expect(r.items[2].enabled).toBe(false)
  })

  it('不把 instanceId 写进配方', () => {
    const r = composeToRecipe('r1', 'x', composeWith())
    expect(JSON.stringify(r)).not.toContain('i1')
  })

  it('手动微调文本不进配方（配方只存基础句 + 卡组合）', () => {
    const c = composeWith()
    c.manualText = '手动改过的内容'
    const r = composeToRecipe('r1', 'x', c)
    expect(JSON.stringify(r)).not.toContain('手动改过')
  })
})

describe('recipeToCompose', () => {
  const cards = new Map<string, Card>([
    ['p1', card('p1', 'prefix')],
    ['s1', card('s1', 'suffix')],
    ['b1', card('b1', 'block')],
  ])

  it('按卡的 mode 还原到对应槽位', () => {
    const r = composeToRecipe('r1', 'x', composeWith())
    const { compose, missing } = recipeToCompose(r, cards, () => 'gen')
    expect(compose.baseSentence).toBe('帮我审计这段代码')
    expect(compose.slots.prefix.map((i) => i.cardId)).toEqual(['p1'])
    expect(compose.slots.suffix.map((i) => i.cardId)).toEqual(['s1'])
    expect(compose.slots.block.map((i) => i.cardId)).toEqual(['b1'])
    expect(compose.slots.suffix[0].vars).toEqual({ 语言: 'Java' })
    expect(missing).toEqual([])
  })

  it('还原后是自动模式（manualText 为 null）', () => {
    const r = composeToRecipe('r1', 'x', composeWith())
    const { compose } = recipeToCompose(r, cards, () => 'gen')
    expect(compose.manualText).toBeNull()
  })

  it('实例 id 由调用方生成，互不相同', () => {
    const r = composeToRecipe('r1', 'x', composeWith())
    let n = 0
    const { compose } = recipeToCompose(r, cards, () => `gen${n++}`)
    const ids = [...compose.slots.prefix, ...compose.slots.suffix, ...compose.slots.block].map((i) => i.instanceId)
    expect(new Set(ids).size).toBe(3)
  })

  it('卡已被删除的条目跳过并计入 missing，不影响其它条目', () => {
    const recipe: Recipe = {
      id: 'r1',
      name: 'x',
      baseSentence: '基础',
      items: [
        { cardId: 'gone', vars: {}, enabled: true },
        { cardId: 's1', vars: {}, enabled: true },
      ],
    }
    const { compose, missing } = recipeToCompose(recipe, cards, () => 'gen')
    expect(missing).toEqual(['gone'])
    expect(compose.slots.suffix).toHaveLength(1)
  })

  it('空配方 → 空拼装区（基础句仍保留）', () => {
    const recipe: Recipe = { id: 'r1', name: 'x', baseSentence: '只有基础句', items: [] }
    const { compose, missing } = recipeToCompose(recipe, cards, () => 'gen')
    expect(compose.baseSentence).toBe('只有基础句')
    expect(compose.slots.prefix).toEqual([])
    expect(missing).toEqual([])
  })

  it('往返：配方 → 拼装 → 配方，卡组合与变量值不变', () => {
    const first = composeToRecipe('r1', 'x', composeWith())
    const { compose } = recipeToCompose(first, cards, () => 'gen')
    const second = composeToRecipe('r2', 'y', compose)
    expect(second.items).toEqual(first.items)
    expect(second.baseSentence).toBe(first.baseSentence)
  })

  it('条目记住存配方时的槽位：卡后来改了 mode 也还原到原槽', () => {
    const first = composeToRecipe('r1', 'x', composeWith())
    expect(first.items.find((i) => i.cardId === 'p1')?.mode).toBe('prefix')

    // 卡后来从 prefix 改成 block
    const changed = new Map(cards)
    changed.set('p1', card('p1', 'block'))
    const { compose } = recipeToCompose(first, changed, () => 'gen')
    expect(compose.slots.prefix.map((i) => i.cardId)).toEqual(['p1'])
    expect(compose.slots.block.map((i) => i.cardId)).toEqual(['b1'])
  })

  it('旧备份（条目没有 mode）按卡当前 mode 落位，不报错', () => {
    const legacy: Recipe = {
      id: 'r1',
      name: 'x',
      baseSentence: '基础',
      items: [{ cardId: 'p1', vars: {}, enabled: true }],
    }
    const { compose, missing } = recipeToCompose(legacy, cards, () => 'gen')
    expect(missing).toEqual([])
    expect(compose.slots.prefix.map((i) => i.cardId)).toEqual(['p1'])
  })

  it('条目 mode 非法 → 跳过并计入 missing，不拿它当下标用', () => {
    for (const badMode of ['garbage', '__proto__', 'constructor']) {
      const dirty = {
        id: 'r1',
        name: 'x',
        baseSentence: '基础',
        items: [{ cardId: 'p1', vars: {}, enabled: true, mode: badMode } as unknown as Recipe['items'][0]],
      }
      const { compose, missing } = recipeToCompose(dirty, cards, () => 'gen')
      expect(missing, `mode=${String(badMode)}`).toEqual(['p1'])
      expect(compose.slots.prefix).toEqual([])
      expect(compose.slots.suffix).toEqual([])
      expect(compose.slots.block).toEqual([])
    }
  })
})
