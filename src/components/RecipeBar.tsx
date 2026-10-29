import { useState } from 'react'
import type { UiStrings } from '../lib/i18n'
import type { Recipe } from '../types'

interface Props {
  recipes: Recipe[]
  /** 拼装区为空时不允许存配方（存了也是空配方） */
  canSave: boolean
  onSave: (name: string) => void
  onRestore: (recipe: Recipe) => void
  onRename: (recipe: Recipe, name: string) => void
  onDelete: (recipe: Recipe) => void
  /** 名称为空时回调（由 App 弹提示），避免点了没反应 */
  onInvalidName: () => void
  ui: UiStrings
}

/** 顶部配方条：一键存为 / 还原 / 重命名 / 删除 */
export function RecipeBar({ recipes, canSave, onSave, onRestore, onRename, onDelete, onInvalidName, ui }: Props) {
  const [newName, setNewName] = useState<string | null>(null)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameText, setRenameText] = useState('')

  const commitNew = () => {
    const name = (newName ?? '').trim()
    if (!name) {
      onInvalidName()
      return
    }
    onSave(name)
    setNewName(null)
  }

  const commitRename = (recipe: Recipe) => {
    const name = renameText.trim()
    setRenameId(null)
    if (!name) {
      onInvalidName()
      return
    }
    if (name === recipe.name) return
    onRename(recipe, name)
  }

  return (
    <div className="recipe-bar">
      <span className="recipe-label">{ui.recipesLabel}</span>

      {recipes.length === 0 && <span className="muted">{ui.noRecipes}</span>}

      {recipes.map((recipe) =>
        renameId === recipe.id ? (
          <span key={recipe.id} className="recipe-chip editing">
            <input
              type="text"
              autoFocus
              value={renameText}
              onChange={(e) => setRenameText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename(recipe)
                if (e.key === 'Escape') setRenameId(null)
              }}
              placeholder={ui.recipeNamePlaceholder}
            />
            <button type="button" onClick={() => commitRename(recipe)} title={ui.confirmOk}>
              ✓
            </button>
            <button type="button" onClick={() => setRenameId(null)} title={ui.cancel}>
              ×
            </button>
          </span>
        ) : (
          <span key={recipe.id} className="recipe-chip">
            <button type="button" className="recipe-name" onClick={() => onRestore(recipe)} title={ui.restoreRecipe}>
              {recipe.name}
            </button>
            <button
              type="button"
              onClick={() => {
                setRenameId(recipe.id)
                setRenameText(recipe.name)
              }}
              title={ui.renameRecipe}
            >
              ✎
            </button>
            <button type="button" onClick={() => onDelete(recipe)} title={ui.deleteRecipe}>
              ×
            </button>
          </span>
        ),
      )}

      {newName === null ? (
        <button type="button" className="recipe-add" onClick={() => setNewName('')} disabled={!canSave}>
          + {ui.saveRecipe}
        </button>
      ) : (
        <span className="recipe-chip editing">
          <input
            type="text"
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitNew()
              if (e.key === 'Escape') setNewName(null)
            }}
            placeholder={ui.recipeNamePlaceholder}
          />
          <button type="button" onClick={commitNew} title={ui.confirmOk}>
            ✓
          </button>
          <button type="button" onClick={() => setNewName(null)} title={ui.cancel}>
            ×
          </button>
        </span>
      )}
    </div>
  )
}
