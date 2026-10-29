import type { Card, ComposeState, Mode, Recipe, RecipeItem } from '../types'

/**
 * 配方 ↔ 拼装区互转。
 *
 * 槽位归属优先用配方条目自带的 `mode`（存配方时写下的槽位）；
 * 旧备份没有这个字段时，退回按该卡当前的 mode 落位。
 */

/** 拼装区 → 配方：按 前缀 → 后缀 → 段落 的顺序拍平，并记下每条所在的槽位 */
export function composeToRecipe(id: string, name: string, compose: ComposeState): Recipe {
  const items: RecipeItem[] = []
  for (const slot of ['prefix', 'suffix', 'block'] as const) {
    for (const item of compose.slots[slot]) {
      items.push({ cardId: item.cardId, vars: { ...item.vars }, enabled: item.enabled, mode: slot })
    }
  }
  return { id, name, baseSentence: compose.baseSentence, items }
}

/** 配方 → 拼装区：条目按自身记录的槽位落位；卡已被删除的条目跳过并记入 missing */
export function recipeToCompose(
  recipe: Recipe,
  cardsById: Map<string, Card>,
  makeId: () => string,
): { compose: ComposeState; missing: string[] } {
  const slots: ComposeState['slots'] = { prefix: [], suffix: [], block: [] }
  const missing: string[] = []
  for (const item of recipe.items) {
    const card = cardsById.get(item.cardId)
    if (!card) {
      missing.push(item.cardId)
      continue
    }
    const slot: Mode = item.mode ?? card.mode
    // 防御脏数据：非法槽位不能直接当下标用（会拿到 undefined 或原型上的东西）
    if (!Object.prototype.hasOwnProperty.call(slots, slot)) {
      missing.push(item.cardId)
      continue
    }
    slots[slot].push({
      instanceId: makeId(),
      cardId: item.cardId,
      vars: { ...item.vars },
      enabled: item.enabled,
    })
  }
  return {
    compose: { baseSentence: recipe.baseSentence, slots, manualText: null },
    missing,
  }
}
