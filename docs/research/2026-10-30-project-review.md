# 项目复审报告（2026-10-30）

> **范围**：`D:\dream\src`（lib 纯逻辑 9 模块 / components 13 组件 / App / main / types / 卡库与英译层）+ 10 个测试文件 + `styles.css` 关键选择器。
> **方法**：① 主控通读全部应用代码，对每条怀疑写探针实测；② 另起一轮**独立盲审**（verifier 未参与产出，真实无头 Chrome + CDP 实测）；③ 主控对盲审的每条结论**独立复现**后才采纳；④ 修完后再起一轮**独立复核**（verifier 未参与修复，pre-fix / post-fix A/B 实测）。
> **判定口径**：只报**亲自复现过**的问题；不报"可以更优雅"这类建议；不报未经核实的记忆型断言。
> **测试基线**：复审时 175 用例 / 11 文件全绿；修复后 183 用例全绿；`tsc --noEmit` exit 0；`vite build` 通过（dist/index.html 377 kB）。
>
> **本报告可独立阅读**：每条发现都附位置、复现步骤、实测输出与修法，不依赖任何本地工作笔记。

---

## 0. 结论摘要

| 级别 | 条数 | 状态 | 说明 |
|---|---|---|---|
| **阻断** | **3** | ✅ **已修并复验** | 英文界面输出中文、英文界面「复制为自定义」批量不可用、「清空本地数据」确认框点不到 |
| **应修** | **5** | ⬜ 未修 | 导入静默丢默认值 / Esc 丢未保存编辑 / 导入无体积上限 / 存储失败只提示一次 / **一张安全卡的 PHP 语义断言是错的** |
| 建议 | 16 | ⬜ 未修 | 措辞、可用性、无障碍、死代码、测试架构 |
| 复核后判定无问题 | 10 | — | 写下来是为了让你知道覆盖到哪了 |

**结论（复审当时）**：3 条阻断没有一条会崩溃，但有两条会让产品**产出错误结果**（英文界面拼出中文 prompt、英文界面复制卡片必失败），一条会让一个功能**彻底不可用**（清空本地数据点不到"确定"）。

**结论（现在）**：这 3 条阻断**已修并复验**（见 §0.1），阻断清零。**剩下的 5 条应修（§2）与 16 条建议（§3）仍然存在**，其中 #1（导入丢默认值）、#2（Esc 丢未保存编辑）、#4（存储失败只提示一次）属于"静默丢东西"，建议在下一个版本处理掉；#5（PHP 8 比较语义的错误断言）会让审计结论出错，卡库类问题改起来便宜、收益直接，**优先级其实高于其它 4 条应修**。**当前状态可以发布**，但要知道：英文界面与弹窗叠加这两条路径此前**没有任何测试覆盖**（§4），修完只是补了 3 条纯逻辑回归 + 5 条迁移用例，交互类缺陷仍需 DOM 环境才测得出来。

三条阻断的共同点：都只在**英文界面**或**弹窗叠加**时出现，中文单界面路径完全正常 ⇒ 这正是现有测试抓不到它们的原因（见 §4 测试架构缺口）。

**独立复核**：本轮共两轮独立复核，verifier 均未参与产出/修复。① 盲审找出 3 条阻断，我全部独立复现（数字吻合），其中 1 条数字我复核后**修正**（见 §5.1）；盲审另提的 4 条应修中，3 条确认成立、1 条我按更高标准重判（存储写失败，见 #4）。② 修复后的复核判定 **PASS_WITH_NOTES**，抓出我第一版修复漏掉的**存量数据未迁移**（已补）与 README 未同步（已补），并确认测试断言没有被削弱、其它弹窗流程未被破坏（见 §5.3）。

---

## 0.1 本轮修复状态：3 条阻断**已修**（2026-10-30）

按你的选择，本轮只修 3 条阻断级问题。改动清单（`git diff`）：

| 文件 | 改动 | 对应 |
|---|---|---|
| `src/lib/cardUtils.ts` | `defaultVarsFor` 不再写死默认值，一律写空串 | B1 |
| `src/lib/cardUtils.ts` | `USER_CARD_LIMITS` 标题 24→64、正文 160→480（tags 仍 4） | B2 |
| `src/lib/i18n.ts` | 四条超长报错文案同步为 64 / 480（中英） | B2 |
| `src/App.tsx` | `handleClearData` 开头 `setDataDialogOpen(false)` | B1 收尾 |
| `src/App.tsx` | `{confirm && ...}` 块移到 `{dataDialogOpen && ...}` 之后 | B3 |
| `src/lib/storage.ts` | `loadData` / `parseImportFile` 增加**存量数据迁移**：清掉旧版本焊死的默认值 | B1 收尾 |
| `README.md` | 用户卡限值说明改为 64/480，并说明"上限按中英两层里更长的那层取" | B2 |
| `src/__tests__/presetCardsEn.test.ts` | 新增 3 条回归用例（真实插入路径 / 实例值不固化 / 英译卡可复制） | B1 B2 |
| `src/__tests__/cardUtils.test.ts` | `defaultVarsFor` 断言由「写默认值」改为「写空串」 | B1 |
| `src/__tests__/storage.test.ts` | 超长标题阈值改用 `USER_CARD_LIMITS`；新增 5 条迁移用例 | B2 / B1 收尾 |
| `src/__tests__/userCards.test.ts` | 用例名去掉写死的「24 字」 | B2 |

**修复后真实浏览器复验**（headless Chrome + CDP，真实鼠标事件）：

| 检查 | 修复前 | 修复后 |
|---|---|---|
| B1 英文预览是否含中文 | 是（`500 字` / `短信验证码` / `中文` 等 6 处） | **否**（`enPreviewHasHan: false`，首句变成 `Keep the whole answer within 500 words`） |
| B2 英文界面 150 张复制为自定义 | 97 张失败、Save 置灰 | **0 失败、0 置灰** |
| B3「确定」按钮命中目标 | `DIV.data-actions`（点不到） | **`BUTTON.danger`（就是它）**；真实点击一次即清空（`userCards: []`，遮罩归零） |

