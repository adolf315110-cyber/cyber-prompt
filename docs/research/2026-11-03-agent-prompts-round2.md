# 开源提示词调研 · 第二轮（2026-11-03）

> 上一轮（`2026-10-30-agent-prompt-patterns.md`）收集通用 agent + CAI，落地了六条差距。
> 本轮换方向：找**专门做漏洞挖掘**的提示词工程，因为它们的约束比通用 agent 更硬。
> 原文归档 `raw/`，未入仓库，理由见文末。

## 一、本轮来源

| 项目 | 仓库 | 许可证 | 抓到的文件 | 为什么值得看 |
|---|---|---|---|---|
| **Vulnhuntr** | `protectai/vulnhuntr` | AGPL-3.0 | `vulnhuntr/prompts.py`（17KB，全部 prompt） | 用 LLM 做零样本漏洞挖掘，按漏洞类型分离模板，输出带置信度与 PoC |
| **PentestGPT** | `GreyDgl/PentestGPT` | MIT（legacy 部分） | `pentestgpt_legacy/prompts/prompt_class.py`（8KB） | 用「渗透测试树 PTT」把长任务拆成带状态的分层任务 |

试过但拿不到：`vxcontrol/pentagi`（jsDelivr 403）。GitHub API 未认证限流（60/h，代理出口 IP 共享），改用 jsDelivr 才通。

## 二、Vulnhuntr：五个可直接借的设计

### 2.1 置信度与「远程可利用」硬绑定

这是本轮最有价值的一条。原文：

> If your proof of concept (PoC) exploit does not start with remote user input via remote networking calls such as remote HTTP, API, or RPC calls, **set the confidence score to 6 or below**.

它把「这个洞是不是远程可达」编码进了置信度上限，而不是靠一句「请判断是否远程可利用」。

价值在于：置信度是个数字，模型改不动它；而「请判断」是句建议，模型可以绕过。

### 2.2 初筛宽、二筛严的两阶段漏斗

初筛（`INITIAL_ANALYSIS_PROMPT_TEMPLATE`）：

> **Be generous and thorough** in identifying potential vulnerabilities as you'll analyze more code in subsequent steps, so if there's just a **possibility** of a vulnerability, include it.

然后才用「漏洞类型专属模板」逐类深挖。两阶段职责分明：第一阶段宁滥勿缺，第二阶段才收紧。

对比：卡库的清单卡让模型一口气完成「发现 + 定性」，模型倾向于在发现阶段就把不确定的疑点删掉 —— 这正是漏报的主要来源。

### 2.3 每个漏洞类型一套模板，且模板是固定四步

7 个类型（LFI / RCE / XSS / AFO / SSRF / SQLi / IDOR），每个模板结构一致：

1. **Identify Entry Points** — 找远程输入点
2. **Trace Input Flow** — 追踪流经的变换
3. **Locate sinks** — 定位危险操作（并点名具体 API，如 `cursor.execute()`、`Model.objects.raw()`）
4. **Analyze Input Handling** — 判断进入方式是拼接还是参数化

差别在「每类的常见位置与常见函数」这一层。例如 IDOR 模板点名 `has_permission()` / `is_authorized()`，并要求「这些检查必须紧跟在对象引用之后」。

### 2.4 PoC 必须针对本段代码，且绕过路径上所有控制

> - Ensure PoCs are **specific to the analyzed code, not generic examples**.
> - Review the code path of the potential vulnerability and be sure that the PoC **bypasses any security controls in the code path**.

第二条尤其硬：不是「有没有控制」，而是「你的 PoC 有没有真的绕过去」。绕不过就说明这个洞不成立。

### 2.5 scratchpad 与 analysis 分离

> Place your step-by-step analysis in the **scratchpad** field, before doing a final analysis in the **analysis** field.

过程与结论分两个字段装。好处是结论不会被过程带偏，评审也能分开看。

## 三、PentestGPT：两个设计

### 3.1 PTT（Penetration Testing Tree）

