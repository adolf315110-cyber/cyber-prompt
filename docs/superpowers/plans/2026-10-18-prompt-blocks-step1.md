# 提示词方块 Step 1 实现计划（卡库 + 点卡插入 + 复制闭环）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 在 `D:\dream` 从零搭出 React + Vite + TS 项目，交付「预置卡库（125 张）→ 点卡插入槽位 → 实时预览 → 一键复制」闭环，数据层（localStorage）就位。

**Architecture:** 单一 `PersistedData` 状态对象，经纯函数 reducer 更新；`compose.ts` 把「槽位状态 + 卡库」渲染成最终提示词；三个面板组件只读状态 + dispatch，不做业务逻辑。`src/lib` 全部纯函数、全部可单测；UI 只做展示与事件分发。

**Tech Stack:** React 19 + TypeScript + Vite 8 + vitest（单测）+ vite-plugin-singlefile（可双击的单文件产物）。

**依据文档:** `docs/superpowers/specs/2026-10-18-prompt-blocks-design.md`

**执行约定：**

- 所有命令在 `D:\dream` 执行（作为 workdir）。
- 纯函数任务严格 TDD：写测试 → 跑失败 → 实现 → 跑通过 → 提交。
- 组件任务无单测（spec §11：UI 走人工验收），验收 = `npx tsc --noEmit` 通过 + dev server 页面检查。
- 卡库内容任务：先写数量测试（红）→ 写卡 → 通过（绿）→ 提交。
- 每个任务结束都提交一次 git，提交信息用任务里给出的原文。

---

## 文件结构（Step 1 全部落点）

```
D:\dream
├─ .gitignore
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ README.md
├─ docs/superpowers/...                      # 已有：spec + 本计划
└─ src/
   ├─ main.tsx
   ├─ App.tsx
   ├─ styles.css
   ├─ types.ts
   ├─ data/
   │   ├─ presetCards.ts                    # 汇总导出 PRESET_CARDS
   │   └─ preset/
   │       ├─ secAudit.ts                   # 30 张（安全审计）
   │       ├─ pentest.ts                    # 30 张（渗透测试）
   │       ├─ coding.ts                     # 25 张（编程）
   │       ├─ output.ts                     # 20 张（输出格式）
   │       └─ general.ts                    # 20 张（通用）
   ├─ lib/
   │   ├─ cardUtils.ts                      # 变量提取 / 默认值 / 未填检测
   │   ├─ compose.ts                        # 槽位 → 文本（核心拼接规则）
   │   ├─ reducer.ts                        # 纯函数 reducer + AppAction
   │   ├─ storage.ts                        # localStorage 读写 + 默认值 + 校验
   │   ├─ ids.ts                            # id 生成
   │   └─ clipboard.ts                      # 复制（含 file:// 回退）
   ├─ components/
   │   ├─ CardLibrary.tsx  CardItem.tsx
   │   ├─ Composer.tsx  SlotSection.tsx  SlotItemRow.tsx
   │   ├─ PreviewPane.tsx
   │   └─ Toast.tsx
   └─ __tests__/
       ├─ cardUtils.test.ts
       ├─ compose.test.ts
       ├─ reducer.test.ts
       ├─ storage.test.ts
       └─ presetCards.test.ts
```

---

## Task 0: 项目脚手架

