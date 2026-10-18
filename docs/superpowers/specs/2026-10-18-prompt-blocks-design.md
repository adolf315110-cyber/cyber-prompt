# 提示词方块（Prompt Blocks）— 设计文档

- 日期：2026-10-18
- 状态：待用户确认（确认后进入实现计划）
- 项目根目录：`D:\dream`（仅在此目录内新建文件，不动其它目录）

---

## 0. 已确认的决定（来自用户）

| 决定项 | 结论 |
|---|---|
| 技术栈 | **A：React + Vite + TypeScript** |
| 拼装模型 | **槽位模型**（前缀区 / 基础句 / 后缀区 / 段落区） |
| 预置卡库 | **越多越好，且不能重复**（质量优先，不灌水） |
| 插入模式 | **正交化**：mode ∈ {前缀, 后缀, 段落}；占位符变量为所有模式通用的能力 |
| 项目目录 | `D:\dream`（直接使用，当前为空目录） |

## 1. 一句话

本地、全中文、完全离线的单页工具：**一句基础任务句 + 点选若干修饰卡 → 槽位实时拼装 → 一键复制**，喂给任意 AI。
差异化在「点卡插入」这个交互本身，不在卡内容管理。

## 2. 目标与非目标

**目标（MVP）**

1. 卡库面板：按 5 类分组（安全审计 / 渗透测试 / 编程 / 输出格式 / 通用），卡片可搜索、可点击
2. 点卡插入：三种插入模式（前缀 / 后缀 / 段落），占位符变量通用
3. 拼装区：实时预览；实例可停用/移除/上下移；变量内联填写；最终文本可手动微调
4. 一键复制
5. 自定义卡：新建 / 编辑 / 删除，刷新不丢
6. 配方：一套卡组合保存与一键还原
7. 卡库与配方 JSON 导入导出

**非目标（明确不做）**

- 账号、云同步、多人协作、AI 自动生成卡片
- 运行时任何后端请求；任何 CDN 资源
- MCP server 本体（只做数据格式铺垫，见 §12）
- 移动端适配（本地桌面工具，YAGNI）

## 3. 技术选型与运行方式

| 项 | 决定 |
|---|---|
| 框架 | React + TypeScript（用户选定） |
| 构建 | Vite（`react-ts` 模板，安装时取最新稳定版，`package-lock` 锁定） |
| 单文件产物 | `vite-plugin-singlefile`：`npm run build` 产出 `dist/index.html` 单文件，**双击（file://）可用**，补齐"便携 / 打开即用" |
| 日常运行 | `npm install` → `npm run dev` → 浏览器打开 `http://localhost:5173`（仅本机） |
| 外部依赖 | 运行时**零网络请求**；零 CDN；无外部字体（系统字体栈） |
| 剪贴板 | `navigator.clipboard` 优先；file:// 或权限失败时回退 `textarea + execCommand` |

环境已确认：Node v22.23.1、npm 10.9.8、git 2.53。

选 A 的代价与对策：

- 代价：需要构建链；Vite 默认产物是 module script，file:// 下会被拦，不能双击打开。
- 对策：加 `vite-plugin-singlefile`（一个 devDependency），`build` 产物为单 HTML 双击即用。日常开发与验收走 dev server。

## 4. 数据模型（schemaVersion 1）

```ts
type Category = 'sec-audit' | 'pentest' | 'coding' | 'output' | 'general'
type Mode     = 'prefix' | 'suffix' | 'block'   // 前缀 / 后缀 / 段落

interface CardVar { name: string; default?: string }

interface Card {
  id: string          // 内置卡 'builtin:xxx'；自定义卡 'user:xxx'
  category: Category
  title: string       // 卡片标题（一句话）
  text: string        // 插入文本，可多行，可含 {变量}
  mode: Mode
  vars: CardVar[]
  tags: string[]      // 搜索用，如 ['OWASP','污点分析']
  note?: string       // 备注（怎么用 / 示例）
  builtin: boolean
}

interface Recipe {
  id: string
  name: string
  baseSentence: string
  items: { cardId: string; vars: Record<string, string>; enabled: boolean }[]
}

interface SlotItem {
  instanceId: string          // 每次点击插入生成独立实例，同一张卡可重复插入
  cardId: string
  vars: Record<string, string>
  enabled: boolean
}

interface ComposeState {
  baseSentence: string
  slots: { prefix: SlotItem[]; suffix: SlotItem[]; block: SlotItem[] }  // 槽内顺序 = 用户排序
  manualText: string | null   // 手动微调后的文本；null = 与拼装实时同步
}
```

