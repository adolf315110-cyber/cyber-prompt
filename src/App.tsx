import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { CardEditor } from './components/CardEditor'
import { CardLibrary } from './components/CardLibrary'
import { Composer } from './components/Composer'
import { ConfirmDialog } from './components/ConfirmDialog'
import { DataDialog } from './components/DataDialog'
import { PreviewPane } from './components/PreviewPane'
import { RecipeBar } from './components/RecipeBar'
import { Toast } from './components/Toast'
import { PRESET_CARDS } from './data/presetCards'
import { defaultVarsFor, hasUnresolvedVars } from './lib/cardUtils'
import { copyToClipboard } from './lib/clipboard'
import { composePrompt } from './lib/compose'
import { HTML_LANG, PAGE_TITLE, UI, loadLang, saveLang, type Lang } from './lib/i18n'
import { newId } from './lib/ids'
import { localizeCard } from './lib/localize'
import { appReducer } from './lib/reducer'
import { composeToRecipe, recipeToCompose } from './lib/recipe'
import {
  buildExportFile,
  downloadJson,
  lastLoadCorrupted,
  loadData,
  mergeById,
  parseImportFile,
  readFileAsText,
  saveData,
} from './lib/storage'
import type { Card, Recipe } from './types'

interface EditorState {
  /** 表单初始值 */
  initial: Card
  /** 非 null = 编辑既有卡（null = 新建） */
  existing: Card | null
}

interface ConfirmState {
  title: string
  message: ReactNode
  onConfirm: () => void
  danger?: boolean
}

/** 空白用户卡草稿 */
function blankUserCard(): Card {
  return {
    id: newId('user'),
    category: 'general',
    title: '',
    text: '',
    mode: 'suffix',
    vars: [],
    tags: [],
    builtin: false,
  }
}