**回归**：`vitest run` 183 用例全绿（原 175，新增 3 条 B1/B2 回归 + 5 条迁移用例）、`tsc --noEmit` exit 0、`vite build` 通过。

> **口径澄清（重要）**：本次放宽的是**用户自定义卡表单**的限值，**预置卡**的写作约束没有变——中文预置卡仍然是「标题 ≤24 字 / 正文 ≤160 字」，由 `src/__tests__/presetCards.test.ts` 用**写死的 24/160** 强制（不读 `USER_CARD_LIMITS`，所以这次放宽不会削弱它）。仓库文档里「英文层 ≤64/≤480」本来就是既有口径（`docs/research/2026-10-29-terminology-round3.md`：「150 张中文标题 ≤24、正文 ≤160；150 张英文标题 ≤64、正文 ≤480」），本次是把**用户卡限值**对齐到这个既有上限，而不是另发明一个数。

### B1 的收尾：存量数据迁移（第二轮复核才发现的残留）

第一版修复只覆盖**新插入**的卡。**修复前存下来的**实例值与旧配方里仍焊着当时那层语言的默认值——老用户不重新插卡，英文界面照样拼出中文。第二轮独立复核用真实浏览器复现了这一点（post-fix 包 + `localStorage` 里存 `{语言:'中文'}` → 英文预览仍是 `Output language is 中文`）。

**修法**（`src/lib/storage.ts`）：读取本地数据与导入文件时做一次迁移——实例值**恰好等于该卡某层（中文层/英文层）的默认值** ⇒ 视为"未填"，置空；用户自己填的其它值一律不动。

- 置空前后**中文界面渲染完全一致**（回落回同一个默认值）；
- 英文界面则恢复成英文默认值；
- 覆盖拼装区实例**与**配方条目两条路径（配方还原时同样会带出旧值）。

**实测（真实浏览器，存量数据）**：

| 检查 | 迁移前 | 迁移后 |
|---|---|---|
| 存量实例 `{语言:'中文'}` 的英文预览 | `Output language is 中文; …` | `Output language is English; …` |
| 存量实例 `{语言:'Rust'}`（用户手填） | `Rust` | `Rust`（不动） |
| 旧配方还原后的英文预览 | 含中文 | `Output language is English; …` |
| 迁移结果是否落盘 | — | 是（下次读取时 `vars` 已是 `{语言:''}`） |

新增 5 条迁移用例（`storage.test.ts`）：中文层默认值被清、英文层默认值被清、用户手填值不动、配方条目被清、非预置卡不动。

---

## 1. 阻断级（3 条，均已修）

### B1｜切换语言后，预置卡的**默认值被"焊死"在插入瞬间的语言上**

**位置**：`src/lib/cardUtils.ts:25-30`（`defaultVarsFor`）+ `src/lib/compose.ts:16`（默认值回落点）

```ts
// cardUtils.ts:28 —— 插入瞬间把"当前语言层"的默认值写进实例
for (const v of card.vars) vars[v.key ?? v.name] = v.default ?? ''
// compose.ts:16 —— 渲染时实例值优先，v.default 永远轮不到
const raw = readVar(vars, v.key ?? v.name) || v.default || ''
```

**触发路径**：中文界面插入一张带变量的卡 → 切到 English。实例里存的是中文默认值，英文界面渲染时实例值非空 ⇒ 英文默认值 `v.default` 永远不会生效。

**实测（真实浏览器，headless Chrome + CDP）**：中文界面点击全部 13 张带变量的卡 → 切 English → 预览区实测输出：

```
Keep the whole answer within 500 字; conclusion first, details after
...
enlock policy, 短信验证码 reuse/bypass/
paths, track 错误率 / 延迟 / 吞吐 met...
Audience: 开发工程师; adjust detai...
ask is in the 安全审计 domain: prefe...
t language is 中文; restrained a...
```

**值级比对（探针，13 张带变量的卡）**：泄漏 **6 张**，且**双向对称**（zh→en 6 张、en→zh 6 张）：

| 卡片 | 变量 | 插入语言下写入的实例值 | 当前语言层应有的默认值 |
|---|---|---|---|
| `builtin:pentest-12` | 验证码类型 / captchaType | 短信验证码 | SMS code |
| `builtin:coding-21` | 监控维度 / metric | 错误率 / 延迟 / 吞吐 | error rate / latency / throughput |
| `builtin:output-03` | 篇幅 / length | 500 字 | 500 words |
| `builtin:output-20` | 受众 / audience | 开发工程师 | developer |
| `builtin:general-10` | 领域 / domain | 安全审计 | security auditing |
| `builtin:general-20` | 语言 / language | 中文 | English |

其余 7 张带变量的卡默认值是**语言中性**的（Java / Spring / XML / example.com / TypeScript+React / Python+3.12），两层一致 ⇒ 不泄漏。

**对照（正常）**：用户**手填**的值跨语言稳定（浏览器实测 `Output language is Rust` 在中英两界面都保留）⇒ 问题只出在"默认值"这一条路径。

**建议改法**（已用探针验证有效）：插入时**不写默认值**，写空串，让渲染期按"当前语言层的卡"回落：

```ts
// src/lib/cardUtils.ts
export function defaultVarsFor(card: Card): Record<string, string> {
  const vars: Record<string, string> = Object.create(null) as Record<string, string>
  for (const v of card.vars) vars[v.key ?? v.name] = ''   // ← 不再写死 v.default
  return vars
}
```

