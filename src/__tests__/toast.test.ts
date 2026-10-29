import { describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Toast } from '../components/Toast'
import { downloadJson } from '../lib/storage'

describe('Toast 组件', () => {
  it('有消息时渲染 toast 容器与消息文本', () => {
    const html = renderToStaticMarkup(createElement(Toast, { message: '已插入：先划信任边界' }))
    expect(html).toContain('class="toast"')
    expect(html).toContain('已插入：先划信任边界')
    expect(html).toContain('role="status"')
  })

  it('无消息时不渲染任何内容', () => {
    expect(renderToStaticMarkup(createElement(Toast, { message: null }))).toBe('')
  })

  it('空字符串也不渲染', () => {
    expect(renderToStaticMarkup(createElement(Toast, { message: '' }))).toBe('')
  })
})

interface FakeAnchor {
  href: string
  download: string
  clicked: number
}

describe('ErrorBoundary（渲染期异常兜底）', () => {
  const texts = { title: '界面出错了', body: '数据没丢', reload: '刷新页面', details: '错误详情', reset: '重置本地数据' }

  it('没有异常时正常渲染子内容', () => {
    const html = renderToStaticMarkup(
      createElement(ErrorBoundary, { texts }, createElement('span', null, '正常内容')),
    )
    expect(html).toContain('正常内容')
    expect(html).not.toContain('界面出错了')
  })

  it('异常时进入兜底状态（记住错误）', () => {
    const state = ErrorBoundary.getDerivedStateFromError(new Error('boom'))
    expect(state.error).toBeInstanceOf(Error)
    expect(state.error?.message).toBe('boom')
  })
})

describe('downloadJson（导出下载）', () => {
  function installFakeDom() {
    const g = globalThis as unknown as Record<string, unknown>
    const saved = {
      document: g.document,
      createObjectURL: (URL as unknown as Record<string, unknown>).createObjectURL,
      revokeObjectURL: (URL as unknown as Record<string, unknown>).revokeObjectURL,
      Blob: g.Blob,
    }
    const anchors: FakeAnchor[] = []
    const blobs: Blob[] = []
    const revoked: string[] = []

    class RecordingBlob extends (saved.Blob as typeof Blob) {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        blobs.push(this)
      }
    }

    g.Blob = RecordingBlob
    g.document = {
      createElement: () => {
        const anchor: FakeAnchor = { href: '', download: '', clicked: 0 }
        anchors.push(anchor)
        return {
          set href(v: string) {
            anchor.href = v
          },
          get href() {
            return anchor.href
          },
          set download(v: string) {
            anchor.download = v
          },
          get download() {
            return anchor.download
          },
          click: () => {
            anchor.clicked++
          },
        }
      },
      body: { appendChild: () => {}, removeChild: () => {} },
    }
    const urlStub = {
      createObjectURL: (blob: Blob) => {
        void blob
        return 'blob:fake'
      },
      revokeObjectURL: (url: string) => {
        revoked.push(url)
      },
    }
    g.URL = urlStub

    return {
      anchors,
      blobs,
      revoked,
      restore: () => {
        g.document = saved.document
        g.Blob = saved.Blob
        g.URL = { createObjectURL: saved.createObjectURL, revokeObjectURL: saved.revokeObjectURL }
      },
    }
  }

  it('创建带 download 文件名的 <a> 并触发点击，URL 在延时后被回收', async () => {
    vi.useFakeTimers()
    const dom = installFakeDom()
    try {
      downloadJson('prompt-blocks-2026-10-28.json', { app: 'prompt-blocks', cards: [] })

      expect(dom.anchors).toHaveLength(1)
      expect(dom.anchors[0].download).toBe('prompt-blocks-2026-10-28.json')
      expect(dom.anchors[0].href).toBe('blob:fake')
      expect(dom.anchors[0].clicked).toBe(1)

      // 落盘内容是格式化后的 JSON
      expect(await dom.blobs[0].text()).toBe(JSON.stringify({ app: 'prompt-blocks', cards: [] }, null, 2))

      // URL 延迟回收：立刻还没回收，1 秒后回收
      expect(dom.revoked).toEqual([])
      vi.advanceTimersByTime(1000)
      expect(dom.revoked).toEqual(['blob:fake'])
    } finally {
      dom.restore()
      vi.useRealTimers()
    }
  })
})
