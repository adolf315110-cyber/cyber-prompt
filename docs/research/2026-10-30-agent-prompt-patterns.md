# 开源 Agent 提示词调研（2026-10-30）

> 目的：收集真正开源项目自带的 agent 提示词，提炼「让模型系统性地把事做完」的结构模式，对照本项目的卡片库找差距。
> 抓取通道：`raw.githubusercontent.com` + GitHub Trees API（走本机代理 7891）。
> 原始文件在 `raw/`（272KB，11 个文件），**未入仓库**，原因见文末「许可证」。

## 一、来源清单

| 项目 | 仓库 | 许可证 | 抓到的文件 | 体积 |
|---|---|---|---|---|
| Gemini CLI | `google-gemini/gemini-cli` | Apache-2.0 | `packages/core/src/prompts/snippets.ts`（真实 prompt 片段集） | 70KB |
| Cline | `cline/cline` | Apache-2.0 | `sdk/packages/shared/src/prompt/cline.ts`、`system/act.ts` | 12KB |
| Aider | `Aider-AI/aider` | Apache-2.0 | `aider/coders/base_coder.py`（prompts 字典内嵌）、`aider/prompts.py` | 88KB |
| CAI（Cybersecurity AI） | `aliasrobotics/cai` | NOASSERTION（已归档） | `src/cai/prompts/core/system_master_template.md`、`system_apt_agent.md`、`system_orchestration_agent.md`、`system_replay_attack_agent.md` | 70KB |
| goose | `block/goose` | Apache-2.0 | `crates/goose/src/prompts/system.md`（Jinja 骨架，非全文） | 1.2KB |

**探过但没采用的**：
- `OpenHands/OpenHands`（9.2 万 stars）— 仓库已拆成前端应用，agent 与 prompt 迁到独立 SDK 仓库，不在此树内。
- `0x4m4/hexstrike-ai`（1.3 万 stars，MIT）— 默认分支 `master`，树内仅 15 个文件，prompt 不在此仓库。
- 各类 `system_prompts_leaks` / `CL4R1T4S` / `system-prompts-and-models-of-ai-tools`（后者 14 万 stars）— **均为泄露内容**，非开源项目自发布；且后者为 GPL-3.0，复制会引入 copyleft 义务。本调研不采用。

## 二、CAI：唯一一个真做安全测试的 agent 提示词

CAI 是这几个里唯一面向渗透/CTF 的，参考价值最高。

### 2.1 TRACE 循环（`system_master_template.md`）

每一步强制走：**Trace context → Reason → Act → Check → Explain**。

关键在 `Reason` 阶段的原文要求：

> state the hypothesis and select the next step with precise justification. **Define success and abandon criteria up front.**

和 `Act` 阶段：

> perform **exactly one bounded action**, specifying the tool and exact parameters. Prefer lower-impact actions first and escalate only when justified by evidence.

这两条是本项目卡库最缺的，见下文第三节。

### 2.2 七段强制输出（`master_template` 的 `Required per-step sections`）

用固定标题，一步一段：

1. Context & Assumptions
2. Plan（hypothesis and immediate objective）
3. Action & Parameters
4. Observations & Evidence
5. Validation & Analysis
6. Result
7. Decision & Next Steps

外加末尾 `Decision Log`：每步一行，记决策与结果。

要求原文还强调「每个步骤必须自包含，读者不需要看前面的步骤也能理解理由」。

### 2.3 APT agent 的十条纪律（`system_apt_agent.md`）

比本项目的纪律卡更硬，原文要点：

| 纪律 | 原文要点 |
|---|---|
| Authorization first | 动手前核对目标 IP/域名在授权范围内 |
| Plan before acting | 每个重要动作前走完 TRACE |
| **One technique, one chance** | 技术失败就分析并换方法，**不重试同一命令**——重复失败制造日志噪音、提高被检出概率 |
| Confirm before destroying | 破坏性/不可逆动作前要操作者确认 |
| Document continuously | 记录每个动作与产生的 IOC |
| Prefer LOLBins | 用系统自带二进制而非投放工具 |
| Establish redundancy early | 高风险操作前先建好备用访问路径 |
| Encrypt everything in transit | 传输与外传通道必须加密，明文凭据算我方失误 |
| Throttle aggressively | 扫描/爆破/撞库必须限速，否则触发 IDS 行为分析 |
| Respond to detection immediately | 观察到检出指标立即停手重估 |