探针实测（候选修法）：zh→en 泄漏 **0**、en→zh 泄漏 **0**；同一张卡在两种语言下分别渲染出 `输出语言为 中文` / `Output language is English`；手填值仍优先且切语言不丢；输入框 `placeholder={v.default ?? v.name}`（`SlotItemRow.tsx:73`）仍显示当前语言层的默认值，**UI 语义不变**。

> 这条修法与界面既有设计是一致的：变量输入框用 **placeholder** 显示默认值（灰色提示），实例值本应为空——现在的实现把默认值写进了实例，**输入框看着是空的、存储里却是有值的**，这正是切语言后"默认值锁死"的根因。

**✅ 已修（2026-10-30）**：按上面的改法落地（`defaultVarsFor` 写空串），浏览器复验 `enPreviewHasHan: false`，英文预览首句已是 `Keep the whole answer within 500 words`；新增 2 条回归用例（`presetCardsEn.test.ts`）锁住"中文插入→英文渲染无中文"与"实例值不得固化成插入那一刻语言层的默认值（双向）"。

> 注意：`defaultVarsFor` 原本的语义被一条既有测试断言着（`cardUtils.test.ts` 期望 `{ 语言: '中文' }`）——那条用例**断言的正是缺陷行为**，已随修复更新为期望空串，并在注释里写明原因。

---

### B2｜英文界面「复制为自定义」对 **97/150** 张预置卡不可用

**位置**：`src/App.tsx:146-152`（复制的是**已本地化**的卡）+ `src/lib/cardUtils.ts:56-60`（用户卡限值是中文口径）

```ts
// App.tsx:151 —— 复制英文界面所见（英译内容，长度上限 64/480）
vars: card.vars.map((v) => ({ name: v.name, default: v.default })),
// cardUtils.ts:56-60 —— 校验按中文口径
export const USER_CARD_LIMITS = { titleMax: 24, textMax: 160, tagsMax: 4 } as const
```

**触发路径**：English 界面 → 点任意预置卡右上角 ⧉ → 编辑器打开 → Save **置灰**，且弹两条错误。

**实测（真实浏览器，逐张点击 150 张 ⧉）**：

```
total: 150   fail: 97   saveDisabled: 97
errTally: { "Title cannot exceed 24 characters": 51, "Text cannot exceed 160 characters": 89 }
samples: { title: "Map trust boundaries first"     → counters ["26/24", "358/160"] }
         { title: "Renderer injection and privileged surface" → counters ["41/24", "425/160"] }
```

- 英文预置卡实测最长标题 **41 字符**、最长正文 **436 字符**；
- 中文预置卡在同一条校验下 **0/150 失败**（对照组，证明是口径问题不是内容问题）；
- 逻辑探针独立复算：`total=150, fail=97`，与浏览器一致。

**用户实际体验**：想改成自己的话就得把英文正文砍到 160 字符以内、标题砍到 24 字符以内——等于**英文界面下"复制为自定义"这个功能对 2/3 的卡是坏的**，且计数器显示 `358/160` 这种一眼看去像 bug 的数字。

**建议改法**（二选一，推荐前者）：
1. 把用户卡限值放宽到与英译层一致（标题 ≤64 / 正文 ≤480 / tags 2-4），中文卡自然也在其内；
2. 或按文种择限：标题限值取"文种 × 字符宽度"（中文 24 字 ≈ 英文 48 字符），正文同理。

> 注：放宽限值会同步影响 `CardEditor` 的计数器与 `validateCard` 的返回值，`cardUtils.ts` 的 `USER_CARD_LIMITS` 是唯一真源，改一处即可。

**✅ 已修（2026-10-30）**：`USER_CARD_LIMITS` 放宽为 `{ titleMax: 64, textMax: 480, tagsMax: 4 }`，`i18n.ts` 四条报错文案同步（中英）。浏览器复验：150 张逐张点 ⧉ → **0 失败、0 Save 置灰**；新增回归用例「英文预置卡复制为自定义后必须能通过校验」逐张断言 `validateCard(draft) === []`。

> **没动的东西**：预置卡的写作约束（中文标题 ≤24 字 / 正文 ≤160 字）原样保留，由 `presetCards.test.ts` 用**写死数字**强制，不受 `USER_CARD_LIMITS` 影响；导入校验（`storage.ts:281` 用 `validateCard`）与编辑器计数器都读同一个常量，因此自动一致。

---

### B3｜「清空本地数据」的确认框被数据管理弹窗**完全盖住**，按钮点不到

**位置**：`src/App.tsx:277-287`（`handleClearData` 没有关掉数据管理弹窗）+ `src/App.tsx:374-398`（两个弹窗的渲染顺序）+ `src/styles.css`（`.modal-mask` z-index）

```tsx
// App.tsx:277 —— 弹出确认框时，数据管理弹窗仍然开着
const handleClearData = () => { setConfirm({ ... }) }        // ← 缺 setDataDialogOpen(false)
// App.tsx:374 / 390 —— confirm 在前、dataDialog 在后；两个 .modal-mask 同为 z-index:100
{confirm && <ConfirmDialog ... />}
{dataDialogOpen && <DataDialog ... />}
```

同 `z-index` 时后渲染的盖在上面 ⇒ 数据管理弹窗压住确认框。

**实测（真实浏览器 + 真实鼠标事件）**：

```
maskCount: 2        maskZ: ["100","100"]
dialogLabels: ["清空本地数据", "数据管理"]        ← 数据管理在 DOM 后面 = 盖在上面
确定按钮坐标: (577, 549)
elementFromPoint(577,549) → DIV.data-actions   ← 不是「确定」按钮！
真实鼠标点击该坐标后：masks 仍为 2、两个弹窗都还在、数据没被清
```

**为什么"点了没反应"**：那个坐标落在数据管理弹窗的按钮容器 `.data-actions` 上，点击被它吃掉，既没触发"确定"，也没触发遮罩关闭。

**完整流程实测**（先往 localStorage 种一条数据，再走一遍）：