**Files:**
- Create: `package.json`, `.gitignore`, `index.html`, `tsconfig.json`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`

- [x] **Step 1: 写 `package.json`**

```json
{
  "name": "prompt-blocks",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [x] **Step 2: 写 `.gitignore`**

```
node_modules/
dist/
*.local
```

- [x] **Step 3: 写 `index.html`**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>提示词方块</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [x] **Step 4: 写 `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["vite/client"],
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src", "vite.config.ts"]
}
```

- [x] **Step 5: 写 `vite.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

- [x] **Step 6: 写 `src/main.tsx`、`src/App.tsx`、`src/styles.css`（占位版，Task 15 会替换）**

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('缺少 #root 挂载点')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/App.tsx`:

```tsx
export default function App() {
  return <div className="app">提示词方块</div>
}
```

`src/styles.css`:

```css
body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif;
}
```

- [x] **Step 7: 安装依赖**

Run:

```powershell
npm install react react-dom
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom vitest vite-plugin-singlefile
```

Expected: 两个命令都成功退出；`node_modules` 生成；`package.json` 中出现 dependencies 与 devDependencies 且版本已写入。（若 `vitest` 与 `vite` 8 发生 peer 冲突，按 npm 提示安装兼容大版本并记录在提交信息里。）

- [x] **Step 8: 类型检查**

Run: `npx tsc --noEmit`
Expected: 无输出、退出码 0。

- [x] **Step 9: 启动 dev server 验证骨架**

Run（后台）: `npm run dev`
Expected: 输出 `Local: http://localhost:5173/`；用浏览器打开该地址，页面显示「提示词方块」，Console 无 error。

- [x] **Step 10: 提交**

```powershell
git add -A
git commit -m "chore: 脚手架（Vite + React + TS + vitest + singlefile）"
```

---

## Task 1: 类型定义 + 卡片工具函数（TDD）

**Files:**
- Create: `src/types.ts`
- Test: `src/__tests__/cardUtils.test.ts`
- Create: `src/lib/cardUtils.ts`

- [x] **Step 1: 写 `src/types.ts`（无逻辑，直接写）**

```ts
export type Category = 'sec-audit' | 'pentest' | 'coding' | 'output' | 'general'
export type Mode = 'prefix' | 'suffix' | 'block'

export interface CardVar {
  name: string
  default?: string
}

export interface Card {
  id: string
  category: Category
  title: string
  text: string
  mode: Mode
  vars: CardVar[]
  tags: string[]
  note?: string
  builtin: boolean
}

export interface RecipeItem {
  cardId: string
  vars: Record<string, string>
  enabled: boolean
}

export interface Recipe {
  id: string
  name: string
  baseSentence: string
  items: RecipeItem[]
}

export interface SlotItem {
  instanceId: string
  cardId: string
  vars: Record<string, string>
  enabled: boolean
}

export interface SlotState {
  prefix: SlotItem[]
  suffix: SlotItem[]
  block: SlotItem[]
}

export interface ComposeState {
  baseSentence: string
  slots: SlotState
  manualText: string | null
}

export interface PersistedData {
  schemaVersion: number
  userCards: Card[]
  recipes: Recipe[]
  compose: ComposeState
}

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'sec-audit', label: '安全审计' },
  { id: 'pentest', label: '渗透测试' },
  { id: 'coding', label: '编程' },
  { id: 'output', label: '输出格式' },
  { id: 'general', label: '通用' },
]

export const MODE_LABELS: Record<Mode, string> = {
  prefix: '前缀',
  suffix: '后缀',
  block: '段落',
}
```

- [x] **Step 2: 写失败的测试 `src/__tests__/cardUtils.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { defaultVarsFor, extractVarNames, hasUnresolvedVars } from '../lib/cardUtils'
import type { Card } from '../types'

const sample: Card = {
  id: 'builtin:general-99',
  category: 'general',
  title: '样例',
  text: '目标语言：{语言}，篇幅：{篇幅}，再次强调 {语言}',
  mode: 'block',
  vars: [
    { name: '语言', default: '中文' },
    { name: '篇幅' },
  ],
  tags: ['样例', '测试'],
  builtin: true,
}

describe('extractVarNames', () => {
  it('按出现顺序提取全部变量名且去重', () => {
    expect(extractVarNames(sample.text)).toEqual(['语言', '篇幅'])
  })
  it('没有变量时返回空数组', () => {
    expect(extractVarNames('普通文本，没有占位符')).toEqual([])
  })
})

describe('defaultVarsFor', () => {
  it('有默认值用默认值，无默认值用空字符串', () => {
    expect(defaultVarsFor(sample)).toEqual({ 语言: '中文', 篇幅: '' })
  })
  it('无变量卡返回空对象', () => {
    expect(defaultVarsFor({ ...sample, text: '无变量', vars: [] })).toEqual({})
  })
})

describe('hasUnresolvedVars', () => {
  it('存在 {xxx} 时返回 true', () => {
    expect(hasUnresolvedVars('目标语言：{语言}')).toBe(true)
  })
  it('不存在占位符时返回 false', () => {
    expect(hasUnresolvedVars('目标语言：中文')).toBe(false)
  })
})
```

- [x] **Step 3: 跑测试确认失败**

Run: `npx vitest run src/__tests__/cardUtils.test.ts`
Expected: FAIL —— `Failed to resolve import "../lib/cardUtils"`（模块还不存在）。

- [x] **Step 4: 实现 `src/lib/cardUtils.ts`**

```ts
import type { Card } from '../types'

const VAR_PATTERN = /\{([^{}]+)\}/g

/** 按出现顺序提取文本中的变量名（去重） */
export function extractVarNames(text: string): string[] {
  const names: string[] = []
  for (const match of text.matchAll(VAR_PATTERN)) {
    if (!names.includes(match[1])) names.push(match[1])
  }
  return names
}

/** 生成实例的初始变量表：默认值优先，无默认值为空串 */
export function defaultVarsFor(card: Card): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const v of card.vars) vars[v.name] = v.default ?? ''
  return vars
}

/** 渲染结果里是否仍有未填写的 {占位符} */
export function hasUnresolvedVars(text: string): boolean {
  return /\{[^{}]+\}/.test(text)
}
```

- [x] **Step 5: 跑测试确认通过**

Run: `npx vitest run src/__tests__/cardUtils.test.ts`
Expected: PASS —— 7 个用例全绿。

- [x] **Step 6: 提交**

```powershell
git add -A
git commit -m "feat: 类型定义与卡片工具函数（变量提取/默认值/未填检测）"
```

---

## Task 2: 拼装核心 compose.ts（TDD）

**Files:**
- Test: `src/__tests__/compose.test.ts`
- Create: `src/lib/compose.ts`
- Create: `src/lib/storage.ts`（本任务只落 `defaultCompose`/`defaultData` 部分，Task 4 补齐读写；测试会用到）

> 注：`compose.test.ts` 依赖 `defaultCompose()`。为避免顺序耦合，本任务直接把 `src/lib/storage.ts` 完整实现掉（Task 4 只补测试与验证，不再改实现）。

- [x] **Step 1: 写失败的测试 `src/__tests__/compose.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { composePrompt, renderCardText } from '../lib/compose'
import { defaultCompose } from '../lib/storage'
import type { Card, ComposeState, Mode, SlotItem } from '../types'

let seq = 0
function card(id: string, text: string, mode: Mode, vars: Card['vars'] = []): Card {
  return { id, category: 'general', title: `标题-${id}`, text, mode, vars, tags: ['测试', '样例'], builtin: true }
}

function item(cardId: string, vars: Record<string, string> = {}, enabled = true): SlotItem {
  seq += 1
  return { instanceId: `i${seq}`, cardId, vars, enabled }
}

function state(partial: Partial<ComposeState>): ComposeState {
  return { ...defaultCompose(), ...partial }
}

function mapOf(...cards: Card[]): Map<string, Card> {
  return new Map(cards.map((c) => [c.id, c]))
}

describe('renderCardText', () => {
  it('用填写的值替换变量', () => {
    const c = card('c1', '目标语言：{语言}', 'block', [{ name: '语言', default: '中文' }])
    expect(renderCardText(c, { 语言: '英文' })).toBe('目标语言：英文')
  })
  it('未填写但有默认值时用默认值', () => {
    const c = card('c1', '目标语言：{语言}', 'block', [{ name: '语言', default: '中文' }])
    expect(renderCardText(c, {})).toBe('目标语言：中文')
  })
  it('未填写且无默认值时保留占位符', () => {
    const c = card('c1', '目标语言：{语言}', 'block', [{ name: '语言' }])
    expect(renderCardText(c, {})).toBe('目标语言：{语言}')
  })
  it('同一变量多次出现全部替换', () => {
    const c = card('c1', '{语言}输出，并用{语言}写报告', 'block', [{ name: '语言', default: '中文' }])
    expect(renderCardText(c, {})).toBe('中文输出，并用中文写报告')
  })
  it('渲染结果去掉首尾空白', () => {
    const c = card('c1', '  并给出 PoC  ', 'suffix')
    expect(renderCardText(c, {})).toBe('并给出 PoC')
  })
})

describe('composePrompt', () => {
  it('全部为空时返回空字符串', () => {
    expect(composePrompt(defaultCompose(), new Map())).toBe('')
  })
  it('前缀 + 基础句 + 后缀 用「，」连接', () => {
    const cards = mapOf(card('p', '以 OWASP Top 10 的视角', 'prefix'), card('s', '并给出可运行 PoC', 'suffix'))
    const st = state({ baseSentence: '帮我审计这段代码', slots: { prefix: [item('p')], suffix: [item('s')], block: [] } })
    expect(composePrompt(st, cards)).toBe('以 OWASP Top 10 的视角，帮我审计这段代码，并给出可运行 PoC')
  })
  it('基础句以终结标点结尾时后缀不再加「，」', () => {
    const cards = mapOf(card('s', '并给出可运行 PoC', 'suffix'))
    const st = state({ baseSentence: '帮我审计这段代码。', slots: { prefix: [], suffix: [item('s')], block: [] } })
    expect(composePrompt(st, cards)).toBe('帮我审计这段代码。并给出可运行 PoC')
  })
  it('基础句为空时前缀与后缀用「，」直连', () => {
    const cards = mapOf(card('p', '以 OWASP Top 10 的视角', 'prefix'), card('s', '并给出可运行 PoC', 'suffix'))
    const st = state({ slots: { prefix: [item('p')], suffix: [item('s')], block: [] } })
    expect(composePrompt(st, cards)).toBe('以 OWASP Top 10 的视角，并给出可运行 PoC')
  })
  it('同槽多张卡按槽内顺序以「，」连接', () => {
    const cards = mapOf(card('a', '以 OWASP Top 10 的视角', 'prefix'), card('b', '从攻击者角度思考', 'prefix'))
    const st = state({ baseSentence: '审计这段代码', slots: { prefix: [item('a'), item('b')], suffix: [], block: [] } })
    expect(composePrompt(st, cards)).toBe('以 OWASP Top 10 的视角，从攻击者角度思考，审计这段代码')
  })
  it('段落卡独立成段，与前文空行分隔', () => {
    const cards = mapOf(card('k', '输出要求：中文、含 PoC、按 CVSS 评分', 'block'))
    const st = state({ baseSentence: '帮我审计这段代码', slots: { prefix: [], suffix: [], block: [item('k')] } })
    expect(composePrompt(st, cards)).toBe('帮我审计这段代码\n\n输出要求：中文、含 PoC、按 CVSS 评分')
  })
  it('多个段落卡之间空行分隔', () => {
    const cards = mapOf(card('k1', '约束：最小改动', 'block'), card('k2', '输出要求：中文', 'block'))
    const st = state({ baseSentence: '修复这个 bug', slots: { prefix: [], suffix: [], block: [item('k1'), item('k2')] } })
    expect(composePrompt(st, cards)).toBe('修复这个 bug\n\n约束：最小改动\n\n输出要求：中文')
  })
  it('停用的实例不参与拼装', () => {
    const cards = mapOf(card('s', '并给出 PoC', 'suffix'))
    const st = state({ baseSentence: '审计代码', slots: { prefix: [], suffix: [item('s', {}, false)], block: [] } })
    expect(composePrompt(st, cards)).toBe('审计代码')
  })
  it('卡片已被删除的实例被跳过', () => {
    const st = state({ baseSentence: '审计代码', slots: { prefix: [], suffix: [item('ghost')], block: [] } })
    expect(composePrompt(st, new Map())).toBe('审计代码')
  })
  it('变量未填时预览保留占位符原样', () => {
    const cards = mapOf(card('v', '目标语言：{语言}', 'block', [{ name: '语言' }]))
    const st = state({ baseSentence: '审计代码', slots: { prefix: [], suffix: [], block: [item('v')] } })
    expect(composePrompt(st, cards)).toBe('审计代码\n\n目标语言：{语言}')
  })
  it('变量已填时替换为填写值', () => {
    const cards = mapOf(card('v', '目标语言：{语言}', 'block', [{ name: '语言', default: '中文' }]))
    const st = state({ baseSentence: '审计代码', slots: { prefix: [], suffix: [], block: [item('v', { 语言: '英文' })] } })
    expect(composePrompt(st, cards)).toBe('审计代码\n\n目标语言：英文')
  })
})
```

- [x] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/__tests__/compose.test.ts`
Expected: FAIL —— `Failed to resolve import "../lib/compose"`。

- [x] **Step 3: 实现 `src/lib/storage.ts`（完整版，Task 4 只补测试）**

```ts
import type { ComposeState, PersistedData } from '../types'

export const STORAGE_KEY = 'prompt-blocks:v1'
export const SCHEMA_VERSION = 1

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function defaultCompose(): ComposeState {
  return {
    baseSentence: '',
    slots: { prefix: [], suffix: [], block: [] },
    manualText: null,
  }
}

export function defaultData(): PersistedData {
  return { schemaVersion: SCHEMA_VERSION, userCards: [], recipes: [], compose: defaultCompose() }
}

function localStorageSafe(): StorageLike | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

function isComposeState(value: unknown): value is ComposeState {
  if (typeof value !== 'object' || value === null) return false
  const c = value as Partial<ComposeState>
  return (
    typeof c.baseSentence === 'string' &&
    (c.manualText === null || typeof c.manualText === 'string') &&
    typeof c.slots === 'object' &&
    c.slots !== null &&
    Array.isArray(c.slots.prefix) &&
    Array.isArray(c.slots.suffix) &&
    Array.isArray(c.slots.block)
  )
}

function isPersistedData(value: unknown): value is PersistedData {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Partial<PersistedData>
  return (
    v.schemaVersion === SCHEMA_VERSION &&
    Array.isArray(v.userCards) &&
    Array.isArray(v.recipes) &&
    isComposeState(v.compose)
  )
}

/** 读取本地数据；任何异常/版本不符都回退默认值（未来迁移：在此按 schemaVersion 转换） */
export function loadData(storage: StorageLike | null = localStorageSafe()): PersistedData {
  if (!storage) return defaultData()
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    const parsed: unknown = JSON.parse(raw)
    if (!isPersistedData(parsed)) return defaultData()
    return parsed
  } catch {
    return defaultData()
  }
}

/** 写入本地数据；配额/隐私模式失败时静默降级，不打断使用 */
export function saveData(data: PersistedData, storage: StorageLike | null = localStorageSafe()): void {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* 静默降级 */
  }
}
```

- [x] **Step 4: 实现 `src/lib/compose.ts`**

```ts
import type { Card, ComposeState, SlotItem } from '../types'

const TERMINAL_PUNCT = /[。！？.!?]$/

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 渲染单张卡片文本：已填写值 > 默认值 > 保留 {占位符} */
export function renderCardText(card: Card, vars: Record<string, string>): string {
  let text = card.text
  for (const v of card.vars) {
    const value = (vars[v.name] ?? v.default ?? '').trim()
    if (!value) continue
    const token = new RegExp('\\{' + escapeRegExp(v.name) + '\\}', 'g')
    text = text.replace(token, value)
  }
  return text.trim()
}

function renderItems(items: SlotItem[], cardsById: Map<string, Card>): string[] {
  const out: string[] = []
  for (const item of items) {
    if (!item.enabled) continue
    const card = cardsById.get(item.cardId)
    if (!card) continue
    const text = renderCardText(card, item.vars)
    if (text) out.push(text)
  }
  return out
}

