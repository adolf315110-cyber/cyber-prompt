import { useEffect, useMemo, useReducer, useState } from 'react'
import { CardLibrary } from './components/CardLibrary'
import { Composer } from './components/Composer'
import { PreviewPane } from './components/PreviewPane'
import { Toast } from './components/Toast'
import { PRESET_CARDS } from './data/presetCards'
import { defaultVarsFor, hasUnresolvedVars } from './lib/cardUtils'
import { copyToClipboard } from './lib/clipboard'
import { composePrompt } from './lib/compose'
import { newId } from './lib/ids'
import { appReducer } from './lib/reducer'
import { loadData, saveData } from './lib/storage'
import type { Card } from './types'

export default function App() {
  const [data, dispatch] = useReducer(appReducer, undefined, loadData)
  const [toast, setToast] = useState<string | null>(null)
  const [highlight, setHighlight] = useState<string | null>(null)

  // 状态变化即持久化（含拼装区；userCards/recipes 为 Step 2 预留，当前为空数组）
  useEffect(() => {
    saveData(data)
  }, [data])

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
    setToast(`已插入：${card.title}`)
  }

  const handleCopy = async () => {
    const ok = await copyToClipboard(previewText)
    setToast(ok ? '已复制，可直接粘贴' : '复制失败，请手动选择文本复制')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>提示词方块</h1>
        <span className="app-sub">点卡拼装 · 一键复制</span>
      </header>
      <main className="app-body">
        <CardLibrary cards={allCards} onInsert={handleInsert} />
        <Composer
          compose={data.compose}
          cardsById={cardsById}
          dispatch={dispatch}
          highlightInstanceId={highlight}
        />
        <PreviewPane
          text={previewText}
          manual={data.compose.manualText !== null}
          unresolved={unresolved}
          onManualChange={(text) => dispatch({ type: 'setManualText', text })}
          onCopy={handleCopy}
        />
      </main>
      <Toast message={toast} />
    </div>
  )
}