### 2.4 起手五阶段（`First Turn Protocol`）

原文是**五**个阶段（`cai__system_apt_agent.md`），前四阶段各带具体命令：

| 阶段 | 内容 |
|---|---|
| Phase 1 运行时环境 | OS/架构、身份与权限、网络位置、容器/虚机检测 |
| Phase 2 工具清单 | 攻击工具、网络与横向、语言与编译器、数据处理 |
| Phase 3 防御控制 | EDR/AV 进程、SIEM/日志代理、防火墙规则（查**本机**有没有被盯着） |
| Phase 4 既有战役恢复 | 历史状态与操作日志、`authorized_keys`、出网连通性自测 |
| Phase 5 环境评估报告 | 一段结构化的环境评估结论（`=== OPERATIONAL ENVIRONMENT ASSESSMENT ===`） |

## 三、对照本项目卡库：六个真实差距

按「改起来收益最大」排序。

### 差距 1：只有事后判定，没有事前放弃条件

卡库现在写的是「命中＝响应体含他人对象数据」「403/404 不清白，重试仍拒才记否定」——**都是事后判定**。

CAI 要求动手前就定 `abandon criteria`。区别很实在：事后判定决定「这条能不能报」，事前放弃条件决定「这个方向还值不值得继续投时间」。

现状：`pentest-39` 有一条粗粒度的（同一参数 45 分钟无进展就换目标），但没有细到「这个注入点试到第几种编码仍无差异就放弃」。

### 差距 2：一次一个动作 vs 一次列一张清单

`sec-audit-25` 一次列 11 种注入面，`pentest-33` 一次列 6 类 GraphQL 测试点。模型面对这种卡的典型行为是：**写一段「以上均已检查」的汇总，而不是逐项真去验**。

CAI 的做法相反：`exactly one bounded action`，做完观察、再决定下一步。

这不是说卡要拆成 11 张（卡库恒 150 张），而是卡里应该加一句约束：**逐项输出，每项单独给观测，未观测的标未验证，不得汇总成一句「已检查」**。

### 差距 3：缺「同一技术不重试」

`pentest-39` 讲的是节奏（45 分钟、20 分钟自问、单模块 ≤30%），但没说「同一手法失败后必须换方法而不是改参数重试」。

CAI 的理由很具体：重复失败制造日志噪音、提高被检出概率。这条对 SRC 场景直接有用——同一 payload 打十遍只会让对方 WAF 记住你。

### 差距 4：缺 Decision Log

七段输出里有 `Observations & Evidence` 和 `Decision & Next Steps`，末尾还有每步一行的 Decision Log。

本项目 `output` 类有章节控制卡，但没有「每步一行决策记录」这种形态。它的价值在长任务里：中途换方向时，能看出是在第几步、因为什么换了。

### 差距 5：验证深度不分级

gemini-cli 按任务复杂度分三档要求：

- Simple → **Changes** + **Verification** 清单
- Standard → **Objective** / **Key Files & Context** / **Implementation Steps** / **Verification & Testing**
- Complex → **Background & Motivation** / **Scope & Impact** / **Proposed Solution** / **Alternatives Considered** / 分阶段 **Implementation Plan** / **Verification** / **Migration & Rollback**

卡库是一刀切：不管审一个 300 行的服务还是百万行的 asar，要求的输出结构一样。结果是小事过度输出、大事验证不足。

### 差距 6：缺我方环境自检

`pentest-05` 是资产测绘（打对方），但没有「打之前先确认自己手上有什么」：可用工具、字典路径、出网通道、回连地址是否可达。

CAI 的 First Turn Protocol 把它做成第一步，带命令。缺这一步的代价很具体：**报告里写「OOB 未回连」，其实是自己的 Collaborator 没配**。