/**
 * 槽位拼装规则（spec §5）：
 * [前缀区] + 基础句 + [后缀区] + [段落区]
 * - 前缀/后缀槽内各段用「，」连接
 * - 前缀与基础句之间用「，」；基础句为空则前缀与后缀用「，」直连
 * - 基础句以终结标点结尾时，后缀直接连接（不加「，」）
 * - 段落独立成段，与前文及彼此之间空行分隔
 */
export function composePrompt(state: ComposeState, cardsById: Map<string, Card>): string {
  const prefix = renderItems(state.slots.prefix, cardsById).join('，')
  const suffix = renderItems(state.slots.suffix, cardsById).join('，')
  const blocks = renderItems(state.slots.block, cardsById)

  const base = state.baseSentence.trim()
  let head = base ? (prefix ? `${prefix}，${base}` : base) : prefix

  if (suffix) {
    if (!head) head = suffix
    else if (TERMINAL_PUNCT.test(head)) head += suffix
    else head += `，${suffix}`
  }

  return [head, ...blocks].filter((s) => s.length > 0).join('\n\n')
}
```

- [x] **Step 5: 跑测试确认通过**

Run: `npx vitest run src/__tests__/compose.test.ts`
Expected: PASS —— 16 个用例全绿。

- [x] **Step 6: 提交**

```powershell
git add -A
git commit -m "feat: 槽位拼装核心（compose）与本地存储基础（storage），附单测"
```

---

## Task 3: 状态 reducer（TDD）

**Files:**
- Test: `src/__tests__/reducer.test.ts`
- Create: `src/lib/reducer.ts`

- [x] **Step 1: 写失败的测试 `src/__tests__/reducer.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { appReducer } from '../lib/reducer'
import { defaultData } from '../lib/storage'
import type { PersistedData } from '../types'

function withData(): PersistedData {
  const data = defaultData()
  data.userCards = [
    { id: 'user:1', category: 'general', title: '用户卡', text: '用户内容', mode: 'suffix', vars: [], tags: ['一', '二'], builtin: false },
  ]
  data.recipes = [{ id: 'r1', name: '配方', baseSentence: '基础', items: [] }]
  return data
}

describe('appReducer', () => {
  it('setBaseSentence 更新基础句', () => {
    const next = appReducer(withData(), { type: 'setBaseSentence', text: '帮我审计这段代码' })
    expect(next.compose.baseSentence).toBe('帮我审计这段代码')
  })

  it('insertCard 追加到对应槽末尾', () => {
    const data = appReducer(withData(), { type: 'insertCard', cardId: 'builtin:general-01', mode: 'prefix', instanceId: 'i1', vars: { 语言: 'Java' } })
    const next = appReducer(data, { type: 'insertCard', cardId: 'builtin:general-02', mode: 'prefix', instanceId: 'i2', vars: {} })
    expect(next.compose.slots.prefix.map((i) => i.instanceId)).toEqual(['i1', 'i2'])
    expect(next.compose.slots.prefix[0].vars).toEqual({ 语言: 'Java' })
    expect(next.compose.slots.prefix[0].enabled).toBe(true)
    expect(next.compose.slots.suffix).toEqual([])
  })

  it('removeItem 只移除指定实例', () => {
    let data = withData()
    data = appReducer(data, { type: 'insertCard', cardId: 'a', mode: 'block', instanceId: 'i1', vars: {} })
    data = appReducer(data, { type: 'insertCard', cardId: 'b', mode: 'block', instanceId: 'i2', vars: {} })
    const next = appReducer(data, { type: 'removeItem', slot: 'block', instanceId: 'i1' })
    expect(next.compose.slots.block.map((i) => i.instanceId)).toEqual(['i2'])
  })

  it('toggleItem 反转启用状态', () => {
    let data = withData()
    data = appReducer(data, { type: 'insertCard', cardId: 'a', mode: 'suffix', instanceId: 'i1', vars: {} })
    const next = appReducer(data, { type: 'toggleItem', slot: 'suffix', instanceId: 'i1' })
    expect(next.compose.slots.suffix[0].enabled).toBe(false)
    const back = appReducer(next, { type: 'toggleItem', slot: 'suffix', instanceId: 'i1' })
    expect(back.compose.slots.suffix[0].enabled).toBe(true)
  })

  it('moveItem 上移/下移交换顺序', () => {
    let data = withData()
    data = appReducer(data, { type: 'insertCard', cardId: 'a', mode: 'prefix', instanceId: 'i1', vars: {} })
    data = appReducer(data, { type: 'insertCard', cardId: 'b', mode: 'prefix', instanceId: 'i2', vars: {} })
    const up = appReducer(data, { type: 'moveItem', slot: 'prefix', instanceId: 'i2', direction: -1 })
    expect(up.compose.slots.prefix.map((i) => i.instanceId)).toEqual(['i2', 'i1'])
    const down = appReducer(up, { type: 'moveItem', slot: 'prefix', instanceId: 'i2', direction: 1 })
    expect(down.compose.slots.prefix.map((i) => i.instanceId)).toEqual(['i1', 'i2'])
  })

  it('已在顶端再上移、已在末端再下移都保持不变', () => {
    let data = withData()
    data = appReducer(data, { type: 'insertCard', cardId: 'a', mode: 'prefix', instanceId: 'i1', vars: {} })
    expect(appReducer(data, { type: 'moveItem', slot: 'prefix', instanceId: 'i1', direction: -1 })).toBe(data)
    expect(appReducer(data, { type: 'moveItem', slot: 'prefix', instanceId: 'i1', direction: 1 })).toBe(data)
  })

  it('setVar 只更新指定实例的指定变量', () => {
    let data = withData()
    data = appReducer(data, { type: 'insertCard', cardId: 'a', mode: 'block', instanceId: 'i1', vars: { 语言: 'Java', 篇幅: '' } })
    data = appReducer(data, { type: 'insertCard', cardId: 'a', mode: 'block', instanceId: 'i2', vars: { 语言: 'Java' } })
    const next = appReducer(data, { type: 'setVar', slot: 'block', instanceId: 'i1', name: '语言', value: 'Python' })
    expect(next.compose.slots.block[0].vars['语言']).toBe('Python')
    expect(next.compose.slots.block[1].vars['语言']).toBe('Java')
  })

  it('setManualText 进入手动微调 / 传 null 回到同步', () => {
    const data = withData()
    const editing = appReducer(data, { type: 'setManualText', text: '手动编辑后的文本' })
    expect(editing.compose.manualText).toBe('手动编辑后的文本')
    const synced = appReducer(editing, { type: 'setManualText', text: null })
    expect(synced.compose.manualText).toBeNull()
  })

  it('是纯函数：不修改传入的 state，也不碰 userCards / recipes', () => {
    const data = withData()
    const snapshot = JSON.parse(JSON.stringify(data))
    const next = appReducer(data, { type: 'setBaseSentence', text: 'x' })
    expect(data).toEqual(snapshot)
    expect(next.userCards).toBe(data.userCards)
    expect(next.recipes).toBe(data.recipes)
  })
})
```

- [x] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/__tests__/reducer.test.ts`
Expected: FAIL —— `Failed to resolve import "../lib/reducer"`。

- [x] **Step 3: 实现 `src/lib/reducer.ts`**

```ts
import type { ComposeState, Mode, PersistedData, SlotItem } from '../types'

export type AppAction =
  | { type: 'setBaseSentence'; text: string }
  | { type: 'insertCard'; cardId: string; mode: Mode; instanceId: string; vars: Record<string, string> }
  | { type: 'removeItem'; slot: Mode; instanceId: string }
  | { type: 'toggleItem'; slot: Mode; instanceId: string }
  | { type: 'moveItem'; slot: Mode; instanceId: string; direction: -1 | 1 }
  | { type: 'setVar'; slot: Mode; instanceId: string; name: string; value: string }
  | { type: 'setManualText'; text: string | null }

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

    default:
      return state
  }
}
```

- [x] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/__tests__/reducer.test.ts`
Expected: PASS —— 9 个用例全绿。

- [x] **Step 5: 提交**

```powershell
git add -A
git commit -m "feat: 应用状态 reducer（插入/移除/启停/排序/变量/手动微调）"
```

---

## Task 4: 存储读写测试补齐（TDD，实现已在 Task 2 落地）

**Files:**
- Test: `src/__tests__/storage.test.ts`
- 验证: `src/lib/storage.ts`（Task 2 已写，本任务不改实现，除非测试暴露缺陷）

- [x] **Step 1: 写测试 `src/__tests__/storage.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { SCHEMA_VERSION, STORAGE_KEY, defaultCompose, defaultData, loadData, saveData, type StorageLike } from '../lib/storage'

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  const storage: StorageLike & { map: Map<string, string> } = {
    map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
  }
  return storage
}

describe('defaultCompose / defaultData', () => {
  it('默认拼装状态为空且三槽都是空数组', () => {
    expect(defaultCompose()).toEqual({ baseSentence: '', slots: { prefix: [], suffix: [], block: [] }, manualText: null })
  })
  it('默认数据带当前 schemaVersion', () => {
    expect(defaultData().schemaVersion).toBe(SCHEMA_VERSION)
  })
})