**存储**

- localStorage 单一键：`prompt-blocks:v1`，值：`{ schemaVersion, userCards, recipes, compose }`
- 导出文件：`{ schemaVersion, app: 'prompt-blocks', exportedAt, cards: 用户卡, recipes, compose }`（含拼装区状态，作为完整备份；导入时一并还原）
- 内置卡不导出（随代码走，`src/data/presetCards.ts`）；导入只影响用户卡与配方：**按 id 合并**，重复跳过并计数提示
- 「清空」= 清空用户卡 + 配方 + 拼装区（内置卡与功能不受影响）

## 5. 拼装模型（槽位）

```
[前缀区] ＋ 基础句 ＋ [后缀区]
[段落区]
```

- 点卡 → 按 `card.mode` 落入对应槽末尾；同一张卡可重复插入，实例彼此独立
- 实例操作：启用/停用、移除、上移/下移
- 变量：`text` 中 `{名称}` → 实例内联输入框；未填时预览原样显示 `{名称}` 并高亮提示
- 拼接规则（`src/lib/compose.ts` 纯函数，全部可单测）：
  1. 前缀、后缀槽内各段用「，」连接；段本身由卡片文本自带/不带标点，写作时统一规范（见 §7）
  2. 前缀 + 基础句：基础句非空时以「，」连接；基础句为空时，前缀与后缀之间同样以「，」连接
  3. 基础句 + 后缀：若基础句结尾已是终结标点（`。！？.!?`）则直接连接，否则加「，」
  4. 段落区：每个段落实例独立成段，附在最后；与前文之间以空行分隔（`\n\n`），段与段之间同样空行分隔
  5. 全部停用/为空 → 输出空字符串，预览区显示引导文案
- 不做"智能润色"：规则简单可预期，预览区可手动微调兜底

## 6. 界面与交互（三栏，桌面优先，全中文）

```
┌───────────────┬───────────────────────────┬───────────────────┐
│ 卡库            │ 拼装区                     │ 预览                │
│ [搜索框]        │ 基础句 [_________________] │ [实时全文]          │
│ ▾ 安全审计 (30) │                           │                    │
│  ┌卡┐ ┌卡┐      │ 前缀区                     │  [复制] [手动微调]  │
│  └──┘ └──┘      │  • 以 OWASP 视角 [⏸][×]    │                    │
│ ▸ 渗透测试 (30) │ 后缀区                     │                    │
│ ▸ 编程 (25)     │  • 并给出可运行 PoC [⏸][×] │                    │
│ ▸ 输出格式 (20) │ 段落区                     │                    │
│ ▸ 通用 (20)     │  • 输出要求：中文… [⏸][×]  │                    │
└───────────────┴───────────────────────────┴───────────────────┘
```

- **首次上手即会用（对应验收 5）**：
  - 空状态文案直接指引："点左边任意卡片开始拼装"
  - 点卡插入后，拼装区对应实例高亮闪一下 + toast「已插入：卡片标题」
  - 卡片悬停显示全文预览 + 模式徽标（前缀 / 后缀 / 段落 / 含变量）
  - 复制按钮常驻可见，成功后 toast「已复制，可直接粘贴」
- **预览区**：默认实时派生；点「手动微调」变为可编辑，此后拼装变更不再覆盖，出现「⟳ 与拼装同步」按钮；复制永远复制预览区当前内容
- 单主题（浅色），深色模式不做

## 7. 预置卡库（内容计划）

- **规模：≥120 张，全部唯一**，首版目标约 125 张：安全审计 30 / 渗透测试 30 / 编程 25 / 输出格式 20 / 通用 20
- **写作规范（决定工具的价值）**：
  - 手法型：指明方向 + 可操作步骤。例：「从入口点开始逐函数追踪污点传播，标出每个 sink 缺失的过滤环节」，拒绝「以 OWASP 视角」这类空泛术语卡
  - 带专业术语与具体方法论；必要时锚定标准（OWASP Top 10 2021、CWE、CVSS 3.1、PTES、ATT&CK 等）
  - 三种 mode 措辞约定：**前缀** = 视角/风格/约束修饰；**后缀** = 对输出的追加要求（以「并……」为主）；**段落** = 结构性块（以「输出要求：」「约束：」开头）
  - 卡片文本**单行书写**（多要点用「；」分隔）；换行只用于段落分隔，由拼装规则生成
  - 变量卡示例：「目标语言：{语言}」「技术栈：{框架} {版本}」「速率限制：{每秒请求数}」
  - 每卡带 `tags`，搜索同时匹配 标题 / 文本 / 标签
