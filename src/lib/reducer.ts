import type { Card, ComposeState, Mode, PersistedData, Recipe, SlotItem } from '../types'

export type AppAction =
  | { type: 'setBaseSentence'; text: string }
  | { type: 'insertCard'; cardId: string; mode: Mode; instanceId: string; vars: Record<string, string> }
  | { type: 'removeItem'; slot: Mode; instanceId: string }
  | { type: 'toggleItem'; slot: Mode; instanceId: string }
  | { type: 'moveItem'; slot: Mode; instanceId: string; direction: -1 | 1 }
  | { type: 'setVar'; slot: Mode; instanceId: string; name: string; value: string }
  | { type: 'setManualText'; text: string | null }
  | { type: 'setCompose'; compose: ComposeState }
  /* 用户自定义卡 */
  | { type: 'addUserCard'; card: Card }
  | { type: 'updateUserCard'; card: Card }
  | { type: 'removeUserCard'; cardId: string }
  /* 配方 */
  | { type: 'saveRecipe'; recipe: Recipe }
  | { type: 'removeRecipe'; recipeId: string }
  | { type: 'renameRecipe'; recipeId: string; name: string }
  /* 数据管理 */
  | { type: 'importData'; userCards: Card[]; recipes: Recipe[]; compose: ComposeState }
  | { type: 'clearAll' }

function updateSlot(compose: ComposeState, slot: Mode, fn: (items: SlotItem[]) => SlotItem[]): ComposeState {
  return { ...compose, slots: { ...compose.slots, [slot]: fn(compose.slots[slot]) } }
}

export function appReducer(state: PersistedData, action: AppAction): PersistedData {
  const compose = state.compose
  switch (action.type) {
    case 'setBaseSentence':
      return { ...state, compose: { ...compose, baseSentence: action.text } }

    case 'insertCard':
      return {
        ...state,
        compose: updateSlot(compose, action.mode, (items) => [
          ...items,
          { instanceId: action.instanceId, cardId: action.cardId, vars: { ...action.vars }, enabled: true },
        ]),
      }

    case 'removeItem':
      return {
        ...state,
        compose: updateSlot(compose, action.slot, (items) => items.filter((i) => i.instanceId !== action.instanceId)),
      }

    case 'toggleItem':
      return {
        ...state,
        compose: updateSlot(compose, action.slot, (items) =>
          items.map((i) => (i.instanceId === action.instanceId ? { ...i, enabled: !i.enabled } : i)),
        ),
      }

    case 'moveItem': {
      const items = compose.slots[action.slot]
      const idx = items.findIndex((i) => i.instanceId === action.instanceId)
      const target = idx + action.direction
      if (idx < 0 || target < 0 || target >= items.length) return state
      const next = items.slice()
      const [moved] = next.splice(idx, 1)
      next.splice(target, 0, moved)
      return { ...state, compose: { ...compose, slots: { ...compose.slots, [action.slot]: next } } }
    }

    case 'setVar':
      return {
        ...state,
        compose: updateSlot(compose, action.slot, (items) =>
          items.map((i) => (i.instanceId === action.instanceId ? { ...i, vars: { ...i.vars, [action.name]: action.value } } : i)),
        ),
      }

    case 'setManualText':
      return { ...state, compose: { ...compose, manualText: action.text } }

    case 'setCompose':
      return { ...state, compose: action.compose }

    /* ---- 用户自定义卡 ---- */
    case 'addUserCard':
      return { ...state, userCards: [...state.userCards, action.card] }

    case 'updateUserCard':
      return {
        ...state,
        userCards: state.userCards.map((c) => (c.id === action.card.id ? action.card : c)),
      }

    case 'removeUserCard':
      return { ...state, userCards: state.userCards.filter((c) => c.id !== action.cardId) }

    /* ---- 配方 ---- */
    case 'saveRecipe':
      return { ...state, recipes: [...state.recipes, action.recipe] }

    case 'removeRecipe':
      return { ...state, recipes: state.recipes.filter((r) => r.id !== action.recipeId) }

    case 'renameRecipe':
      return {
        ...state,
        recipes: state.recipes.map((r) => (r.id === action.recipeId ? { ...r, name: action.name } : r)),
      }

    /* ---- 数据管理 ---- */
    case 'importData':
      return { ...state, userCards: action.userCards, recipes: action.recipes, compose: action.compose }

    case 'clearAll':
      return {
        ...state,
        userCards: [],
        recipes: [],
        compose: { baseSentence: '', slots: { prefix: [], suffix: [], block: [] }, manualText: null },
      }

    default:
      return state
  }
}