| 步骤 | 结果 |
|---|---|
| 种入数据 | `seedStillThere = true` |
| 点「清空本地数据」→ 确认框弹出 | 2 个遮罩，确认框被盖住 |
| 真实鼠标点「确定」坐标 | **无任何反应**，数据仍在 |
| 点遮罩空白处关掉数据管理弹窗 | 只剩确认框，**此时「确定」可点** |
| 再点「确定」 | `masks=0`，数据被清空（`userCards: []`） |

即：**用户必须先自己发现"要先把数据管理弹窗关掉"，才能完成清空**。对照实验：卡片编辑器 → 删除确认 的渲染顺序是反的（编辑器在前、确认在后），所以那条路径正常。

**建议改法**（两处都做才稳）：
```tsx
// App.tsx:277
const handleClearData = () => {
  setDataDialogOpen(false)     // ← 先关掉数据管理弹窗
  setConfirm({ ... })
}
```
并把 `App.tsx` 里的 `{confirm && ...}` 块**移到** `{dataDialogOpen && ...}` 之后（后渲染者在上层），使"确认框总是最上层"成为结构保证，而不是靠调用顺序的巧合。

> 更彻底的做法是给 `Modal` 加一个模块级**弹窗栈**：后开的弹窗 `z-index` 递增，且 Esc 只由栈顶响应。这样 B3 与下面的 #2（Esc 双响应）一次性根治。

**✅ 已修（2026-10-30）**：两处都改了——`handleClearData` 开头 `setDataDialogOpen(false)`；`{confirm && ...}` 块移到 `{dataDialogOpen && ...}` 之后（后渲染者在上层）。浏览器复验：确认框出现时**只剩 1 个遮罩**，「确定」的命中目标是 `BUTTON.danger`（就是它本身），真实鼠标点击一次即完成清空（`userCards: []`，遮罩归零）。

---

## 2. 应修（5 条）

### #1 导入时卡片的**变量默认值会静默丢失**

**位置**：`src/lib/storage.ts:276-279`

```ts
vars: varsFromText(
  toSingleLine(c.text),
  Object.fromEntries(c.vars.map((v) => [v.name, v.default ?? ''])),
),
```

**触发路径**：导入文件里某张卡的 `vars[].name` 与正文占位符名对不上（用户手改过 JSON，或变量名是中英两套，如正文 `{lang}`、vars 写 `{name:'语言'}`）。

**实际后果**：`varsFromText` 按**正文里出现的名字**查默认值，查不到 → 默认值被丢弃。导入照样"成功"、无任何提示，但拼出来的 prompt 里占位符原样残留（预览显示"有未填写的变量"），用户不知道为什么默认值不见了。

**证据**（探针 F23 / F26，均通过）：
```
输入：text='用 {lang} 分析', vars=[{name:'语言', default:'Java'}]
导入后 vars = [{"name":"lang"}]        ← default 没了
输入：text='用 {语言} 分析', vars=[{name:'lang', default:'Java'}]
导入后 vars = [{"name":"语言"}]        ← default 也没了
```

**建议改法**：取值时同时用两个名字匹配，匹配不上的条目**保留文件里声明的那个变量**，并计数（复用现有的 `invalid` 通道提示）。

---

### #2 两个弹窗叠加时，**一次 Esc 会把编辑器里没保存的修改一起丢掉**

**位置**：`src/App.tsx:363-388` + `src/components/Modal.tsx:13-19`

```tsx
// Modal：每个实例都独立往 window 上挂 keydown，没有"只让最上层响应"的判定
window.addEventListener('keydown', onKey)
```

**触发路径**：在卡片编辑器里点「删除」→ 确认框弹出（编辑器**仍然挂着**，因为 `setEditor(null)` 只写在 `onConfirm` 分支里）→ 按 Esc。

**实际后果**：Esc 被两个 Modal 的监听器同时处理 → 确认框关了，**编辑器也关了** → 用户在编辑器里没保存的标题/正文/变量**静默丢失**，无任何提示。

**为什么现有测试没抓到**：仓库无 DOM 环境，组件只测 `renderToStaticMarkup` 静态标记，effect 与事件绑定都不执行。

**建议改法**（二选一）：
- App 层：`{editor && !confirm && <CardEditor/>}`，确认框出现时卸载编辑器（最省事，但要保证确认后仍能删到那张卡）；
- Modal 层：加模块级弹窗栈，只让栈顶响应 Esc（更通用，顺带解决 B3 的遮罩叠遮罩）。

---

### #3 导入文件**没有体积上限**，大 JSON 会卡死页面

**位置**：`src/lib/storage.ts:327-334`（`readFileAsText` 读全文）+ `240-246`（`JSON.parse` 全量解析）

**实际后果**：用户选一个几百 MB 的 `.json` → 主线程同步读文件 + 同步 `JSON.parse` → 标签页长时间无响应，极端情况 OOM 白屏。

**建议改法**：读取前按 `file.size` 拒绝（阈值建议 20 MB），给明确提示：
```ts
export const MAX_IMPORT_BYTES = 20 * 1024 * 1024
// DataDialog 取到 File 后：
if (file.size > MAX_IMPORT_BYTES) { setToast(ui.importTooLarge); return }
```

---

### #4 存储写失败**只提示一次**，1.8 秒后消失且再也不会提醒

**位置**：`src/App.tsx:70-76`

```ts
const storageWarned = useRef(false)
useEffect(() => {
  if (!saveData(data) && !storageWarned.current) {
    storageWarned.current = true
    setToast(ui.storageFailed)          // 1.8 秒后自动消失（App.tsx:92-96）
  }
}, [data, ui.storageFailed])
```

**实际后果**：`localStorage` 写失败（配额满 / 隐私模式）时，用户只看到一次 1.8 秒的 Toast。**此后每次改动都在丢**，界面看起来一切正常，用户以为存上了，实际什么都没保存。

