import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children?: ReactNode
  /** 兜底界面上的文案（由 i18n 层提供，保持中英一致） */
  texts: {
    title: string
    body: string
    reload: string
    details: string
    reset: string
  }
  /** 自救出口：清掉本地数据键后重试（异常由持久化数据引起时唯一能脱困的办法） */
  onResetData?: () => void
}

interface State {
  error: Error | null
}

/**
 * 顶层错误边界。
 *
 * 没有它，任何渲染期异常都会让 React 卸载整棵树 → 界面全白，
 * 用户以为数据丢了。接上它之后：界面显示可读的错误与「刷新页面」，
 * 而浏览器 localStorage 里的数据始终没被动过。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    const { texts } = this.props
    return (
      <div className="error-screen">
        <h2>{texts.title}</h2>
        <p>{texts.body}</p>
        <details>
          <summary>{texts.details}</summary>
          <pre>{String(error.stack ?? error.message)}</pre>
        </details>
        <button type="button" className="primary" onClick={() => window.location.reload()}>
          {texts.reload}
        </button>
        {this.props.onResetData && (
          <button type="button" className="danger-ghost" onClick={this.props.onResetData}>
            {texts.reset}
          </button>
        )}
      </div>
    )
  }
}