把任务写成带状态的分层树：`1` / `1.1` / `1.1.1`，每个节点标 `to-do` / `completed` / `not applicable`。每轮只展开**当前那个 to-do 子任务**，且「不要为未知端口/服务生成任务」——测得出来才加节点。

这解决的是「长任务跑到一半不知道自己在哪」的问题。卡库目前是并列清单，没有进度结构。

### 3.2 只归纳，不下结论

信息解析阶段的指令：

> You **only summarize**. You **do not conclude or make assumptions**.
> You should keep both finding's **field name and value**. For instance, keep both port number and the service name/version if a port is open.

这条防的是模型在「转述工具输出」时偷偷加判断，把 `22/tcp open ssh OpenSSH 7.4` 写成「SSH 版本过旧存在风险」——后者可能对，但它是推论，不该混在事实里。

## 四、本轮落地：四条硬判据

只挑了能塞进 160 字上限、且判据足够硬的四条。其余（PTT 任务树、按类型分离模板）需要结构改动，不是改文案能解决的。

| 来源 | 落点 | 改法 |
|---|---|---|
| 2.4 PoC specific + 绕过所有控制 | `sec-audit-09`「给最小复现输入」 | 增补「PoC 必须针对这段代码而非通用示例，且绕过路径上每一道校验——绕不过的那道就是阻断点，如实写明并降级」 |
| 2.1 置信度绑定远程可达 | `output-22`「置信度分级输出」 | 增补「PoC 起点不是远程输入（要本地访问、CLI 参数或已有 shell）时最高记 [高置信]」 |
| 3.2 只归纳不下结论 | `output-04`「证据与引用」 | 增补「转述工具输出与页面时只归纳不下结论——原样保留字段名与值（端口配服务版本、参数配取值），不写推测」 |
| 2.2 初筛宽、二筛严 | `output-24`「负结论也要报告」 | 增补「初筛阶段宁可多记候选（只要有可能就列），定性放到复现阶段做，别在初筛就删疑点」 |

配套 4 条判据契约断言（中英双层），测试 189 → 193。

## 五、没落地的，以及为什么

| 没落地 | 原因 |
|---|---|
| 2.3 按漏洞类型分离模板 | 需要把「检查面卡」重构成「漏洞类型卡」，涉及换卡与分类调整，不是文案级改动。且卡库恒 150 张，重构要重新分配配额 |
| 3.1 PTT 任务树 | 卡库目前只有 `prefix/suffix/block` 三种拼装位置，没有「任务状态」这个维度。要做需要给数据模型加字段（`status`），会影响 storage schema 与迁移 |
| 2.5 scratchpad / analysis 分离 | 输出结构层面，靠卡文案约束成本高（模型容易合并字段）。上一个 `output-11 决策记录` 部分承接了「过程可追溯」 |

## 六、许可证

- Vulnhuntr 是 **AGPL-3.0**，PentestGPT legacy 部分 MIT。
- AGPL 是强 copyleft：**复制其 prompt 文本进本仓库会让整个仓库受 AGPL 约束**。所以本轮只提炼设计模式、用中文重写判据，不搬原文。
- `raw/` 保持 gitignore，只在本地留存查阅。

## 七、抓取备忘（补充上一轮）

- GitHub 未认证 API 限流是**按出口 IP 算**的，多个项目连着拉很容易 60/h 用光。遇到 `API rate limit exceeded` 就直接换 jsDelivr：
  - 列文件：`https://data.jsdelivr.com/v1/package/gh/<owner>/<repo>@<branch>/flat`
  - 取文件：`https://cdn.jsdelivr.net/gh/<owner>/<repo>@<branch>/<path>`
- jsDelivr 只对公开仓库有效，且不认 `main` 之外的默认分支时要显式写分支名。
- 验证仓库真实默认分支仍要走 `GET /repos/{owner}/{repo}`（`hexstrike-ai` 是 `master`，`cai` 是 `archive`）。