> 盲审把它列为"应修"，我确认成立，但把它从"静默吞掉"改判为"提示太弱"：代码确实提示过一次（这一点我原报告里写的是"不静默吞掉"，成立），问题在于提示是**瞬时且一次性**的，瞬时提示在用户 1.8 秒后回到输入状态时等于不存在，而数据还在持续丢失。

**建议改法**：改成**常驻错误条**（不自动消失），直到写入成功为止；同时把"导出备份"作为按钮直接挂在错误条上。
```ts
const [storageBroken, setStorageBroken] = useState(false)
useEffect(() => {
  if (saveData(data)) setStorageBroken(false)
  else setStorageBroken(true)     // 常驻，不靠 toast
}, [data])
```

---

### #5 `builtin:sec-audit-23` 卡里的 **PHP 比较语义断言是错的**（PHP 8 已改行为）

**位置**：`src/data/preset/secAudit.ts:120-129`（中文）与 `src/data/preset/en/secAudit.ts`（英译层）

**卡里现在写的**：
> 中文：先查类型与原型两条边界：Type Juggling——PHP 松散比较下 `"0e123"=="0e456"` 与 `"1abc"==1` 都判等；……
> 英文：… under loose comparison `"0e123"=="0e456"` and `"1abc"==1` both evaluate equal; …

**问题**：`"1abc" == 1` 在 **PHP 7** 为 `true`，在 **PHP 8 起为 `false`**。卡里没有任何版本限定，等于把 PHP 7 的行为当成通用行为教给模型。

**权威来源（已存档原文，可复核）**：

- `php-src` `PHP-8.0/UPGRADING`，§1 Backward Incompatible Changes → Core：
  > "Non-strict comparisons between numbers and non-numeric strings now work by casting the number to string and comparing the strings. Comparisons between numbers and numeric strings continue to work as before. Notably, this means that `0 == "not-a-number"` is considered false now."
  > RFC: https://wiki.php.net/rfc/string_to_number_comparison

- PHP 手册 `language.types.numeric-strings`（§Numeric strings）：
  > "A PHP string is considered numeric if it can be interpreted as an int or a float."
  形式文法（PHP 8.0.0 起）：`NUM_STRING = ({INT_NUM_STRING} | {FLOAT_NUM_STRING})`，其中 `INT_NUM_STRING = {WHITESPACES} [+-]? {LNUM} {WHITESPACES}`、`FLOAT_NUM_STRING = {WHITESPACES} [+-]? ({DNUM} | {EXPONENT_DNUM}) {WHITESPACES}`。
  ⇒ `"1abc"` **不匹配**该文法（不是 numeric string）；`"0e123"` 匹配 `EXPONENT_DNUM`（是 numeric string）。

- PHP 手册 `language.operators.comparison`（§Comparison with Various Types + PHP 7 行为对照 warning）：PHP 7 下 `var_dump(0 == "a")` 为 `bool(true)`，PHP 8 下为 `bool(false)`。

**由此得到的正确表述**：
| 表达式 | PHP 7 | PHP 8+ | 判定 |
|---|---|---|---|
| `"0e123" == "0e456"` | true | **true** | 卡里正确（两者都是 numeric string，按数值比较 ⇒ 0 == 0） |
| `"1abc" == 1` | true | **false** | **卡里错误**（PHP 8 把数字转成字符串比 ⇒ `"1abc"` vs `"1"`） |

**为什么这条算"应修"而不是"文案瑕疵"**：这张卡是安全审计类的**判据卡**，它直接告诉模型"查这条、这条判等"。模型会据此在 PHP 8 代码库里**报告一个不存在的漏洞**（把 `==` 换成 `===` 的建议在 PHP 8 里并不必要），或者反过来——因为卡里写着"都判等"，遇到 `0 == "not-a-number"`（PHP 8 下为 false）时无法判断真假 ⇒ **审计结论直接出错**。

**建议改法**（中英同步，改写这一句）：
> 中文：`Type Juggling——先确认目标 PHP 版本：PHP 8 起 "1abc"==1 不再判等（数字转字符串比较，"1abc" vs "1"），"0e123"=="0e456" 仍判等（两者都是 numeric string，按数值比）；PHP 7 下 "1abc"==1 判等。给出目标版本与实际比较结果。`
> 英文：`Type Juggling — pin the target PHP version first: as of PHP 8 "1abc"==1 no longer compares equal (the number is cast to a string, "1abc" vs "1"), while "0e123"=="0e456" is still equal (both are numeric strings, compared numerically); under PHP 7 "1abc"==1 was equal. State the version and the actual comparison result.`

> 另一条更稳的写法：把断言换成"**给出目标版本与实际比较结果**"这一动作要求（不写死结论），避免以后 PHP 再改行为时卡又过期。

---

## 3. 建议（16 条）