describe('loadData / saveData', () => {
  it('空存储返回默认值', () => {
    expect(loadData(fakeStorage())).toEqual(defaultData())
  })

  it('saveData 后 loadData 能往返（含拼装状态）', () => {
    const storage = fakeStorage()
    const data = defaultData()
    data.compose.baseSentence = '帮我审计这段代码'
    data.compose.slots.prefix = [{ instanceId: 'i1', cardId: 'builtin:general-01', vars: {}, enabled: true }]
    saveData(data, storage)
    expect(loadData(storage)).toEqual(data)
  })

  it('存储内容不是合法 JSON 时回退默认值', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: '{不是 JSON' })
    expect(loadData(storage)).toEqual(defaultData())
  })

  it('schemaVersion 不匹配时回退默认值（迁移占位）', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify({ ...defaultData(), schemaVersion: 999 }) })
    expect(loadData(storage)).toEqual(defaultData())
  })

  it('compose 结构损坏时回退默认值', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify({ ...defaultData(), compose: { baseSentence: 1 } }) })
    expect(loadData(storage)).toEqual(defaultData())
  })

  it('storage 不可用（null）时读写都不抛错', () => {
    expect(loadData(null)).toEqual(defaultData())
    expect(() => saveData(defaultData(), null)).not.toThrow()
  })

  it('setItem 抛错（配额满）时静默降级', () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    expect(() => saveData(defaultData(), storage)).not.toThrow()
  })
})
```

- [x] **Step 2: 跑测试**

Run: `npx vitest run src/__tests__/storage.test.ts`
Expected: PASS —— 10 个用例全绿（若失败，按测试描述修正 `src/lib/storage.ts`，修正后重跑直到全绿）。

- [x] **Step 3: 全量测试 + 类型检查**

Run: `npm run test`
Expected: 4 个测试文件全绿（cardUtils / compose / reducer / storage）。

Run: `npx tsc --noEmit`
Expected: 无输出、退出码 0。

- [x] **Step 4: 提交**

```powershell
git add -A
git commit -m "test: 存储读写与降级路径测试补齐"
```

---

## Task 5: 卡库骨架 + 校验测试（先红）

**Files:**
- Create: `src/data/presetCards.ts`
- Create: `src/data/preset/secAudit.ts`、`pentest.ts`、`coding.ts`、`output.ts`、`general.ts`（本任务先建空数组骨架）
- Test: `src/__tests__/presetCards.test.ts`

- [x] **Step 1: 写 `src/data/presetCards.ts`（汇总入口）**

```ts
import type { Card } from '../types'
import { SEC_AUDIT_CARDS } from './preset/secAudit'
import { PENTEST_CARDS } from './preset/pentest'
import { CODING_CARDS } from './preset/coding'
import { OUTPUT_CARDS } from './preset/output'
import { GENERAL_CARDS } from './preset/general'

/** 预置卡库（只读，随代码走）。用户自定义卡在 localStorage，不在此处。 */
export const PRESET_CARDS: Card[] = [
  ...SEC_AUDIT_CARDS,
  ...PENTEST_CARDS,
  ...CODING_CARDS,
  ...OUTPUT_CARDS,
  ...GENERAL_CARDS,
]
```

- [x] **Step 2: 写 5 个分类文件骨架（先空数组 + 文件头规范注释）**

以 `src/data/preset/secAudit.ts` 为例（其余 4 个文件同构，注释里的分类名/数量/前缀分别替换）：

```ts
import type { Card } from '../../types'

/**
 * 安全审计 · 30 张（唯一性由 src/__tests__/presetCards.test.ts 校验）
 *
 * 新增卡片规范：
 * - id：builtin:sec-audit-NN（两位序号，连续递增）
 * - title ≤ 24 字、不带句号；text ≤ 160 字、单行（多要点用「；」分隔）
 * - tags 2-4 个中文标签（可含 CWE/CVSS 等英文缩写）
 * - 正文中的 {变量} 必须登记进 vars（可给 default）
 * - 前缀卡：以「先…／用…／从…」等修饰从句写法，结尾不带标点
 * - 后缀卡：以「并…」开头；段落卡：以「输出要求：／约束：／步骤：」等开头
 * - 手法型：指明方向 + 可操作步骤，禁止只有术语没有动作的卡
 */
export const SEC_AUDIT_CARDS: Card[] = []
```

另外 4 个骨架：

- `pentest.ts` → `export const PENTEST_CARDS: Card[] = []`，注释「渗透测试 · 30 张」，id 前缀 `builtin:pentest-NN`
- `coding.ts` → `export const CODING_CARDS: Card[] = []`，注释「编程 · 25 张」，id 前缀 `builtin:coding-NN`
- `output.ts` → `export const OUTPUT_CARDS: Card[] = []`，注释「输出格式 · 20 张」，id 前缀 `builtin:output-NN`
- `general.ts` → `export const GENERAL_CARDS: Card[] = []`，注释「通用 · 20 张」，id 前缀 `builtin:general-NN`

- [x] **Step 3: 写 `src/__tests__/presetCards.test.ts`（完整校验）**

```ts
import { describe, expect, it } from 'vitest'
import { PRESET_CARDS } from '../data/presetCards'
import { extractVarNames } from '../lib/cardUtils'
import { CATEGORIES, type Category } from '../types'

const EXPECTED_COUNTS: Record<Category, number> = {
  'sec-audit': 30,
  pentest: 30,
  coding: 25,
  output: 20,
  general: 20,
}

