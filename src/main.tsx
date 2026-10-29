import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { UI, loadLang } from './lib/i18n'
import { STORAGE_KEY } from './lib/storage'
import './styles.css'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('缺少 #root 挂载点')

// 兜底界面的文案跟随当前界面语言（与 App 用同一个 loadLang：用户手动切过的语言优先）
const ui = UI[loadLang()]

// 自救出口：异常若由持久化数据引起，刷新会复现——给一条能脱困的路
function resetLocalData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* 隐私模式下删不掉：照样刷新，让用户看到后续表现 */
  }
  window.location.reload()
}

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary
      texts={{
        title: ui.errorTitle,
        body: ui.errorBody,
        reload: ui.errorReload,
        details: ui.errorDetails,
        reset: ui.errorReset,
      }}
      onResetData={resetLocalData}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