| # | 问题 | 位置 | 证据 / 后果 |
|---|---|---|---|
| 1 | 英文基础句 + 中文后缀**直接粘连** | `src/lib/compose.ts:54-57` | 探针：`'Audit this code.后缀卡'`。`TERMINAL_PUNCT` 命中英文句号后走"直接连接"分支，中文语境下没有分隔符 |
| 2 | 冒牌预置卡被计入「有 N 条数据不可用」 | `src/lib/storage.ts:283` | 探针：1 张 `builtin:` 冒牌卡 → `invalid=1`、文案说"不可用"，实际是**安全拒绝**。两种情况混在一起，用户会以为文件坏了 |
| 3 | 变量值清空后**静默回落默认值**，用户无法置空 | `src/lib/compose.ts:16` | 探针：值 `''` → 渲染出默认 `Java`。若是有意设计，至少该在变量输入框旁说明（B1 修完后此行为不变，仍需单独决策） |
| 4 | 一个 slot 项缺 `vars` 字段 ⇒ **整份数据判损坏**并回退空白 | `src/lib/storage.ts:76-85` → `139-141` | 探针：只有一处不兼容 → `baseSentence` 变 `''`、原内容进备份键。用户看到的是"数据没了" |
| 5 | 弹窗**没有焦点管理** | `src/components/Modal.tsx` | 盲审实测：弹窗打开后 `activeElement` 仍是 `BODY`，Tab 能跑到遮罩后面。无初始焦点、无焦点回收、无 Tab 陷阱 |
| 6 | 全站只有一处 `:focus-visible`；表单输入框还显式 `outline: none` | `styles.css:871-875` | 全站唯一的 `:focus-visible` 是 `.card-copy`；表单只留边框变色，弱焦点环 |
| 7 | 动画无 `prefers-reduced-motion` 兜底 | `styles.css:399-410, 648-651` | 插入卡的 flash 动画每次 1.1s，前庭敏感用户无退避开关 |
| 8 | i18n 两条死文案 | `src/lib/i18n.ts:69, 74` | `myCardsCount`、`customBadge` 中英两版都实现了，但没有任何组件使用；且 `myCardsCount` 中英口径不一致 |
| 9 | 配方**不能更新**：同名保存会产生两个配方 | `src/components/RecipeBar.tsx:24-32` | 只有 存/还原/重命名/删除，没有"更新此配方"；重复保存同一组合会堆出同名条目 |
| 10 | 搜索**只搜当前分栏** | `src/components/CardLibrary.tsx:27-33` | 在"预置卡库"搜不到"我的卡片"，且无任何提示 |
| 11 | 剪贴板回退路径**丢焦点** | `src/lib/clipboard.ts:15-28` | 临时 textarea 抢焦点，移除后不还给复制按钮，键盘用户丢失位置 |
| 12 | 错误兜底页的语言在**模块加载时**就固定了 | `src/main.tsx:13` | 启动时读一次语言，用户后来切语言、兜底页仍是旧语言 |
| 13 | tooltip 与触发按钮没有 `aria-describedby` 关联 | `src/components/CardItem.tsx:35-39` | 读屏能读到 tooltip 文本，但不会被"读"成按钮的说明 |
| 14 | **31 张英文 suffix 卡正文以小写 `and ` 开头** | `src/data/preset/en/*.ts` | 中文原文以「并」起头，直译成英文后没做大写化。实测 31 张（`sec-audit-02/06/09/12/16/20/24/26/30`、`pentest-02/07/18/26/30`、`coding-04/06/09/13/17/20/22/24`、`output-06/10/13/16/19`、`general-06/09/13/19`）。小写开头的句子拼进英文 prompt 显得像半句话 |
| 15 | 英文文案若干处不地道 | `src/data/preset/en/general.ts:56`、`coding.ts:50`、`coding.ts:65`、`pentest.ts:168` | `prefer that domain mature methods` 缺所有格（应 `domain's`）；`always rollback-able` 非词（应 `reversible`）；`backward compatible` 作定语应连字符 `backward-compatible`；`OWASP API3` 缺版本（应 `2023-API3`） |
| 16 | 英文里两处生造词 | `src/data/preset/en/general.ts:46`、`:92` | `red teamer`（生造，应 `red-team member`）；`not-countable`（生硬，应 `not eligible for counting` / `out of scope for counting`） |

---

## 4. 测试架构缺口（本次复审的结构性结论）

仓库**没有任何 DOM 环境**：

```ts
// vite.config.ts
test: { environment: 'node', include: ['src/**/*.test.ts'] }
```

未安装 jsdom / happy-dom / testing-library ⇒ 组件只能用 `renderToStaticMarkup` 测**静态标记** ⇒ **不跑 effect、不触发交互、不跑事件绑定**。

后果是本次的 B1 / B2 / B3 / #2 **全部无法被现有测试发现**：

- B1、B2 是**纯逻辑**（`defaultVarsFor` / `validateCard`），完全可以用 `environment: 'node'` 的单测覆盖——缺的不是环境，是**用例**（探针已证明：两个纯逻辑断言在 node 环境下就能测出来）。
- B3、#2 是**交互**，必须上 DOM 环境（或用 CDP 真浏览器跑）。

**建议的两步走**：
1. 先补 node 环境的纯逻辑回归用例（B1、B2 各 1 条即可锁死，见 §5.2）；
2. 再引入 `jsdom`（比 testing-library 轻）或对构建产物做 CDP 冒烟，锁住 B3 与 #2。

---

## 5. 复核记录

### 5.1 独立盲审（verifier，未参与产出）的结论与我的复核

| 盲审结论 | 我的复核结果 |
|---|---|
| **B1** 切语言后默认值被焊死 | ✅ **成立**。值级比对：13 张带变量的卡中泄漏 **6 张**（zh→en 6、en→zh 6）。<br>⚠️ **数字修正**：盲审写"en 插入→zh **13/13** 含英文默认值"，实测是 **6/13**——另 7 张的默认值两层一致（Java/Spring/XML/example.com/TypeScript+React/Python+3.12），不泄漏。盲审用的是"输出里是否含拉丁字母"的文本启发式，把语言中性的默认值也算了进去。**不影响结论，但数字要按 6/13 记。** |
| **B2** 英文界面「复制为自定义」97/150 不可用 | ✅ **成立**，数字完全吻合（97 失败 / 51 titleTooLong / 89 textTooLong / 最长标题 41、最长正文 436） |
| **B3** 清空确认框被盖住、按钮点不到 | ✅ **成立**，并补全了完整流程（点不到 → 数据没清 → 先关数据管理弹窗 → 才能清） |
| **S1** 存储写失败只提示一次 | ✅ **成立**，但改判为"提示太弱"而非"静默"（见 #4） |
| **S2** 弹窗无焦点管理 | ✅ **成立**，与我的建议 #5 同一条 |
| **S3** 31 张英文 suffix 卡以小写 `and ` 开头 | ✅ **成立**，探针独立数出 31 张，id 清单一致 |
| **S4** `presetCardsEn.test.ts:82-99` 是**虚假绿灯** | ✅ **成立**，见下 |
| G1–G5 英文文案/配方重名/死键/兜底页语言/aria | ✅ 成立，已并入建议 #12–16 |

