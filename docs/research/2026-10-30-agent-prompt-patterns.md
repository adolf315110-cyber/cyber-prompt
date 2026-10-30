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
| Throttle aggressively | 扫描/爆破/撞库必须限速，否则触发 IDS 行为分析 |
| Respond to detection immediately | 观察到检出指标立即停手重估 |

### 2.4 起手三阶段（`First Turn Protocol`）

`Phase 1 运行时环境`（OS/架构、身份与权限、网络位置、容器检测）→ `Phase 2 工具清单`（攻击工具、网络与横向、语言与编译器、数据处理）→ `Phase 3 防御控制`（EDR/AV、SIEM/日志代理、防火墙），每一阶段都带具体命令。

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