export default function App() {
  const [data, dispatch] = useReducer(appReducer, undefined, loadData)
  const [toast, setToast] = useState<string | null>(null)
  const [highlight, setHighlight] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>(() => loadLang())
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const [dataDialogOpen, setDataDialogOpen] = useState(false)
  const ui = UI[lang]

  // 状态变化即持久化（含拼装区、用户卡、配方）；写失败要如实告诉用户
  const storageWarned = useRef(false)
  useEffect(() => {
    if (!saveData(data) && !storageWarned.current) {
      storageWarned.current = true
      setToast(ui.storageFailed)
    }
  }, [data, ui.storageFailed])

  // 上次读取时数据损坏并回退过：如实提示（原始内容已另存备份）
  const corrupted = useRef(lastLoadCorrupted()).current
  useEffect(() => {
    if (corrupted) setToast(ui.storageRecovered)
  }, [corrupted, ui.storageRecovered])

  // 界面语言：持久化偏好，并同步 <html lang> 与页面标题
  useEffect(() => {
    saveLang(lang)
    document.documentElement.lang = HTML_LANG[lang]
    document.title = PAGE_TITLE[lang]
  }, [lang])

  // toast 自动消失
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(t)
  }, [toast])

  // 插入高亮自动消退
  useEffect(() => {
    if (!highlight) return
    const t = window.setTimeout(() => setHighlight(null), 1200)
    return () => window.clearTimeout(t)
  }, [highlight])

  const allCards = useMemo(() => [...PRESET_CARDS, ...data.userCards], [data.userCards])
  // 语言层：en 时用内置英译层覆写卡片内容（vars 的 key 指回原变量名，已填值不丢失）
  const localizedCards = useMemo(() => allCards.map((c) => localizeCard(c, lang)), [allCards, lang])

  const cardsById = useMemo(() => {
    const map = new Map<string, Card>()
    for (const c of localizedCards) map.set(c.id, c)
    return map
  }, [localizedCards])

  // 原始（未本地化）卡片：编辑自定义卡时要改的是存下来的那份，不是界面上显示的那份
  const rawCardsById = useMemo(() => {
    const map = new Map<string, Card>()
    for (const c of allCards) map.set(c.id, c)
    return map
  }, [allCards])

  const composed = useMemo(() => composePrompt(data.compose, cardsById, lang), [data.compose, cardsById, lang])
  const previewText = data.compose.manualText ?? composed
  const unresolved = data.compose.manualText === null && hasUnresolvedVars(previewText)

  const handleInsert = (card: Card) => {
    const instanceId = newId('inst')
    dispatch({ type: 'insertCard', cardId: card.id, mode: card.mode, instanceId, vars: defaultVarsFor(card) })
    setHighlight(instanceId)
    setToast(ui.inserted(card.title))
  }

  const handleCopy = async () => {
    const ok = await copyToClipboard(previewText)
    setToast(ok ? ui.copied : ui.copyFailed)
  }

  /* ---------------- 自定义卡 ---------------- */

  const handleNewCard = () => {
    const draft = blankUserCard()
    setEditor({ initial: draft, existing: null })
  }

  /** 复制预置卡为自定义卡：复制界面当前所见（英文界面下即英译内容），并去掉英译层的变量 key */
  const handleCopyToCustom = (card: Card) => {
    const draft: Card = {
      ...card,
      id: newId('user'),
      builtin: false,
      vars: card.vars.map((v) => ({ name: v.name, default: v.default })),
    }
    setEditor({ initial: draft, existing: null })
    setToast(ui.cardCopiedToCustom)
  }

  const handleEditCard = (card: Card) => {
    const raw = rawCardsById.get(card.id)
    if (!raw) return
    setEditor({ initial: raw, existing: raw })
  }

  const handleSaveCard = (card: Card) => {
    if (editor?.existing) dispatch({ type: 'updateUserCard', card })
    else dispatch({ type: 'addUserCard', card })
    setEditor(null)
    setToast(ui.cardSaved)
  }

  const handleDeleteCard = (card: Card) => {
    setConfirm({
      title: ui.deleteCard,
      message: ui.confirmDeleteCard,
      danger: true,
      onConfirm: () => {
        dispatch({ type: 'removeUserCard', cardId: card.id })
        setEditor(null)
        setToast(ui.cardDeletedToast)
      },
    })
  }

  /* ---------------- 配方 ---------------- */

  const handleSaveRecipe = (name: string) => {
    const recipe = composeToRecipe(newId('recipe'), name, data.compose)
    dispatch({ type: 'saveRecipe', recipe })
    setToast(ui.recipeSaved(name))
  }

  const handleRestoreRecipe = (recipe: Recipe) => {
    setConfirm({
      title: ui.restoreRecipe,
      message: ui.confirmRestoreRecipe,
      onConfirm: () => {
        const { compose, missing } = recipeToCompose(recipe, cardsById, () => newId('inst'))
        dispatch({ type: 'setCompose', compose })
        // 还原成功与「有卡缺失」都要告诉用户，不能只报其一
        const notes = [ui.recipeRestored(recipe.name)]
        if (missing.length > 0) notes.push(ui.recipeMissingCards(missing.length))
        setToast(notes.join(' · '))
      },
    })
  }

  const handleRenameRecipe = (recipe: Recipe, name: string) => {
    dispatch({ type: 'renameRecipe', recipeId: recipe.id, name })
    setToast(ui.recipeRenamed)
  }

  const handleDeleteRecipe = (recipe: Recipe) => {
    setConfirm({
      title: ui.deleteRecipe,
      message: ui.confirmDeleteRecipe(recipe.name),
      danger: true,
      onConfirm: () => {
        dispatch({ type: 'removeRecipe', recipeId: recipe.id })
        setToast(ui.recipeDeleted(recipe.name))
      },
    })
  }

  /* ---------------- 数据管理 ---------------- */

  const handleExport = () => {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const filename = `prompt-blocks-${stamp}.json`
    downloadJson(filename, buildExportFile(data, new Date().toISOString()))
    setToast(ui.exported(filename))
  }

  const handleImport = async (file: File) => {
    setDataDialogOpen(false)
    let text: string
    try {
      text = await readFileAsText(file)
    } catch {
      setToast(ui.importFailed)
      return
    }
    const parsed = parseImportFile(text)
    if (!parsed.ok) {
      setToast(ui.importFailed)
      return
    }
    const cardsMerge = mergeById(data.userCards, parsed.cards)
    const recipesMerge = mergeById(data.recipes, parsed.recipes)
    const cardsAdded = parsed.cards.length - cardsMerge.skipped
    const recipesAdded = parsed.recipes.length - recipesMerge.skipped
    // 文件里没有拼装区时保持现状，不清空——确认框里的说明必须与实际行为一致
    const composeToRestore = parsed.compose ?? data.compose
    setConfirm({
      title: ui.importData,
      message: (
        <>
          <p>{ui.importConfirm(cardsAdded, recipesAdded)}</p>
          <p className="muted">{parsed.compose ? ui.importConfirmCompose : ui.importConfirmNoCompose}</p>
        </>
      ),
      onConfirm: () => {
        dispatch({
          type: 'importData',
          userCards: cardsMerge.merged,
          recipes: recipesMerge.merged,
          compose: composeToRestore,
        })
        const notes = [ui.imported(cardsAdded, recipesAdded)]
        if (cardsMerge.skipped > 0 || recipesMerge.skipped > 0) {
          notes.push(ui.importSkipped(cardsMerge.skipped, recipesMerge.skipped))
        }
        if (parsed.invalid > 0) notes.push(ui.importInvalidEntries(parsed.invalid))
        setToast(notes.join(' · '))
      },
    })
  }

  const handleClearData = () => {
    // 先关掉数据管理弹窗：两个弹窗的遮罩同为 z-index:100，
    // 不关的话确认框会被数据管理弹窗盖住，「确定」按钮点不到。
    setDataDialogOpen(false)
    setConfirm({
      title: ui.clearData,
      message: ui.confirmClear,
      danger: true,
      onConfirm: () => {
        dispatch({ type: 'clearAll' })
        setToast(ui.cleared)
      },
    })
  }

  const composeEmpty =
    data.compose.baseSentence.trim() === '' &&
    data.compose.slots.prefix.length === 0 &&
    data.compose.slots.suffix.length === 0 &&
    data.compose.slots.block.length === 0

  return (
    <div className="app">
      <header className="app-header">
        <h1>{ui.appTitle}</h1>
        <span className="app-sub">{ui.appSubtitle}</span>
        <div className="lang-switch" role="group" aria-label="Language">
          <button
            type="button"
            className={lang === 'zh' ? 'active' : ''}
            aria-pressed={lang === 'zh'}
            onClick={() => setLang('zh')}
          >
            中文
          </button>
          <button
            type="button"
            className={lang === 'en' ? 'active' : ''}
            aria-pressed={lang === 'en'}
            onClick={() => setLang('en')}
          >
            English
          </button>
        </div>
      </header>

      <div className="app-toolbar">
        <RecipeBar
          recipes={data.recipes}
          canSave={!composeEmpty}
          onSave={handleSaveRecipe}
          onRestore={handleRestoreRecipe}
          onRename={handleRenameRecipe}
          onDelete={handleDeleteRecipe}
          onInvalidName={() => setToast(ui.recipeNameRequired)}
          ui={ui}
        />
        <button type="button" className="toolbar-btn" onClick={() => setDataDialogOpen(true)}>
          {ui.dataMenu}
        </button>
      </div>

      <main className="app-body">
        <CardLibrary
          cards={localizedCards}
          onInsert={handleInsert}
          onNewCard={handleNewCard}
          onCopyToCustom={handleCopyToCustom}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
          ui={ui}
        />
        <Composer
          compose={data.compose}
          cardsById={cardsById}
          dispatch={dispatch}
          highlightInstanceId={highlight}
          ui={ui}
        />
        <PreviewPane
          text={previewText}
          manual={data.compose.manualText !== null}
          unresolved={unresolved}
          onManualChange={(text) => dispatch({ type: 'setManualText', text })}
          onCopy={handleCopy}
          ui={ui}
        />
      </main>

      {editor && (
        <CardEditor
          initial={editor.initial}
          existing={editor.existing}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
          onCancel={() => setEditor(null)}
          ui={ui}
        />
      )}

      {dataDialogOpen && (
        <DataDialog
          onExport={handleExport}
          onImport={handleImport}
          onClear={handleClearData}
          onClose={() => setDataDialogOpen(false)}
          ui={ui}
        />
      )}

      {/* 确认框渲染在数据管理弹窗之后：同 z-index 下后渲染者在上层，
          保证确认框永远盖在最上面、不会被其他弹窗挡住 */}
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={ui.confirmOk}
          cancelLabel={ui.confirmCancel}
          closeLabel={ui.close}
          danger={confirm.danger}
          onConfirm={() => {
            confirm.onConfirm()
            setConfirm(null)
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      <Toast message={toast} />
    </div>
  )
}