**S4 详解**（这是测试本身的问题，值得单独记）：

```ts
// src/__tests__/presetCardsEn.test.ts:82-99
const cardsById = new Map(PRESET_CARDS.map((c) => [c.id, localizeCard(c, 'en')]))
...
vars: Object.fromEntries(card.vars.map((v) => [v.key ?? v.name, v.default ?? ''])),  // ← 用英译卡自己的默认值
const text = composePrompt({ baseSentence: 'Audit this code', slots, manualText: null }, cardsById, 'en')
expect(text).not.toMatch(/[\u4e00-\u9fff]/)
```

这条用例**绕过了真实插入路径**：应用的真实路径是 `handleInsert` → `defaultVarsFor(当前语言层的卡)`（`App.tsx:126-131`），它把**插入瞬间语言**的默认值固化进实例；而用例直接把英译卡自己的默认值塞进 `vars`。⇒ **B1 存在时这条用例仍然是绿的**。

它证明的是"英译卡 + 英译默认值 ⇒ 无中文"，不是"应用拼出的 prompt 无中文"。假绿灯比没有测试更危险——它会让后来人以为这条路径已经被守住。

### 5.2 补的回归用例（node 环境即可，无需 DOM）—— 已全部落地

修复时把下面这些用例都加进去了（`src/__tests__/presetCardsEn.test.ts` 3 条 + `src/__tests__/storage.test.ts` 5 条）：

```ts
// ① 锁 B1：真实插入路径下，中文插入的卡切到英文不得拼出中文
it('回归：中文界面插入的卡，切到英文后拼出的文本不含中文', () => {
  for (const card of PRESET_CARDS) {
    if (card.vars.length === 0) continue
    const inst = defaultVarsFor(card)                    // 中文界面插入
    const text = renderCardText(localizeCard(card, 'en'), inst)
    expect(text, card.id).not.toMatch(/[\u4e00-\u9fff]/)
  }
})

// ② 锁 B1：实例值不得固化成插入那一刻语言层的默认值（双向）
// ③ 锁 B2：英文预置卡「复制为自定义」后必须能通过校验（否则 Save 恒置灰）
it('回归：英文预置卡「复制为自定义」后必须能通过校验', () => {
  for (const card of PRESET_CARDS) {
    const en = localizeCard(card, 'en')
    const draft = { title: en.title, text: en.text, tags: en.tags }
    expect(validateCard(draft), card.id).toEqual([])
  }
})

// ④~⑧ 锁迁移：存量数据里焊死的默认值被清掉，用户自己填的值不动，配方条目同样处理
```

> 独立复核把这几条用例拿去**跑修复前的实现**：第 ① 条会失败（6 处泄漏）⇒ 用例不是恒真，确实能挡住回归。

### 5.3 修复后的独立复核（第二轮，verifier 未参与修复）

修复完成后另起一轮独立复核（verifier 未参与修复过程），判定 **PASS_WITH_NOTES**：三条修复在真实浏览器里用同一套脚本对 **pre-fix（`git archive HEAD` 构建）与 post-fix** 两个包做了 A/B 实测，均实际生效；同时它抓出了我第一版修复漏掉的**存量数据未迁移**（见 §0.1 末节），以及 README 的限值说明未同步（已修）。

它另外确认的几件事：

- **测试断言没有被削弱**：把修复前的实现内联进去跑，新增的第一条回归用例会失败（6 处泄漏）⇒ 不是恒真用例；`storage.test.ts` 的阈值改用常量后 `r.cards===[]` / `r.invalid===2` 仍成立（阈值恒超限），24/160 这个具体数字仍由 `presetCards.test.ts` 写死钉住。
- **规格一致性**：spec / plan 里的 24/160 只约束**预置卡写作**，且由 `presetCards.test.ts` 用写死数字自动校验；`USER_CARD_LIMITS` 只管用户卡表单；spec / plan 未规定用户卡长度 ⇒ 放宽不违反规格。
- **其它弹窗流程未被破坏**（pre/post 完全一致）：删除自定义卡（编辑器 + 确认框，确定按钮在顶层，点击后卡片删除）、导入（数据框已被 `App.tsx:233` 关闭，确认框在顶层，点击后入库）。
- **Esc 双响应是既有缺陷**（报告 #2），本次未修、顺序调整也没改变它；另观察到 Esc 的结果依赖监听器注册顺序（未输入时留 1 个框、输入后关 2 个）。
- **没有引入新的静默失败**：两层 `key` 一致（`localize.ts:27` 的 `key` 指回中文原名，卡库数据不带 `key`），空实例必回落当前语言层的默认值；「未填变量」提示仍由渲染文本判定（`SlotItemRow.tsx:83`），行为未变。

**没能验证**：只用 Chromium headless（CDP），未测 Firefox / 移动端 / 读屏；导入只测了合法导出文件（报告 #1 的损坏文件路径未复验）；无法查看本机浏览器 profile，因此"存量数据实际是否已被污染"只到代码级 + 浏览器级结论。

### 5.4 我复核过、判定**不是** bug 的点

写下来是为了让你知道覆盖到哪了：