## 四、其他可借鉴的写法

- **Plan / Act 模式分离**（cline）：`Plan mode: explore, analyze, and plan -- not to execute`。本项目卡库的 `prefix/suffix/block` 是**拼装位置**，不是行为模式，两回事，别混。
- **输出确定性**（CAI）：`Keep outputs deterministic and consistently structured`——同样输入应产出同样结构的报告，便于横向比对多次审计结果。
- **自包含性要求**（CAI）：每一步的说明要能让读者不看前文也懂。这对多人协作的审计报告是硬要求。

## 五、许可证：为什么 `raw/` 没进仓库

- Apache-2.0 的三个项目（gemini-cli / cline / aider）允许再分发，但**必须保留版权与许可声明**，且要随附 LICENSE 副本。
- CAI 是 `NOASSERTION`（GitHub 无法识别许可证），**默认视为保留所有权利**，全文复制进公开仓库有风险。
- 本仓库目前没有 LICENSE 文件。把第三方全文塞进来会让许可证状况变成一团乱麻。

处理方式：`raw/` 已加入 `.gitignore`，全文只在本地留存供查阅；仓库内只保留本文档（自己写的分析 + 有限引用 + 来源链接）。

## 六、抓取方法备忘

- 仓库实际默认分支不一定是 `main`：`hexstrike-ai` 是 `master`，`cai` 是 `archive`。先查 `GET /repos/{owner}/{repo}` 拿 `default_branch`。
- 路径直接猜大概率 404，先拉 `GET /repos/{repo}/git/trees/{branch}?recursive=1`，按关键词和体积筛。
- 大文件优先抓：几个 KB 的 `system.md` / `prompts.ts` 多半是模板骨架或文档，不是真 prompt。

---

## 七、本轮落地：六个差距怎么进卡库（2026-10-30）

卡库恒 150 张、分类配额 40/40/25/25/20 不变 ⇒ 每条新模式都要**替换掉等量的旧卡**，且只替换"与 output 类重复"或"按卡库自家规范本就该归 output 类"的卡。本轮共 **3 张新卡 + 7 张原位增补**，中英双层同步。

| 差距 | 落地卡位 | 具体改法 |
|---|---|---|
| **差距 1** 事前放弃条件 | `general-05`「先定成功标准」 | 增补"与放弃条件…出现什么情况就停手而不是继续猜"（原文：`Define success and abandon criteria up front.`） |
| | `pentest-39`「测试节奏纪律」 | 增补"动手前写清本方向的放弃条件，如该注入点试到第 3 种编码仍无差异就放弃"（把粗粒度的"45 分钟换目标"细化到单点） |
| **差距 2** 一次一动作 / 逐项不汇总 | `sec-audit-25`「注入面清点」 | 增补"逐项给观测，未观测标[待验证]，不汇总成「已检查」"（原文：`perform exactly one bounded action` + 每步单独给观测） |
| | `pentest-33`「GraphQL 专项」 | 同上（这两张是"一次列 11 种 / 6 类"的典型卡，改造点就在它们身上） |
| **差距 3** 同一技术不重试 | `pentest-39`「测试节奏纪律」 | 增补"同一手法失败就换方法，不改参数重试同一条命令（重复失败只增日志噪音与被检出概率）"（原文：`One technique, one chance`） |
| **差距 4** Decision Log | **`output-11`「决策记录」（新）** | 替换原「一页速览」：每步末尾追加一行「第 N 步｜决策｜结果」，中途换方向写明被哪条观测推翻，每步自包含 |
| **差距 5** 验证深度分级 | **`output-09`「按复杂度分档输出」（新）** | 替换原「面向开发读者」：简单→变更点＋验证清单；标准→目标/关键文件/实施步骤/验证；大→背景/影响范围/方案/备选对比/分阶段计划/验证/迁移回滚（原文：gemini-cli 的 Simple/Standard/Complex 三档） |
| **差距 6** 我方环境自检 | **`pentest-02`「先自检我方环境」（新）** | 替换原「给出可复现验证」：可用工具与字典路径、出网通道与代理、**回连地址先自测一次再判「未回连」**、权限与容器限制、本机是否有 EDR/日志代理在盯；自检不过先修工具，别把工具故障写成目标不存在（原文：`First Turn Protocol` 的 Phase 1/2/3/4 自检项；**Phase 5 的"环境评估报告"格式未覆盖**） |
| 附：输出确定性 | `output-14`「格式约定统一」 | 增补"同样输入应产出同样结构的报告，便于多次审计横向比对"（原文：`Keep outputs deterministic and consistently structured.`） |
| 附：每步自包含 | 随 `output-11` 一并落地 | 原文同一段：`Each step must be self-contained` |
| 附：高危项两条独立复现路径 | `output-08`「复现步骤格式」 | 增补"高危项给两条相互独立的复现路径（如 curl 与 Python requests）"（原 `pentest-02` 的内容，并入此处） |
| 附：面向开发者的措辞 | `output-20`「受众适配」 | 增补"开发要代码级细节、**术语直接用**"（原 `output-09` 的内容，并入此处） |

