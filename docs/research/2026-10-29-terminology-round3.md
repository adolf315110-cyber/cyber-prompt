# 术语来源调研（2026-10-29 · 第三 + 第四轮）

> 目的：继续给卡库做「术语密度强化」——用户反馈「还需要增加点专业术语」，要求再搜集 GitHub。
> 配套：写法标准见 [2026-10-19-security-prompt-research.md](./2026-10-19-security-prompt-research.md)；术语来源沿革见 [2026-10-19-terminology-sources.md](./2026-10-19-terminology-sources.md)。
> 抓取通道：jsDelivr CDN（`cdn.jsdelivr.net/gh/<repo>@<branch>/<path>`），稳定可用且不触发 GitHub API 限流。
> 本轮口径：**只换术语、不增删卡片**（数量与结构保持 150 张，40/40/25/25/20 不变）。

## 一、本轮新增来源（3 个）

| # | 仓库 | 提供了什么 | 抓取方式 |
|---|------|-----------|----------|
| 1 | [khasky/awesome-agent-skills](https://github.com/khasky/awesome-agent-skills) → `skills/awesome-pentest/references/test-catalog.md` | **按目标类别组织的测试目录**：WSTG 11 类（INFO/CONF/IDNT/ATHN/ATHZ/SESS/INPV/ERRH/CRYP/BUSL/CLNT）、OWASP API Security Top 10 2023（API1–API10）、OWASP MASTG/MASVS、CISA KEV、STRIDE、denial-of-wallet、multi-tenancy | jsDelivr 直取 md |
| 2 | 同上 → `skills/awesome-security-audit/references/checklists.md` | **按 CWE 锚定的十类审计清单**（注入 / 密钥 / 认证授权 / 敏感数据 / 依赖 / 配置部署 / LLM / 业务逻辑 / CI-CD / 密码学），每条带 CWE 编号与判定口径 | jsDelivr 直取 md |
| 3 | [simota/agent-skills](https://github.com/simota/agent-skills) → `breach/reference/ai-red-teaming.md` | **AI/Agent 红队手册**：OWASP LLM Top 10 2025（LLM01–LLM10）、OWASP Agentic Top 10 2026（ASI01–ASI10）、OWASP Agentic Skills Top 10（AST）、MITRE ATLAS、NIST AI 100-2 E2025、CSA MAESTRO、提示注入三种形态与 ASR 基线 | jsDelivr 直取 md |
| 4 | 同上（2）→ `skills/awesome-security-audit/references/agents-and-mcp.md` | **MCP 服务端视角**：令牌透传=confused deputy（CWE-441）、session id 不是凭据、参数 schema 服务端强制、工具输出回灌模型（CWE-74）、权限判定必须确定性、agent 不能改自己的边界、审计日志在 agent 写不到的地方 | jsDelivr 直取 md |

> 上一轮的 6 个来源（PayloadsAllTheThings / OWASP WSTG / HackTricks / InternalAllTheThings / Awesome-Redteam / CheatSheetSeries）继续有效，未重复抓取。

## 二、本轮替换的卡（18 张）

替换判定标准沿用上一轮：**与现有卡语义重叠度最高、或最泛化（无动作）的卡优先被替换**。

### 安全审计（13 张）

| 卡 | 原主题 | 新主题 | 新增术语 |
|---|---|---|---|
| 07 | 认证授权分开审 | 认证授权分开审（加锚） | CWE-345（客户端可读的会话状态可伪造） |
| 12 | 检查错误处理路径 | 失败路径是否失守 | fail-open 控制点、`except: return True` 即 Critical、限流器后端不可达就放行、feature flag 默认宽松面 |
| 14 | 供应链检查 | 供应链与流水线审计 | CWE-1357（action 未锁 commit SHA）、CWE-913（`pull_request_target` 执行 PR 代码 = poisoned pipeline execution）、CWE-94（Actions 表达式插值进 `run:`） |
| 15 | 从配置与默认值开始 | 平台默认不安全 | 编排器 Secret 仅 base64、镜像无 `USER` 跑 root、缓存/KV 默认关闭认证、WAF/CDN 之后要直连源站 |
| 16 | 给修复优先级 | Agent 与 MCP 服务端 | OWASP Agentic Top 10（ASI01–ASI10）、CWE-441（令牌透传 = confused deputy）、CWE-384（session id 不是凭据）、CWE-74（工具输出回灌模型）、服务端强制参数 schema、最小自治 |
| 21 | 敏感数据清点 | 敏感数据与泄露处置 | 泄露时间窗（exposure window）、轮换 ≠ 撤销、egress 面（webhook/邮件/埋点） |
| 22 | 框架特性审计 | 框架特性审计（加锚） | CWE-915（自动绑定写越权字段）、CWE-1336（用户输入当模板源 = SSTI）、`href`/`src` 的 scheme 白名单 |
| 30 | 输出攻击链 | 开放重定向与 Host 头 | CWE-601（解析后比对而非前缀匹配）、`//evil.example`、`trusted.example.evil.example`、反斜杠变体、Host 头注入污染绝对 URL 与缓存键 |
| 31 | 攻击链推导五步 | XSS 三型专项 | CWE-79、反射/存储/DOM 三型、`location.hash`、`innerHTML`、HTML 转义挡不住 `javascript:` 协议 |
| 35 | LLM 功能审计 | LLM 应用审计 | OWASP LLM Top 10 2025 逐项（LLM01/05/06/07/08/10）、间接注入三形态（PDF 白字、HTML 注释、图像隐写）、多轮判定 |
| 38 | 污点分析五步 | Unicode 与控制字符走私 | U+202A-U+202E、U+2066-U+2069、U+E0000-U+E007F 不可见 tag 块、零宽字符、ANSI 转义、NUL 截断 |
| 39 | 加密与随机数审计 | 密码学误用 | Argon2id/bcrypt/scrypt + cost factor（CWE-916）、`hmac.compare_digest`（CWE-208 时序侧信道）、弱随机（CWE-338）、IV/nonce 复用、ECB、自研套件（CWE-1240） |
| 40 | 会话与令牌生命周期 | 令牌与会话生命周期 | refresh token 轮换与重放检测（CWE-613）、step-up 重新验证（CWE-308）、客服代操作 actor vs effective_user（CWE-778） |

### 渗透测试（5 张）

| 卡 | 原主题 | 新主题 | 新增术语 |
|---|---|---|---|
| 11 | JWT 测试点 | JWT 与令牌校验 | `alg:none`、RS256→HS256 混淆、公钥当 HMAC 密钥、`kid` 指向可控路径、不校验 aud/iss/exp |
| 13 | 影子 API 与版本降级 | API 资产清单 | OWASP API9（Improper inventory management）、`/v1`/`/beta`/`/staging` 端点、API10（不安全消费上游 API） |
| 14 | 双工具复现 | 点击劫持与客户端面 | Clickjacking、X-Frame-Options、CSP `frame-ancestors`、`postMessage` origin 校验、WebSocket 握手鉴权、DOM 存储令牌 |
| 21 | 只测授权范围内 | 资源消耗与业务流 | OWASP API4/API6、denial-of-wallet（烧费用而非可用性）、无分页上限、反自动化与速率限制 |
| 30 | 附风险评级 | CVSS 与 KEV 定级 | CISA KEV（收录即 Critical，不等可达性论证）、CVSS 4.0、EPSS |

> 替换掉的三张重复卡（sec-audit 30/31/38 原本都是攻击链与污点推导，与 24/02/05 重叠）让位给新专题；腾出的 pentest-14（原双工具复现，其判定纪律已由 sec-audit-19/06 覆盖）与 pentest-21（原授权边界，pentest-01 仍在）同理。

## 三、本轮未落卡候选池（下轮备用）

- **WSTG-CLNT 剩余项**：CSS 注入、local-storage 敏感数据、JS 执行 sink 枚举
- **API 剩余项**：API3 BOPLA / excessive data exposure（响应多返回字段）、API8 安全配置错配、API2 认证缺陷细项
- **移动端**：MASVS-STORAGE / CRYPTO / AUTH / NETWORK / PLATFORM / CODE 六项尚未成卡
- **Agentic**：AST01-AST10（skill 注册表投毒、manifest 签名 ed25519、权限范围最小化）、MITRE ATLAS 战术分层、NIST AI 100-2 E2025 三分类、CSA MAESTRO 七层
- **AI 判定基线**：200 次尝试约 78.6% 突破、10 次约 50%（AI Safety Report 2026）、12 个已发表防御被自适应攻击 >90% 绕过 → 护栏须放在 LLM 之外
- **其它**：STRIDE 逐边界、CIS Benchmarks、JWT `jku`/`x5u` 头、Unicode 归一化、GraphQL 字段级鉴权

## 四、验证方式（机器可查）

- `npm run test`：150 张定额、40/40/25/25/20、双类各 40 张、标题 ≤24、文本 ≤160、tags 2-4、去标点后标题与文本唯一、`{变量}` 登记齐全、英译层全覆盖且 token 一一对应 —— 全绿
- `npx tsc --noEmit` 与 `npm run build` 通过
- 长度自检脚本（临时）：150 张中文标题 ≤24、正文 ≤160；150 张英文标题 ≤64、正文 ≤480

---

## 五、第四轮（同日续做）：清候选池

第三轮留下的候选池继续消化，来源不变（仍以第一、二轮的 6 个 + 第三轮的 4 个仓库为底），再替换 **14 张**卡。

### 安全审计（7 张）

| 卡 | 原主题 | 新主题 | 新增术语 |
|---|---|---|---|
| 04 | 语言特有危险模式 | 危险模式（加 ReDoS） | 正则灾难性回溯（ReDoS） |
| 23 | 边界与异常优先 | 类型与原型两条边界 | Type Juggling（PHP 松散比较 `"0e123"=="0e456"`、`"1abc"==1`）、Prototype Pollution（`__proto__`/`constructor.prototype` 污染翻转 isAdmin） |
| 25 | 注入面清点 | 注入面清点（补家族） | CSV 注入（公式）、SSI、ORM 字段直拼、NoSQL 对象操作符 `$gt`、二阶注入（先存后取再拼进查询） |
| 26 | 说明审计局限 | AI 护栏判定基线 | ASR 基线（200 次尝试约 78.6% 突破、10 次约 50%）、提示级防御面对自适应攻击绕过率可超 90% → 护栏与审批必须在模型之外 |
| 29 | 对照安全基线 | 对照三套基线 | STRIDE 逐信任边界、CIS Benchmarks 配置基线、CISA KEV 收录即 Critical、未覆盖项标 NOT ASSESSED |
| 33 | 反隧道视野 | 移动端 MASVS 核对 | MASVS 六项：STORAGE / CRYPTO / AUTH / NETWORK / PLATFORM / CODE |
| 36 | 缓存与共享状态 | 多租户隔离 | tenant scoping 缺失 = 跨租户 IDOR、缓存键/向量库/会话记忆/导出任务按租户分区 |

### 渗透测试（5 张）

| 卡 | 原主题 | 新主题 | 新增术语 |
|---|---|---|---|
| 06 | 复杂功能优先 | 账号接管专项 | Account Takeover（重置密码 Host 头投毒、令牌可预测、邮箱/手机号变更、OAuth 绑定解绑劫持） |
| 14 | 点击劫持与客户端面 | 客户端面 | DOM Clobbering（id/name 覆盖全局对象伪造权限）、postMessage origin 校验、WebSocket 握手鉴权 |
| 31 | OAuth/OIDC 测试点 | 单点登录测试点 | OIDC 断言校验、SAML 签名剥离与签名包裹（XSW）、RelayState 与 post_logout_redirect_uri 开放重定向、IdP 元数据被替换 |
| 32 | Mass Assignment | Mass Assignment 与过量数据暴露 | OWASP API3 BOPLA、写侧越权字段、读侧多返字段、字段级鉴权 |
| 33 | GraphQL 专项 | GraphQL 专项 | field-level authorization（字段级鉴权）、resolver 内漏检的查询参数 |

### 通用与编程（2 张）

| 卡 | 原主题 | 新主题 | 新增术语 |
|---|---|---|---|
| general-10 | 领域锚定 | 领域锚定（AI 分支） | MITRE ATLAS 战术分层、NIST AI 100-2 E2025 三分类、CSA MAESTRO 七层 |
| coding-14 | 技术栈约束 | 技术栈约束（依赖分支） | lockfile 冻结安装、install scripts 以开发者与 runner 权限执行、dependency confusion |

## 六、第四轮后仍缺的术语（下一轮）

- Reverse Tabnabbing（`window.opener` 反向劫持）—— 因 160 字上限从 pentest-14 挤出
- Unicode 归一化（NFC/NFKC）—— 与 sec-audit-38 的走私卡争长度
- API2 Broken authentication 细项、API8 安全配置错配
- OWASP Agentic Skills Top 10（AST01-AST10）：skill 注册表投毒、manifest 签名 ed25519、权限范围最小化
- JWT `jku` / `x5u` 头注入（SAML 侧已落 `kid`/`jwk` 同类思路）
- ORM Leak、Client-side Path Traversal

## 七、术语覆盖实测

对 66 个目标术语做大小写不敏感全量扫描（中文卡库 + 英译层），经多轮强化后覆盖 65/66；唯一未命中的是 Unicode 归一化 NFC/NFKC（已列入上一节）。

本节第六节的候选池仍然有效，未被消耗。