- **原型链污染**：整条链路干净。`defaultVarsFor` / `withVarDefault` 用 `Object.create(null)`，读取一律走 `readVar`（`hasOwnProperty`），`localize.ts` 两处直读都加了 `hasOwnProperty` 守卫，`storage.ts` 的 `isVarTable` / `isSlotItem` 拒绝非字符串值。`__proto__` / `constructor` 作为变量名不会出事。
- **导入不可信 JSON**：`app` / `schemaVersion` 必填、逐条过结构守卫、坏条目丢弃计数、冒牌 `builtin:` 卡被拒、缺 `builtin` 字段的补 false 后再验、`RecipeItem.mode` 非法值被 `recipeToCompose` 挡下（且用 `hasOwnProperty` 查槽位名，不会命中原型链）。
- **正则的 `lastIndex` 陷阱**：`UNRESOLVED_PATTERN` / `VAR_EXACT_PATTERN` / `VAR_SPLIT_PATTERN` **都没有 `g` 标志**，`test()` 不会有状态残留；唯一带 `g` 的 `VAR_PATTERN` 只用于 `matchAll`。**不是 bug。**
- **变量名互为前缀**（`{a}` 与 `{ab}`）：替换用的正则是精确的 `\{name\}`，实测不会互相破坏。**不是 bug。**
- **数据损坏兜底**：`fallbackWithBackup` 先备份再回退、备份失败也不卡启动；`lastLoadCorrupted` 会如实提示用户。
- **手填值跨语言稳定**：`key` 指回原名 + `localizeCard` 保留 `key` + `readVar(vars, v.key ?? v.name)` 三处一致，浏览器实测 `Rust` 在中英两界面都保留。**这条链路是对的**（B1 只影响默认值）。
- **导入合并语义**：`mergeById` 按 id 跳过并计数，与提示文案一致；文件里没有 compose 时保持现状（不静默清空）。
- **英译层本身**：0 张卡含汉字、0 张卡强制中文输出、覆盖完整、标题正文各自唯一（由 `presetCardsEn.test.ts` 强制）。
- **React 渲染安全**：预览用 `<pre>` + 文本子节点、卡片正文用 `<span>`，没有 `dangerouslySetInnerHTML`。
- **localStorage 读写与清空**：浏览器实测正常（本次 CDP 实测在 `http://127.0.0.1` 下完成读写与清空验证；盲审另在 `file://` 下验过可写可读）。

---

## 附录 A｜引用来源与可复核信息

本报告只对**卡库内容正确性**（#5）引用外部来源。以下为已抓取的权威原文，可自行复核：

| 文件 | URL | 抓取时间 | sha256 |
|---|---|---|---|
| php-src `PHP-8.0/UPGRADING` | `https://raw.githubusercontent.com/php/php-src/PHP-8.0/UPGRADING` | 2026-10-30T16:35:58+08:00 | `fb3b32baf60adb73e1da774d802dc6cbbcfc3440d5ea3fc273a8cac2b0e7b0c5` |
| php/doc-en `language/operators/comparison.xml` | `https://raw.githubusercontent.com/php/doc-en/master/language/operators/comparison.xml` | 2026-10-30T16:35:58+08:00 | `c3ed8ec55919002d9cedcfaf74ec4f533250878f3dddbf118b8eda61e3b32aec` |
| php/doc-en `language/types/numeric-strings.xml` | `https://raw.githubusercontent.com/php/doc-en/master/language/types/numeric-strings.xml` | 2026-10-30T16:35:58+08:00 | `08e2d0645756e8bfa1ae977e634636ce265067b2698b4364f122e2b824b4ed69` |

逐字引文与章节定位见 §2 #5。**未核实项**：本机没有 PHP 运行时（`php` 不在 PATH），所以 #5 的两条表达式是按上述权威原文推导的，**没有在真实 PHP 解释器上跑过**；结论在 `verified: false` 与"已按权威原文核实"之间：*规则*已核实（原文明确），*具体表达式的运行时行为*未在真机执行。若要 100% 落地，建议在有 PHP 的机器上跑一次 `php -r 'var_dump("1abc" == 1, "0e123" == "0e456");'`。

> 取证方式说明：PHP 官方 wiki 的 RFC 页 `https://wiki.php.net/rfc/saner_string_to_number_comparisons` 已 404（返回 "This topic does not exist yet"），改用 php-src 的 `UPGRADING`（该 RFC 在 8.0 变更说明里被引用）与 php/doc-en 的手册源码，两处都是一手来源。

## 附录 B｜本次复审用到的验证手段

| 手段 | 覆盖 | 说明 |
|---|---|---|
| vitest 探针（临时文件，已删除） | B1、B2、S3、#5 修法验证 | node 环境即可跑纯逻辑；探针跑完即用可恢复删除通道删掉，仓库不留残留 |
| 真实浏览器 CDP（headless Chrome + Node 内置 WebSocket） | B1、B2、B3、存量迁移 | 真实鼠标事件（`Input.dispatchMouseEvent`）而非合成 click，因此命中测试结论可信；构建产物与探针脚本都在临时目录，未进仓库 |
| 独立盲审 + 修复后独立复核 | 全部 3 条阻断 + 4 条应修 + 5 条建议 | 两轮 verifier 均未参与产出/修复；第二轮对 pre-fix / post-fix 做了同脚本 A/B |
| `tsc --noEmit` / `vite build` / `vitest run` | 全局 | 复审时 175 用例全绿；修复后 **183 用例全绿**、exit 0、构建通过（dist/index.html 377 kB） |

**最后一轮端到端确认**（依赖重装 + 重新构建后，用新构建在真实浏览器里跑完四条关键路径）：

| 路径 | 结果 |
|---|---|
| 中文界面插入 13 张带变量的卡 → 切英文 | 预览无中文；首句 `Keep the whole answer within 500 words` |
| 存量数据 `{语言:'中文'}` → 迁移 → 切英文 | 预览无中文；用户手填的 `Rust` 保留 |
| 数据 → 清空本地数据 → 真实点击「确定」 | 1 个遮罩、「确定」即顶层命中目标、点击后遮罩归零、数据清空 |
| 英文界面逐张点 150 张 ⧉ 复制为自定义 | 150/150 全部可保存，0 失败 |