### 被替换的三张卡，内容去哪了

| 替换掉 | 去向 |
|---|---|
| `output-11`「一页速览」（风险全景表 + 三条建议） | `output-25`「执行摘要格式」已含同样内容（风险全景表 + 最优先修复三条 + 攻击链示意）；"结论先行、细节后置"由 `output-05`「结论先行」+ `output-03`「控制篇幅」承担 |
| `output-09`「面向开发读者」 | `output-20`「受众适配」（带 `{受众}` 变量）覆盖，"术语直接用"已并入其正文；**"不做面向管理层的概览式表述"这一反向约束未保留**（表格化对照由 `output-02` 承担） |
| `pentest-02`「给出可复现验证」 | 复现格式由 `output-08`「复现步骤格式」（已并入"两条独立复现路径"）与 `sec-audit-09`「给最小复现输入」（原始请求）保留；"原始流量包"由 `pentest-07`「保留原始证据」（HAR / Burp 工程）保留 |

### 版权与写法（重申）

- 卡正文全部是**我们自己写的中文表述**，只借鉴**结构模式**（TRACE 五段、七段输出、决策记录、深度分档、一次一动作），**没有整段复制第三方原文**——独立复核实测：全库 150 张卡与 11 个原始文件的**最长逐字重合为 26 个字符**（` abandon criteria up front`，功能性短语）。
- 英文层同样由我们撰写，但会保留必要的**术语与短语**（`decision log`、`abandon criteria`、`log noise` 等）以便对照与检索；这类短语属于术语，不是表达性内容。
- 原始文件仍只在 `docs/research/agent-prompts/raw/`（`.gitignore` 内），供逐字核对。

### 自动化断言的边界（诚实说明）

- 现有测试能保证：标题/正文长度与唯一性、tags 数量、`{变量}` 登记、英译层全覆盖且无中文、判据契约锁定的 4 张卡不被改软。
- 现有测试**不能**保证：① 中英两层**语义等价**（英文写反了测试照样绿）；② 没有第三方原文照抄检测（原文未入库，无法比对）。这两点本轮靠**人工逐字核对 + 独立复核**保证，不是自动化保证。
- 已知未覆盖的缺口：gemini-cli 的三档是**计划文档**结构，我们扩成了"输出深度"分档（属转译，非原样搬用）；CAI `First Turn Protocol` 的 Phase 5「环境评估报告」格式未落卡。

### 验证

`vitest run` **189 用例全绿**（含标题/正文长度与唯一性、英译层覆盖与无中文、判据契约、本轮新增的 6 条**中英跨层契约**）、`tsc --noEmit` exit 0、`vite build` 通过。本轮改动经独立复核（未参与产出）判定 **PASS_WITH_NOTES**；其指出的文档事实错误（First Turn Protocol 是五阶段不是三阶段）、中英措辞漂移与映射表漏项已在本轮修正，并据此补上了「中英两层语义等价」此前缺失的自动化断言。