const normalize = (s: string) => s.replace(/[\s，。；：！？、（）()【】[\]"'“”‘’.,;:!?—\-]/g, '')

describe('预置卡库', () => {
  for (const cat of CATEGORIES) {
    it(`【${cat.label}】数量为 ${EXPECTED_COUNTS[cat.id]}`, () => {
      expect(PRESET_CARDS.filter((c) => c.category === cat.id).length).toBe(EXPECTED_COUNTS[cat.id])
    })
  }

  it('总数 125 张', () => {
    expect(PRESET_CARDS.length).toBe(125)
  })

  it('id 唯一且格式规范', () => {
    const ids = PRESET_CARDS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^builtin:(sec-audit|pentest|coding|output|general)-\d{2}$/)
  })

  it('标题唯一', () => {
    const titles = PRESET_CARDS.map((c) => c.title.trim())
    expect(new Set(titles).size).toBe(titles.length)
  })

  it('文本唯一（忽略空白与标点后比较）', () => {
    const texts = PRESET_CARDS.map((c) => normalize(c.text))
    expect(new Set(texts).size).toBe(texts.length)
  })

  it('字段完整：标题 ≤24 字、文本 ≤160 字、tags 2-4 个、mode 合法、builtin 为 true', () => {
    for (const c of PRESET_CARDS) {
      expect(c.title.trim().length).toBeGreaterThan(0)
      expect(c.title.length).toBeLessThanOrEqual(24)
      expect(c.text.trim().length).toBeGreaterThan(0)
      expect(c.text.length).toBeLessThanOrEqual(160)
      expect(c.tags.length).toBeGreaterThanOrEqual(2)
      expect(c.tags.length).toBeLessThanOrEqual(4)
      expect(['prefix', 'suffix', 'block']).toContain(c.mode)
      expect(c.builtin).toBe(true)
    }
  })

  it('正文中的 {变量} 全部已在 vars 登记', () => {
    for (const c of PRESET_CARDS) {
      const declared = new Set(c.vars.map((v) => v.name))
      for (const name of extractVarNames(c.text)) expect(declared.has(name)).toBe(true)
    }
  })

  it('mode 分布：前缀 ≥20、后缀 ≥25、段落 ≥20', () => {
    const count = (m: string) => PRESET_CARDS.filter((c) => c.mode === m).length
    expect(count('prefix')).toBeGreaterThanOrEqual(20)
    expect(count('suffix')).toBeGreaterThanOrEqual(25)
    expect(count('block')).toBeGreaterThanOrEqual(20)
  })

  it('含变量卡片 ≥10 张', () => {
    expect(PRESET_CARDS.filter((c) => c.vars.length > 0).length).toBeGreaterThanOrEqual(10)
  })
})
```

- [x] **Step 4: 跑测试确认「红」**

Run: `npx vitest run src/__tests__/presetCards.test.ts`
Expected: FAIL —— 6 个数量断言全红（0 !== 期望值）、总数红；唯一性类断言会通过（空库不重复）。这是预期的起点。

- [x] **Step 5: 提交骨架**

```powershell
git add -A
git commit -m "test: 预置卡库校验（数量/唯一性/字段/变量登记）与 5 类骨架"
```

---

## Task 6: 安全审计卡 30 张

**Files:**
- Modify: `src/data/preset/secAudit.ts`

**写作规则（同 Step 2 骨架注释，重申要点）：** 手法型（指方向+可操作）；id `builtin:sec-audit-01..30` 连续；title ≤24 字无句号；text ≤160 字单行、多要点用「；」；tags 2-4 个；`{变量}` 必须登记 vars；前缀卡结尾不带标点、后缀卡以「并」开头、段落卡以「输出要求：/约束：/步骤：」开头。

**配额（本文件必须满足）：** prefix ≥ 6、suffix ≥ 8、block ≥ 6、含变量卡 ≥ 3。

**主题池（至少覆盖以下方向，各写一卡，共 30 张，不重复）：**
信任边界与攻击面入口梳理；污点分析 source→sink；控制流与状态机校验；认证与会话（token 生命周期/会话固定/重放）；授权与越权（IDOR/水平与垂直）；注入类（SQL/命令/模板/表达式/NoSQL）；反序列化；XXE；SSRF；文件上传与路径穿越；敏感信息与硬编码密钥；依赖与供应链（SCA/SBOM）；并发与竞态（TOCTOU）；资源与内存管理；加密误用（弱算法/ECB/随机数）；日志与信息泄露；错误处理与失败开放；业务逻辑绕过；配置与默认值安全；结论分级与修复优先级；修复建议与回归验证方法。

**必须包含的 4 张锚点卡（原样写入，序号占用 01-04）：**

```ts
{
  id: 'builtin:sec-audit-01',
  category: 'sec-audit',
  title: '先划定信任边界',
  text: '先划定信任边界与攻击面：标出所有外部输入入口（HTTP 参数、文件、环境变量、消息队列），再按入口逐个向下分析',
  mode: 'prefix',
  vars: [],
  tags: ['信任边界', '攻击面'],
  builtin: true,
},
{
  id: 'builtin:sec-audit-02',
  category: 'sec-audit',
  title: '给出污点传播路径',
  text: '并用数据流说明污点从 source 到 sink 的完整传播路径，标出每一处缺失过滤的环节',
  mode: 'suffix',
  vars: [],
  tags: ['污点分析', '数据流'],
  builtin: true,
},
{
  id: 'builtin:sec-audit-03',
  category: 'sec-audit',
  title: '审计报告结构',
  text: '输出结构：①风险摘要（按严重级排序）；②每个漏洞含 CWE 编号、位置（文件:行号）、触发条件、最小复现、修复建议、回归验证方法',
  mode: 'block',
  vars: [],
  tags: ['报告结构', 'CWE'],
  builtin: true,
},
{
  id: 'builtin:sec-audit-04',
  category: 'sec-audit',
  title: '语言特有危险模式',
  text: '重点审计 {语言} 代码中语言特有的危险模式（如反射、动态执行、序列化机制），逐类排查并说明可利用性',
  mode: 'block',
  vars: [{ name: '语言', default: 'Java' }],
  tags: ['语言适配', '危险模式'],
  builtin: true,
},
```

- [x] **Step 1: 把 30 张卡写入 `src/data/preset/secAudit.ts` 的数组中（01-04 用上面锚点，05-30 按主题池创作）**

- [x] **Step 2: 跑本类别测试**

Run: `npx vitest run src/__tests__/presetCards.test.ts -t "安全审计"`
Expected: PASS —— `【安全审计】数量为 30` 绿。

- [x] **Step 3: 类型检查**

Run: `npx tsc --noEmit`
Expected: 无输出、退出码 0。

- [x] **Step 4: 提交**

```powershell
git add -A
git commit -m "feat(cards): 安全审计 30 张（污点分析/越权/注入/供应链等）"
```

---

## Task 7: 渗透测试卡 30 张

**Files:**
- Modify: `src/data/preset/pentest.ts`

**写作规则：** 同 Task 6（id 前缀 `builtin:pentest-`）。

**配额：** prefix ≥ 6、suffix ≥ 8、block ≥ 6、含变量卡 ≥ 3。

**主题池：** 资产测绘与指纹；子域枚举与子域接管；目录/接口发现；JS 逆向提取接口；认证测试（弱口令/枚举/锁定）；JWT（alg 混淆/弱密钥）；OAuth/OIDC 回调与 state；2FA 绕过；IDOR/越权验证；SQL 注入（含盲注）；XSS（反射/存储/DOM）；SSRF 与云元数据；SSTI/表达式注入；命令注入与盲注验证；文件上传绕过（MIME/魔数/解析）；文件包含与路径穿越；反序列化利用验证；业务逻辑与竞争条件；WAF 绕过与载荷编码；验证的最小影响原则；内网信息收集；AD/Kerberos 常见缺陷；权限提升；横向移动与凭据复用；云与容器配置（AK/SK、k8s）；后渗透记录与清理纪律；报告与复现步骤；PoC 编写规范；授权与法律边界。

**必须包含的 4 张锚点卡（原样写入，序号占用 01-04）：**

```ts
{
  id: 'builtin:pentest-01',
  category: 'pentest',
  title: '先确认授权与范围',
  text: '先确认测试范围与授权边界（目标清单、时间窗口、禁止操作），全程只做验证、不做破坏性操作',
  mode: 'prefix',
  vars: [],
  tags: ['授权', '范围'],
  builtin: true,
},
{
  id: 'builtin:pentest-02',
  category: 'pentest',
  title: '给出可复现验证',
  text: '并为每条发现给出可复现的最小验证步骤，附请求/响应原文与关键截图说明',
  mode: 'suffix',
  vars: [],
  tags: ['复现', '证据'],
  builtin: true,
},
{
  id: 'builtin:pentest-03',
  category: 'pentest',
  title: 'JS 逆向找接口',
  text: '接口发现：从目标前端 JS 中提取 API 路径、方法、参数与鉴权头，整理成待测清单，并标注每个接口的越权与注入测试点',
  mode: 'block',
  vars: [],
  tags: ['JS逆向', '接口发现'],
  builtin: true,
},
{
  id: 'builtin:pentest-04',
  category: 'pentest',
  title: '控制请求速率',
  text: '控制请求速率不超过 {每秒请求数} 次/秒，遇到限流或封禁立即降速并记录',
  mode: 'prefix',
  vars: [{ name: '每秒请求数', default: '5' }],
  tags: ['速率限制', '稳定性'],
  builtin: true,
},
```

- [x] **Step 1: 写入 30 张卡（01-04 用锚点，05-30 按主题池创作）**

- [x] **Step 2: 跑本类别测试**

Run: `npx vitest run src/__tests__/presetCards.test.ts -t "渗透测试"`
Expected: PASS —— `【渗透测试】数量为 30` 绿。

- [x] **Step 3: 提交**

```powershell
git add -A
git commit -m "feat(cards): 渗透测试 30 张（信息收集/认证/注入验证/内网）"
```

---

## Task 8: 编程卡 25 张

**Files:**
- Modify: `src/data/preset/coding.ts`

**写作规则：** 同 Task 6（id 前缀 `builtin:coding-`）。

**配额：** prefix ≥ 5、suffix ≥ 7、block ≥ 5、含变量卡 ≥ 2。

**主题池：** 需求澄清与验收标准；接口设计与向后兼容；错误处理与失败模式；类型安全与边界；性能与复杂度分析；并发与线程安全；数据一致性；重构与最小改动；测试策略（单测/性质测试/边界）；调试方法（二分/最小复现）；依赖取舍与版本锁定；可维护性与命名；文档与注释；日志与可观测性；迁移与兼容；代码评审清单；提交粒度与信息规范；安全编码（输入校验/最小权限）。

**必须包含的 4 张锚点卡（原样写入，序号占用 01-04）：**

```ts
{
  id: 'builtin:coding-01',
  category: 'coding',
  title: '最小复现优先',
  text: '遇到问题先构造最小复现用例，再基于证据定位根因，不要凭猜测直接改代码',
  mode: 'prefix',
  vars: [],
  tags: ['最小复现', '定位根因'],
  builtin: true,
},
{
  id: 'builtin:coding-02',
  category: 'coding',
  title: '修复约束',
  text: '约束：最小改动；不改公共接口；遵循现有代码风格；给出可直接应用的 diff 而不是整段重写',
  mode: 'block',
  vars: [],
  tags: ['最小改动', 'diff'],
  builtin: true,
},
{
  id: 'builtin:coding-03',
  category: 'coding',
  title: '技术栈锚定',
  text: '技术栈：{语言} + {框架}；使用官方推荐写法与当前稳定版本 API，不要使用已废弃接口',
  mode: 'block',
  vars: [
    { name: '语言', default: 'TypeScript' },
    { name: '框架', default: 'React' },
  ],
  tags: ['技术栈', '版本'],
  builtin: true,
},
{
  id: 'builtin:coding-04',
  category: 'coding',
  title: '补边界测试',
  text: '并补充边界条件与异常路径的测试用例（空值、极值、并发、失败重试）',
  mode: 'suffix',
  vars: [],
  tags: ['边界测试', '异常路径'],
  builtin: true,
},
```

- [x] **Step 1: 写入 25 张卡（01-04 用锚点，05-25 按主题池创作）**

- [x] **Step 2: 跑本类别测试**

Run: `npx vitest run src/__tests__/presetCards.test.ts -t "编程"`
Expected: PASS —— `【编程】数量为 25` 绿。

- [x] **Step 3: 提交**

```powershell
git add -A
git commit -m "feat(cards): 编程 25 张（调试/重构/测试/评审）"
```

---

## Task 9: 输出格式卡 20 张

**Files:**
- Modify: `src/data/preset/output.ts`

**写作规则：** 同 Task 6（id 前缀 `builtin:output-`）。

**配额：** prefix ≥ 3、suffix ≥ 5、block ≥ 6、含变量卡 ≥ 2。

**主题池：** 中文输出；术语保留英文原名；结构化表格；编号步骤；结论先行；证据与行号；CVSS 评分输出；复现步骤格式；补丁 diff 输出；风险分级说明；一页速览 vs 详解；缩写对照表；不确定性与假设声明；输出前自检清单；代码块规范（语言标注/可运行）；引用与出处；禁止夸张措辞；篇幅控制；受众适配（开发/管理层）；后续建议清单。

**必须包含的 4 张锚点卡（原样写入，序号占用 01-04）：**

```ts
{
  id: 'builtin:output-01',
  category: 'output',
  title: '中文输出',
  text: '输出要求：中文；专业术语保留英文原名并在首次出现时附中文解释（如 sink、taint propagation、PoC）',
  mode: 'block',
  vars: [],
  tags: ['中文', '术语'],
  builtin: true,
},
{
  id: 'builtin:output-02',
  category: 'output',
  title: '表格化对照',
  text: '用表格输出对照信息（列：问题、位置、严重级、影响、修复建议），表格之后再给一段不超过三行的结论',
  mode: 'block',
  vars: [],
  tags: ['表格', '结构'],
  builtin: true,
},
{
  id: 'builtin:output-03',
  category: 'output',
  title: '控制篇幅',
  text: '整体控制在 {篇幅} 以内，先给结论再展开细节',
  mode: 'suffix',
  vars: [{ name: '篇幅', default: '500 字' }],
  tags: ['篇幅', '结论先行'],
  builtin: true,
},
{
  id: 'builtin:output-04',
  category: 'output',
  title: '证据与引用',
  text: '每个结论必须附证据：文件与行号、命令与输出、或链接；无法验证的内容明确标注为推断',
  mode: 'block',
  vars: [],
  tags: ['证据', '引用'],
  builtin: true,
},
```

- [x] **Step 1: 写入 20 张卡（01-04 用锚点，05-20 按主题池创作）**

- [x] **Step 2: 跑本类别测试**

Run: `npx vitest run src/__tests__/presetCards.test.ts -t "输出格式"`
Expected: PASS —— `【输出格式】数量为 20` 绿。

- [x] **Step 3: 提交**

```powershell
git add -A
git commit -m "feat(cards): 输出格式 20 张（表格/CVSS/篇幅/证据）"
```

---

## Task 10: 通用卡 20 张

**Files:**
- Modify: `src/data/preset/general.ts`

**写作规则：** 同 Task 6（id 前缀 `builtin:general-`）。

**配额：** prefix ≥ 4、suffix ≥ 4、block ≥ 5、含变量卡 ≥ 1。

**主题池：** 目标复述与对齐；澄清提问；逐步推理与关键假设；不确定性与置信度；范围收缩；方案对比与取舍；红队/反驳视角；输出前自检清单；术语一致；反幻觉（禁止编造引用/API/数据）；时间敏感信息处理；授权与合规；决策日志；先大纲后展开；迭代纪律；上下文与记忆管理；失败模式与回退方案；问题分解；优先级排序。

**必须包含的 4 张锚点卡（原样写入，序号占用 01-04）：**

```ts
{
  id: 'builtin:general-01',
  category: 'general',
  title: '先复述再作答',
  text: '先用你的话复述我的目标与约束，确认理解一致后再开始作答',
  mode: 'prefix',
  vars: [],
  tags: ['复述', '对齐'],
  builtin: true,
},
{
  id: 'builtin:general-02',
  category: 'general',
  title: '标注不确定性',
  text: '对不确定的结论明确标注置信度与依据，禁止编造引用、数据或不存在的 API',
  mode: 'suffix',
  vars: [],
  tags: ['不确定性', '反幻觉'],
  builtin: true,
},
{
  id: 'builtin:general-03',
  category: 'general',
  title: '信息不足先提问',
  text: '如果缺少关键信息，先提出不超过 3 个澄清问题，不要自行假设后长篇输出',
  mode: 'block',
  vars: [],
  tags: ['澄清', '提问'],
  builtin: true,
},
{
  id: 'builtin:general-04',
  category: 'general',
  title: '逐步推理',
  text: '先列出你的分析步骤与关键假设，再逐步推进到结论',
  mode: 'prefix',
  vars: [],
  tags: ['推理', '假设'],
  builtin: true,
},
```

- [x] **Step 1: 写入 20 张卡（01-04 用锚点，05-20 按主题池创作）**

- [x] **Step 2: 跑本类别测试**

Run: `npx vitest run src/__tests__/presetCards.test.ts -t "通用"`
Expected: PASS —— `【通用】数量为 20` 绿。

- [x] **Step 3: 提交**

```powershell
git add -A
git commit -m "feat(cards): 通用 20 张（对齐/澄清/自检/合规）"
```

---

## Task 11: 卡库全量校验（转绿）

- [x] **Step 1: 跑全量卡库测试**

Run: `npx vitest run src/__tests__/presetCards.test.ts`
Expected: PASS —— 13 个用例全绿（5 个分类数量 + 总数 + id/标题/文本唯一 + 字段完整 + 变量登记 + mode 分布 + 变量卡数量），共 125 张。

- [x] **Step 2: 若不绿，按失败断言修正卡片数据（只改数据，不改测试）**

常见修正：文本归一化重复（同一张卡的「；」前后调换顺序不算新卡）→ 改写成真正的不同指令；`{变量}` 未登记 → 补 `vars`；title 超 24 字 → 精简。

- [x] **Step 3: 全量测试 + 提交**

Run: `npm run test`
Expected: 5 个测试文件全绿。

```powershell
git add -A
git commit -m "test: 预置卡库 125 张全量校验通过"
```

---

## Task 12: 基础设施组件（id / 剪贴板 / Toast）

**Files:**
- Create: `src/lib/ids.ts`
- Create: `src/lib/clipboard.ts`
- Create: `src/components/Toast.tsx`

- [x] **Step 1: 写 `src/lib/ids.ts`**

```ts
/** 生成带前缀的唯一 id：优先 crypto.randomUUID，环境不支持时降级 */
export function newId(prefix: string): string {
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
  return `${prefix}:${uuid}`
}
```

- [x] **Step 2: 写 `src/lib/clipboard.ts`（file:// 与旧环境回退）**

```ts
/**
 * 复制文本：优先 navigator.clipboard，失败回退 textarea + execCommand。
 * 返回是否成功。空文本直接返回 false。
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* 落到下面的回退 */
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}
```

- [x] **Step 3: 写 `src/components/Toast.tsx`**

```tsx
interface Props {
  message: string | null
}

