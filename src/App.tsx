import { useEffect, useMemo, useReducer, useState } from 'react'
import { CardLibrary } from './components/CardLibrary'
import { Composer } from './components/Composer'
import { PreviewPane } from './components/PreviewPane'
import { Toast } from './components/Toast'
import { PRESET_CARDS } from './data/presetCards'
import { defaultVarsFor, hasUnresolvedVars } from './lib/cardUtils'
import { copyToClipboard } from './lib/clipboard'
import { composePrompt } from './lib/compose'
import { HTML_LANG, PAGE_TITLE, UI, loadLang, saveLang, type Lang } from './lib/i18n'
import { newId } from './lib/ids'
import { appReducer } from './lib/reducer'
import { loadData, saveData } from './lib/storage'
import type { Card } from './types'

export default function App() {
  const [data, dispatch] = useReducer(appReducer, undefined, loadData)
  const [toast, setToast] = useState<string | null>(null)
  const [highlight, setHighlight] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>(() => loadLang())
  const ui = UI[lang]

  // 状态变化即持久化（含拼装区；userCards/recipes 为 Step 2 预留，当前为空数组）
  useEffect(() => {
    saveData(data)
  }, [data])

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

  const cardsById = useMemo(() => {
    const map = new Map<string, Card>()
    for (const c of allCards) map.set(c.id, c)
    return map
  }, [allCards])

  const composed = useMemo(() => composePrompt(data.compose, cardsById), [data.compose, cardsById])
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
      <main className="app-body">
        <CardLibrary cards={allCards} onInsert={handleInsert} ui={ui} />
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
      <Toast message={toast} />
    </div>
  )
}