- **唯一性保障**：`src/__tests__/presetCards.test.ts` 自动校验 id / 标题 / 文本 三层不重复 + 字段完整性；不通过则测试红
- **用户自行加卡**：编辑 `src/data/presetCards.ts`，文件头有格式注释

## 8. Step 2 功能细节

- **自定义卡**：列表 + 表单（标题、分类、文本、模式、tags；`{x}` 自动提取为变量或手填默认值）；内置卡只读，可「复制为自定义」再改
- **配方**：把当前「基础句 + 实例列表 + 变量值」存为配方；顶部配方条一键还原 / 重命名 / 删除；还原会覆盖当前拼装区，执行前弹确认
- **导入导出**：导出下载 `.json`；导入用 `<input type=file>` + FileReader（file:// 可用），合并策略见 §4；「清空本地数据」带二次确认
- 不预置示例配方，避免污染用户数据

## 9. 两步交付与验收映射

| 步骤 | 内容 | 覆盖验收 |
|---|---|---|
| **Step 1** | 脚手架 + 预置卡库 + 卡库面板（分组/搜索/点击）+ 槽位拼装 + 实时预览 + 复制 + 拼装状态持久化（数据层就位） | 1、2、5 全达成；3 部分达成 |
| **Step 2** | 自定义卡 CRUD + 配方 + 导入导出（含清空）+ README 完整版 | 3、4 全达成 |

每步交付时提供：**怎么运行、怎么验收、做了哪些取舍**。

## 10. 项目结构

```
D:\dream
├─ index.html
├─ package.json / package-lock.json
├─ vite.config.ts            # 含 singlefile 插件与 base:'./'
├─ tsconfig*.json
├─ README.md                 # Step1 简版 → Step2 完整版
├─ docs/superpowers/specs/2026-10-18-prompt-blocks-design.md
└─ src/
   ├─ main.tsx / App.tsx / styles.css
   ├─ types.ts                       # Card / Recipe / ComposeState 等
   ├─ data/presetCards.ts            # 汇总导出 PRESET_CARDS
   ├─ data/preset/                   # 预置卡库分 5 个分类文件（每类一个，便于手改）
   │   └─ secAudit.ts / pentest.ts / coding.ts / output.ts / general.ts
   ├─ lib/compose.ts                 # 槽位拼接纯函数
   ├─ lib/reducer.ts                 # 应用状态 reducer（纯）
   ├─ lib/storage.ts                 # localStorage / 导入导出 / schema 版本
   ├─ components/
   │   ├─ CardLibrary.tsx / CardItem.tsx
   │   ├─ Composer.tsx / SlotSection.tsx / SlotItem.tsx
   │   ├─ PreviewPane.tsx / Toast.tsx
   │   └─（Step 2）+ CardEditor.tsx / RecipeBar.tsx / SettingsDialog.tsx
   └─ __tests__/ compose.test.ts / reducer.test.ts / presetCards.test.ts
```

## 11. 测试策略

- **Vitest 单测纯函数**（devDependency）：
  - `compose`：拼接顺序、标点规则、空基础句、全停用、变量替换与未填变量
  - `reducer`：插入/移除/启停/排序/变量更新
  - `storage`：序列化、导入合并去重、版本迁移占位
  - `presetCards`：唯一性与字段完整性
- **UI 走人工验收脚本**：5 条验收 + 边界（空基础句、全停用、变量未填、连点同一张卡）
- 不引入 E2E（MVP 不值）

## 12. MCP 路线（未来铺垫，本期不实现）

- 真源 = 导出 JSON（`schemaVersion` 稳定，格式只增版不破坏）
- 未来做一个本地小 MCP server（Node），读取同一 JSON，向任意 agent 暴露 `list_cards / compose / save_recipe` 等 tools
- 为此本期就把数据层与 UI 解耦（`src/lib` 全纯函数、类型独立于组件）

## 13. 风险与取舍

| 风险 | 取舍 |
|---|---|
| React 构建链 vs「双击即用」冲突 | `vite-plugin-singlefile` 兜底便携产物；日常 dev server（用户已选 A） |
| 卡片数量 vs 质量 | 「越多越好」以唯一性测试 + 写作规范守住；宁可精确 125 张，不灌水 |
| 标点规则对个别句子不理想 | 预览可手动微调兜底；规则集中在 `compose.ts` 一个函数，随时可改 |
| `{x}` 与正文花括号冲突 | 只替换已登记变量名；卡片写作时避免其它花括号用法 |
| localStorage 数据丢失 | 导入导出即备份通道；Step 2 提供清空前的导出提示 |