/** 底部轻提示；显示/隐藏时机由 App 控制 */
export function Toast({ message }: Props) {
  if (!message) return null
  return (
    <div className="toast" role="status">
      {message}
    </div>
  )
}
```

- [x] **Step 4: 类型检查**

Run: `npx tsc --noEmit`
Expected: 无输出、退出码 0。（本任务产出的组件在 Task 16 被 App 引用。）

- [x] **Step 5: 提交**

```powershell
git add -A
git commit -m "feat: id 生成、剪贴板复制（含 file:// 回退）、Toast 组件"
```

---

## Task 13: 卡库面板（CardLibrary + CardItem）

**Files:**
- Create: `src/components/CardItem.tsx`
- Create: `src/components/CardLibrary.tsx`

- [x] **Step 1: 写 `src/components/CardItem.tsx`**

```tsx
import { MODE_LABELS, type Card } from '../types'

interface Props {
  card: Card
  onInsert: (card: Card) => void
}

/** 单张卡片：点击插入；悬停显示全文与备注 */
export function CardItem({ card, onInsert }: Props) {
  return (
    <div className="card-item">
      <button type="button" className="card-btn" onClick={() => onInsert(card)} title="点击插入">
        <span className="card-title">{card.title}</span>
        <span className="card-badges">
          <span className={`badge mode-${card.mode}`}>{MODE_LABELS[card.mode]}</span>
          {card.vars.length > 0 && <span className="badge vars">变量</span>}
        </span>
      </button>
      <div className="card-tip" role="tooltip">
        <p className="tip-text">{card.text}</p>
        {card.note && <p className="tip-note">{card.note}</p>}
      </div>
    </div>
  )
}
```

- [x] **Step 2: 写 `src/components/CardLibrary.tsx`**

```tsx
import { useMemo, useState } from 'react'
import { CATEGORIES, type Card } from '../types'
import { CardItem } from './CardItem'

interface Props {
  cards: Card[]
  onInsert: (card: Card) => void
}

/** 左栏：搜索 + 分类分组 + 点击插入 */
export function CardLibrary({ cards, onInsert }: Props) {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cards
    return cards.filter((c) => [c.title, c.text, ...c.tags].some((s) => s.toLowerCase().includes(q)))
  }, [cards, query])

  const groups = useMemo(
    () => CATEGORIES.map((cat) => ({ ...cat, items: filtered.filter((c) => c.category === cat.id) })),
    [filtered],
  )

  const searching = query.trim().length > 0

  return (
    <aside className="pane card-library">
      <div className="pane-head">
        <h2>卡库</h2>
        <span className="muted">{searching ? `${filtered.length} / ${cards.length} 张` : `${cards.length} 张`}</span>
      </div>
      <input
        className="search"
        type="search"
        placeholder="搜索卡片（标题 / 内容 / 标签）"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="card-groups">
        {groups.map((g) => {
          const isCollapsed = searching ? false : Boolean(collapsed[g.id])
          return (
            <section key={g.id} className="card-group">
              <button
                type="button"
                className="group-head"
                onClick={() => setCollapsed((prev) => ({ ...prev, [g.id]: !prev[g.id] }))}
              >
                <span className="chev">{isCollapsed ? '▸' : '▾'}</span>
                {g.label}
                <span className="muted">{g.items.length}</span>
              </button>
              {!isCollapsed && (
                <div className="card-grid">
                  {g.items.map((card) => (
                    <CardItem key={card.id} card={card} onInsert={onInsert} />
                  ))}
                  {g.items.length === 0 && searching && <p className="muted empty">没有匹配的卡片</p>}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </aside>
  )
}
```

- [x] **Step 3: 类型检查 + 暂不接入 App**

Run: `npx tsc --noEmit`
Expected: 无输出、退出码 0。（本任务两个组件尚未被 App 引用，Task 16 统一接线。）

- [x] **Step 4: 提交**

```powershell
git add -A
git commit -m "feat: 卡库面板（搜索/分类折叠/悬停预览/点击插入）"
```

---

## Task 14: 拼装区（Composer + SlotSection + SlotItemRow）

**Files:**
- Create: `src/components/SlotItemRow.tsx`
- Create: `src/components/SlotSection.tsx`
- Create: `src/components/Composer.tsx`

- [x] **Step 1: 写 `src/components/SlotItemRow.tsx`**

```tsx
import type { Dispatch } from 'react'
import { hasUnresolvedVars } from '../lib/cardUtils'
import { renderCardText } from '../lib/compose'
import type { AppAction } from '../lib/reducer'
import type { Card, Mode, SlotItem } from '../types'

interface Props {
  item: SlotItem
  card: Card | undefined
  slot: Mode
  index: number
  count: number
  dispatch: Dispatch<AppAction>
  highlight: boolean
}

/** 拼装区里的一张已插入卡：启停/上移/下移/移除 + 变量内联输入 */
export function SlotItemRow({ item, card, slot, index, count, dispatch, highlight }: Props) {
  const rendered = card ? renderCardText(card, item.vars) : ''
  const hasVars = Boolean(card && card.vars.length > 0)

  return (
    <div className={`slot-item${item.enabled ? '' : ' disabled'}${highlight ? ' flash' : ''}`}>
      <div className="slot-main">
        <span className="slot-title" title={rendered}>
          {card ? card.title : '（卡片已删除）'}
        </span>
        <div className="slot-actions">
          <button
            type="button"
            title={item.enabled ? '停用' : '启用'}
            onClick={() => dispatch({ type: 'toggleItem', slot, instanceId: item.instanceId })}
          >
            {item.enabled ? '⏸' : '▶'}
          </button>
          <button
            type="button"
            title="上移"
            disabled={index === 0}
            onClick={() => dispatch({ type: 'moveItem', slot, instanceId: item.instanceId, direction: -1 })}
          >
            ↑
          </button>
          <button
            type="button"
            title="下移"
            disabled={index === count - 1}
            onClick={() => dispatch({ type: 'moveItem', slot, instanceId: item.instanceId, direction: 1 })}
          >
            ↓
          </button>
          <button
            type="button"
            title="移除"
            onClick={() => dispatch({ type: 'removeItem', slot, instanceId: item.instanceId })}
          >
            ×
          </button>
        </div>
      </div>
      {hasVars && card && (
        <div className="slot-vars">
          {card.vars.map((v) => (
            <label key={v.name} className="var-field">
              <span>{v.name}</span>
              <input
                type="text"
                value={item.vars[v.name] ?? ''}
                placeholder={v.default ?? v.name}
                onChange={(e) =>
                  dispatch({ type: 'setVar', slot, instanceId: item.instanceId, name: v.name, value: e.target.value })
                }
              />
            </label>
          ))}
        </div>
      )}
      {hasVars && hasUnresolvedVars(rendered) && <p className="slot-warn">有未填写的变量，预览中会原样显示占位符</p>}
    </div>
  )
}
```

- [x] **Step 2: 写 `src/components/SlotSection.tsx`**

```tsx
import type { Dispatch } from 'react'
import type { AppAction } from '../lib/reducer'
import type { Card, Mode, SlotItem } from '../types'
import { SlotItemRow } from './SlotItemRow'

interface Props {
  mode: Mode
  title: string
  items: SlotItem[]
  cardsById: Map<string, Card>
  dispatch: Dispatch<AppAction>
  highlightInstanceId: string | null
}

const EMPTY_HINT: Record<Mode, string> = {
  prefix: '插入「前缀」卡会出现在这里（句子前段）',
  suffix: '插入「后缀」卡会出现在这里（接在句尾）',
  block: '插入「段落」卡会出现在这里（附在最后）',
}

/** 单个槽位：标题 + 实例列表 */
export function SlotSection({ mode, title, items, cardsById, dispatch, highlightInstanceId }: Props) {
  return (
    <div className="slot">
      <div className="slot-head">
        <h3>{title}</h3>
        <span className="muted">{items.length > 0 ? `${items.length} 张` : EMPTY_HINT[mode]}</span>
      </div>
      {items.map((item, index) => (
        <SlotItemRow
          key={item.instanceId}
          item={item}
          card={cardsById.get(item.cardId)}
          slot={mode}
          index={index}
          count={items.length}
          dispatch={dispatch}
          highlight={item.instanceId === highlightInstanceId}
        />
      ))}
    </div>
  )
}
```

- [x] **Step 3: 写 `src/components/Composer.tsx`**

```tsx
import type { Dispatch } from 'react'
import type { AppAction } from '../lib/reducer'
import type { Card, ComposeState } from '../types'
import { SlotSection } from './SlotSection'

interface Props {
  compose: ComposeState
  cardsById: Map<string, Card>
  dispatch: Dispatch<AppAction>
  highlightInstanceId: string | null
}

/** 中栏：基础句 + 三个槽位 */
export function Composer({ compose, cardsById, dispatch, highlightInstanceId }: Props) {
  const isEmpty =
    compose.baseSentence.trim() === '' &&
    compose.slots.prefix.length === 0 &&
    compose.slots.suffix.length === 0 &&
    compose.slots.block.length === 0

  return (
    <section className="pane composer">
      <div className="pane-head">
        <h2>拼装区</h2>
        {isEmpty && <span className="muted">点左边任意卡片开始拼装</span>}
      </div>
      <label className="base-label" htmlFor="base-sentence">
        基础句
      </label>
      <textarea
        id="base-sentence"
        className="base-input"
        rows={3}
        placeholder="例：帮我审计这段代码"
        value={compose.baseSentence}
        onChange={(e) => dispatch({ type: 'setBaseSentence', text: e.target.value })}
      />
      <SlotSection mode="prefix" title="前缀区" items={compose.slots.prefix} cardsById={cardsById} dispatch={dispatch} highlightInstanceId={highlightInstanceId} />
      <SlotSection mode="suffix" title="后缀区" items={compose.slots.suffix} cardsById={cardsById} dispatch={dispatch} highlightInstanceId={highlightInstanceId} />
      <SlotSection mode="block" title="段落区" items={compose.slots.block} cardsById={cardsById} dispatch={dispatch} highlightInstanceId={highlightInstanceId} />
    </section>
  )
}
```

- [x] **Step 4: 类型检查**

Run: `npx tsc --noEmit`
Expected: 无输出、退出码 0。

- [x] **Step 5: 提交**

```powershell
git add -A
git commit -m "feat: 拼装区（基础句 + 三槽位 + 启停/排序/变量内联填写）"
```

---

## Task 15: 预览面板（PreviewPane）

**Files:**
- Create: `src/components/PreviewPane.tsx`

- [x] **Step 1: 写 `src/components/PreviewPane.tsx`**

```tsx
import type { ReactNode } from 'react'

interface Props {
  text: string
  manual: boolean
  unresolved: boolean
  onManualChange: (text: string | null) => void
  onCopy: () => void
}

/** 未填变量高亮：把 {xxx} 渲染成 <mark> */
function renderWithHighlights(text: string): ReactNode[] {
  return text.split(/(\{[^{}]+\})/g).map((part, i) =>
    /^\{[^{}]+\}$/.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>,
  )
}

/**
 * 右栏：实时预览 / 手动微调 / 复制。
 * - 自动模式：派生文本渲染（只读），未填变量高亮
 * - 手动模式：可编辑 textarea；「⟳ 与拼装同步」退出并回到自动模式
 */
export function PreviewPane({ text, manual, unresolved, onManualChange, onCopy }: Props) {
  const isEmpty = text.trim() === ''

  return (
    <section className="pane preview">
      <div className="pane-head">
        <h2>预览</h2>
        {unresolved && !manual && <span className="warn">有未填变量</span>}
        {manual && <span className="muted">手动微调中，不再自动同步</span>}
      </div>
      {manual ? (
        <textarea
          className="preview-edit"
          value={text}
          onChange={(e) => onManualChange(e.target.value)}
          placeholder="在这里微调最终文本"
        />
      ) : (
        <pre className="preview-text">
          {isEmpty ? <span className="muted">拼装结果会显示在这里：输入基础句，或点左侧卡片</span> : renderWithHighlights(text)}
        </pre>
      )}
      <div className="preview-actions">
        <button type="button" className="primary" onClick={onCopy} disabled={isEmpty}>
          复制
        </button>
        {manual ? (
          <button type="button" onClick={() => onManualChange(null)}>
            ⟳ 与拼装同步
          </button>
        ) : (
          <button type="button" onClick={() => onManualChange(text)} disabled={isEmpty}>
            手动微调
          </button>
        )}
      </div>
    </section>
  )
}
```

- [x] **Step 2: 类型检查**

Run: `npx tsc --noEmit`
Expected: 无输出、退出码 0。

- [x] **Step 3: 提交**

```powershell
git add -A
git commit -m "feat: 预览面板（未填变量高亮/手动微调/复制按钮）"
```

---

## Task 16: App 接线 + 样式（三栏布局）

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`（已就位，若与下方一致则跳过）
- Modify: `src/styles.css`（替换占位样式）

- [x] **Step 1: 写 `src/App.tsx`（完整版，替换占位）**

```tsx
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
```

- [x] **Step 2: 用完整样式替换 `src/styles.css`**

```css
:root {
  --bg: #f6f7f9;
  --pane: #ffffff;
  --border: #e3e6ea;
  --text: #1f2329;
  --muted: #8a919a;
  --primary: #2f6fed;
  --primary-weak: #e8f0fe;
  --warn: #b45309;
  --warn-bg: #fef3c7;
  --radius: 8px;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  height: 100%;
  margin: 0;
}

body {
  font-family: system-ui, -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.app-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--pane);
}

.app-header h1 {
  font-size: 16px;
  margin: 0;
}

.app-sub {
  color: var(--muted);
  font-size: 12px;
}

.app-body {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(340px, 1.15fr) minmax(300px, 1fr);
  flex: 1;
  min-height: 0;
}

.pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--pane);
  border-right: 1px solid var(--border);
  padding: 12px;
  overflow: hidden;
}

.preview {
  border-right: none;
}

.pane-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.pane-head h2 {
  font-size: 13px;
  margin: 0;
}

.muted {
  color: var(--muted);
  font-size: 12px;
}

.warn {
  color: var(--warn);
  background: var(--warn-bg);
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 12px;
}

/* 卡库 */
.search {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 8px;
  font-size: 13px;
}

.card-groups {
  overflow-y: auto;
  flex: 1;
  padding-right: 2px;
}

.card-group + .card-group {
  margin-top: 6px;
}

.group-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 6px 2px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: var(--text);
}

.group-head .chev {
  width: 14px;
  color: var(--muted);
}

.group-head .muted {
  margin-left: auto;
  font-weight: 400;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 2px 0 6px;
}

.card-item {
  position: relative;
}

.card-btn {
  width: 100%;
  text-align: left;
  border: 1px solid var(--border);
  background: #fff;
  border-radius: var(--radius);
  padding: 7px 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: var(--text);
}

.card-btn:hover {
  border-color: var(--primary);
  background: var(--primary-weak);
}

.card-title {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-badges {
  display: flex;
  gap: 4px;
}

.badge {
  font-size: 11px;
  border-radius: 4px;
  padding: 0 5px;
  line-height: 16px;
}

.mode-prefix {
  background: #eef2ff;
  color: #4356c7;
}

.mode-suffix {
  background: #ecfdf5;
  color: #047857;
}

.mode-block {
  background: #fdf2f8;
  color: #be185d;
}

.badge.vars {
  background: #fff7ed;
  color: #c2410c;
}

.card-tip {
  display: none;
  position: absolute;
  z-index: 20;
  left: 0;
  top: calc(100% + 4px);
  width: 280px;
  background: #1f2329;
  color: #fff;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.5;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.card-item:hover .card-tip {
  display: block;
}

.tip-text {
  margin: 0;
  white-space: pre-wrap;
}

.tip-note {
  margin: 6px 0 0;
  color: #cbd5e1;
}

/* 拼装区 */
.base-label {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 4px;
}

.base-input {
  width: 100%;
  resize: vertical;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 8px 10px;
  font: inherit;
  margin-bottom: 10px;
}

.composer {
  overflow-y: auto;
}

.slot + .slot {
  margin-top: 10px;
}

.slot-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.slot-head h3 {
  font-size: 12px;
  margin: 0;
  color: #4b5563;
}

.slot-item {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 6px 8px;
  background: #fff;
  margin-bottom: 6px;
}

.slot-item.disabled {
  opacity: 0.5;
}

.slot-item .slot-main {
  display: flex;
  align-items: center;
  gap: 6px;
}

.slot-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}

.slot-actions {
  display: flex;
  gap: 2px;
}

.slot-actions button {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--muted);
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 4px;
}

.slot-actions button:hover:not(:disabled) {
  background: var(--primary-weak);
  color: var(--primary);
}

.slot-actions button:disabled {
  opacity: 0.3;
  cursor: default;
}

.slot-vars {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.var-field {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--muted);
}

.var-field input {
  width: 90px;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 3px 6px;
  font: inherit;
  font-size: 12px;
}

.slot-warn {
  color: var(--warn);
  font-size: 12px;
  margin: 4px 0 0;
}

@keyframes flash {
  0% {
    background: #fff3bf;
  }
  100% {
    background: #fff;
  }
}

.slot-item.flash {
  animation: flash 1.1s ease-out;
}

/* 预览 */
.preview-text {
  flex: 1;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  background: #fbfcfd;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
  margin: 0;
  font: inherit;
  line-height: 1.7;
}

.preview-text mark {
  background: var(--warn-bg);
  color: var(--warn);
  border-radius: 3px;
  padding: 0 2px;
}

.preview-edit {
  flex: 1;
  width: 100%;
  resize: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
  font: inherit;
  line-height: 1.7;
}

.preview-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

button.primary {
  background: var(--primary);
  border: none;
  color: #fff;
  padding: 8px 18px;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 13px;
}

button.primary:disabled {
  opacity: 0.4;
  cursor: default;
}

.preview-actions button:not(.primary) {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text);
}

/* toast */
.toast {
  position: fixed;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2329;
  color: #fff;
  padding: 9px 18px;
  border-radius: 999px;
  font-size: 13px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 50;
}
```

- [x] **Step 3: 类型检查 + 全量测试**

Run: `npx tsc --noEmit`
Expected: 无输出、退出码 0。

Run: `npm run test`
Expected: 5 个测试文件全绿。

- [x] **Step 4: dev server 人工验收（浏览器）**

Run（后台，若未在运行）: `npm run dev`
用浏览器打开 `http://localhost:5173`，逐条检查：

1. 页面加载无报错，Console 无 error 级日志；三栏布局正常显示，卡库显示 125 张
2. 搜索「污点」→ 只剩相关卡；清空搜索恢复
3. 折叠/展开「渗透测试」分组正常
4. 在基础句输入「帮我审计这段代码」，依次点击 3 张卡（1 张前缀 + 1 张后缀 + 1 张段落）→ 拼装区对应槽出现实例且闪一下高亮 → 预览为通顺完整文本
5. 点击复制 → toast「已复制，可直接粘贴」；粘贴到任意输入框验证内容一致
6. 停用其中一张卡 → 预览实时变化；再启用 → 恢复；上移/下移改变顺序 → 预览顺序跟着变
7. 插入一张含变量卡（如「控制篇幅」）→ 实例内出现输入框；清空输入 → 预览中 `{篇幅}` 高亮，标题栏显示「有未填变量」
8. 点「手动微调」→ 变成可编辑；改一段字 → 再插入一张卡，预览不被覆盖；点「⟳ 与拼装同步」→ 回到自动模式
9. 刷新页面 → 基础句与所有实例（含变量值、顺序、启停状态）完整保留

- [x] **Step 5: 提交**

```powershell
git add -A
git commit -m "feat: 三栏主界面接线与完整样式（插入高亮/复制 toast/手动微调）"
```

---

## Task 17: README + 单文件产物验证 + 验收收尾

**Files:**
- Create: `README.md`

- [x] **Step 1: 写 `README.md`**

```markdown
# 提示词方块（Prompt Blocks）

本地、离线、全中文的提示词拼装工具：**基础句 + 点选修饰卡 → 槽位拼装 → 一键复制**。

## 启动

- 首次：`npm install`
- 日常开发：`npm run dev`，浏览器打开 http://localhost:5173
- 打包成单文件：`npm run build` → 产物 `dist/index.html` 可直接双击打开（离线可用）
- 跑测试：`npm run test`

## 数据存在哪

- 浏览器 `localStorage`，键名 `prompt-blocks:v1`（存拼装区状态；用户卡与配方为 Step 2）
- 换浏览器 / 清缓存会丢；Step 2 提供 JSON 导入导出做备份

## 怎么用（三步）

1. 在中间「拼装区」输入基础句（例：帮我审计这段代码）
2. 在左侧点卡片插入：前缀卡落到句子前段，后缀卡接句尾，段落卡附在最后；悬停卡片可看全文
3. 右下角「复制」，粘贴给任意 AI

拼装区里每张已插入的卡都可以：停用（⏸）/ 上移（↑）/ 下移（↓）/ 移除（×）；带变量卡可以就地填值。预览支持「手动微调」。

## 怎么加卡（改代码）

1. 打开 `src/data/preset/` 下的分类文件（如 `secAudit.ts`），按文件头注释的格式追加卡片对象
2. 规则速记：id 用 `builtin:<分类>-<两位序号>`；`title` ≤ 24 字；`text` ≤ 160 字单行；正文里的 `{变量}` 必须登记进 `vars`；`tags` 2-4 个
3. 运行 `npm run test`，唯一性 / 字段 / 变量登记会自动校验

## 目录结构

- `src/lib/`：纯函数核心（compose 拼装、reducer 状态、storage 存储、cardUtils 工具），全部有单测
- `src/data/preset/`：预置卡库（125 张，5 类）
- `src/components/`：三栏 UI（卡库 / 拼装区 / 预览）
- `docs/superpowers/`：设计文档与实现计划

## 注意事项

- 断网可用，运行时不发任何外部请求
- 前端零后端：所有数据只存在你的浏览器里
```

- [x] **Step 2: 构建单文件产物并验证**

Run: `npm run build`
Expected: 退出码 0；`dist/` 下生成 `index.html`（单文件，含内联 JS/CSS）。

用浏览器打开 `file:///D:/dream/dist/index.html`（或 `dist` 的绝对路径），检查：
- 页面正常渲染 125 张卡；点卡、拼装、复制均正常（复制走回退路径也应成功）
- Console 无 error

- [x] **Step 3: 最终验收脚本（对照验收标准 1/2/5）**

1. **打开即用，控制台无报错**：dev server 与单文件产物两个入口都验证
2. **连点 3 张卡 → 通顺完整提示词 → 复制成功**：用锚点卡组合演示——
   基础句「帮我审计这段代码」+ 前缀「先划定信任边界」+ 后缀「给出污点传播路径」+ 段落「审计报告结构」→
   预期：`先划定信任边界与攻击面：标出所有外部输入入口（HTTP 参数、文件、环境变量、消息队列），再按入口逐个向下分析，帮我审计这段代码，并用数据流说明污点从 source 到 sink 的完整传播路径，标出每一处缺失过滤的环节` + 空行 + 段落卡文本
3. **刷新数据还在**：拼装区状态（Step 2 验收项在 Step 2 完成）
4. **首次上手无需说明书**：请一位没看过本 README 的人直接操作，观察是否能在 1 分钟内完成「输入基础句 → 点 3 张卡 → 复制」

- [x] **Step 4: 收尾提交**

```powershell
git add -A
git commit -m "docs: README（启动/数据位置/加卡指南）与单文件产物验证"
git log --oneline
```

Expected: 提交历史完整覆盖以上任务。

---

## 覆盖对照（spec §9 Step 1 ↔ 任务）

| spec 要求 | 落点 |
|---|---|
| 脚手架（React+Vite+TS，singlefile） | Task 0 |
| 数据模型（Card/Recipe/SlotItem/ComposeState） | Task 1 |
| 拼接标点规则（§5） | Task 2 + Task 2 测试逐条断言 |
| 拼装操作（插入/移除/启停/排序/变量/手动微调） | Task 3 |
| localStorage 持久化 + 损坏降级 | Task 2（实现）、Task 4（测试） |
| 预置卡库 125 张（§7：唯一性/分布/变量） | Task 5-11 |
| 卡库面板（分组/搜索/点击/悬停） | Task 13 |
| 拼装区（基础句 + 三槽 + 实例操作 + 变量） | Task 14 |
| 预览（高亮未填/手动微调/复制） | Task 12、15 |
| 首次上手引导（空状态/高亮/toast） | Task 14、15、16 |
| README（启动/数据/加卡） | Task 17 |
| 验收 1/2/5 演示 | Task 16 Step 4、Task 17 Step 2-3 |

## 自检记录

- 占位符扫描：无 TBD/TODO；所有代码步骤均含完整实现。
- 唯一例外：Task 6-10 的 125 张卡文案以「主题池 + 配额 + 锚点样例 + 机器校验」方式落地，不在计划里逐字展开（内容创作单独执行，规格与验收在计划中固定）。
- 类型一致性：`AppAction` 判别字段、`SlotItem.vars`、`ComposeState.manualText`、`PRESET_CARDS` 导出名在任务间一致；`defaultCompose` 由 Task 2 落到 storage.ts，Task 3 的测试直接复用。

