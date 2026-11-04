# 专业术语表（2026-11-04）

> **口径**：本仓库只**收集专业术语**——标准编号、漏洞类别、攻击手法、协议/字段/工具名、框架与基线名称，以及工具的操作指令与内部调用术语（对象、API、字段与机制，见 J 节）。
> 不收录第三方提示词原文，不做 agent 提示词结构研究；内容只取自公开标准与类目索引。
> **用途**：给 150 张预置卡做「术语密度强化」。卡文案里标准术语一律保留英文原名与编号，让提示词对 AI 呈现专业信号，也让界面搜索能按术语命中。
> **沿革**：第一轮 `2026-10-19-terminology-sources.md`（6 个来源）、写法标准 `2026-10-19-security-prompt-research.md`、第三/四轮 `2026-10-29-terminology-round3.md`（4 个来源 + 候选池）。本文档是**汇总与收束**：把散在各轮记录里的术语按域重排成一张可查表，并消化此前「已收集但未落卡」的候选池。轮次文档保留原有沿革，不改动。
> **保持不变**：卡库恒 150 张、分类配额 40/40/25/25/20、中文标题 ≤24 字 / 正文 ≤160 字、英文层 ≤64 / ≤480、tags 2-4、中英双层同步。

---

## 一、术语来源（词表源，不是提示词源）

只列**提供术语/分类体系**的公开资料。均为标准文档、测试指南或类目索引，用来核对术语拼写与归属，不引用其中的指令文本。

| # | 来源 | 类型 | 提供什么 |
|---|------|------|----------|
| 1 | [OWASP WSTG](https://github.com/OWASP/wstg) | 测试指南 | 12 类测试编号（INFO/CONF/IDNT/ATHN/ATHZ/SESS/INPV/ERRH/CRYP/BUSL/CLNT/APIT）与测试名 |
| 2 | [OWASP API Security Top 10 (2023)](https://owasp.org/API-Security/) | 风险清单 | API1–API10 编号与官方命名 |
| 3 | [OWASP MASVS / MASTG](https://mas.owasp.org/) | 移动标准 | STORAGE/CRYPTO/AUTH/NETWORK/PLATFORM/CODE 六域 |
| 4 | [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) | 验证标准 | L1/L2/L3 控制项 |
| 5 | [OWASP CheatSheetSeries](https://github.com/OWASP/CheatSheetSeries) | 速查表索引 | 交叉核对术语拼写 |
| 6 | [OWASP LLM Top 10 (2025)](https://genai.owasp.org/llm-top-10/) | 风险清单 | LLM01–LLM10 |
| 7 | [OWASP Agentic Top 10 (2026)](https://genai.owasp.org/) | 风险清单 | ASI01–ASI10；同源 Agentic Skills Top 10（AST01–AST10） |
| 8 | [MITRE CWE](https://cwe.mitre.org/) | 缺陷枚举 | CWE 编号与名称 |
| 9 | [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings) | 类目索引 | 63 个漏洞类目目录名 |
| 10 | [InternalAllTheThings](https://github.com/swisskyrepo/InternalAllTheThings) | 类目索引 | 域/云/CI-CD 深目录术语 |
| 11 | [HackTricks](https://github.com/HackTricks-wiki/hacktricks) | 方法论索引 | 网络协议攻击、取证、沙箱逃逸 |
| 12 | [Awesome-Redteam](https://github.com/Threekiii/Awesome-Redteam) | 中文术语体系 | 信息收集/权限维持/凭据获取/防护规避等中文类目 |
| 13 | [awesome-agent-skills · test-catalog](https://github.com/khasky/awesome-agent-skills) | 测试目录 | WSTG 11 类、API Top 10、MASVS、KEV、STRIDE、denial-of-wallet、multi-tenancy |
| 14 | 同上 · checklists | CWE 锚定清单 | 十类审计清单逐条带 CWE 编号 |
| 15 | [simota/agent-skills · ai-red-teaming](https://github.com/simota/agent-skills) | AI 红队手册 | LLM Top 10 / Agentic Top 10 / AST / ATLAS / NIST AI 100-2 / MAESTRO / ASR 基线 |
| 16 | 同上 · agents-and-mcp | MCP 服务端 | confused deputy、session id、schema 强制、工具输出回灌 |
| 17 | [MITRE ATLAS](https://atlas.mitre.org/) / [NIST AI 100-2 E2025](https://csrc.nist.gov/) / [CSA MAESTRO](https://cloudsecurityalliance.org/) | AI 威胁框架 | 战术分层、三分类、七层模型 |
| 18 | [CISA KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) / [FIRST EPSS](https://www.first.org/epss/) / [FIRST CVSS](https://www.first.org/cvss/) | 定级度量 | 收录目录、利用概率、评分向量 |

抓取通道沿用前几轮：jsDelivr 数据接口列目录（`data.jsdelivr.com/v1/package/gh/<owner>/<repo>@<branch>/flat`）、CDN 直取文件，不触发 GitHub 未认证 API 限流。

---

## 二、术语表

格式：`术语 / 编号` — 中文含义 — 备注（分类归属、易混点）。**全部为术语本身，不含任何指令、模板或提示词文本。**

### A. 标准 · 框架 · 编号体系

| 术语 | 中文 | 备注 |
|---|---|---|
| WSTG | Web 安全测试指南 | 分类前缀：INFO / CONF / IDNT / ATHN / ATHZ / SESS / INPV / INJT / ERRH / CRYP / BUSL / CLNT / APIT |
| WSTG-ATHN | 认证测试 | 弱口令、枚举、锁定、找回密码 |
| WSTG-SESS-10 | 会话测试（JWT） | 令牌校验类 |
| WSTG-ERRH-02 | 错误处理测试 | fail-open 归属此类 |
| ASVS | 应用安全验证标准 | L1/L2/L3 |
| MASVS | 移动应用安全验证标准 | 六域见 G 节 |
| MASTG | 移动安全测试指南 | MASVS 的配套测试项 |
| OWASP API Security Top 10 2023 | API 安全十大风险 | API1–API10，见 B/D 节 |
| OWASP LLM Top 10 2025 | 大模型应用十大风险 | LLM01–LLM10 |
| OWASP Agentic Top 10 2026 | 智能体十大风险 | ASI01–ASI10 |
| OWASP Agentic Skills Top 10 | 智能体技能十大风险 | AST01–AST10 |
| CWE / CWE Top 25 | 通用缺陷枚举 / 前 25 | 编号见 C 节 |
| CVE | 通用漏洞披露 | 具体漏洞编号 |
| CVSS 3.1 / CVSS 4.0 | 通用漏洞评分系统 | 向量度量 AV/PR/UI/S/C/I/A |
| EPSS | 漏洞利用预测评分 | 概率，非严重度 |
| CISA KEV | 已知被利用漏洞目录 | 收录即高危 |
| STRIDE | 六类威胁建模 | Spoofing/Tampering/Repudiation/Info leak/DoS/Elevation |
| CIS Benchmarks | CIS 配置基线 | 配置项核对 |
| MITRE ATLAS | AI 系统对抗威胁知识库 | 战术分层 |
| NIST AI 100-2 E2025 | 对抗性机器学习分类 | 三分类 |
| CSA MAESTRO | 多智能体威胁建模 | 七层 |
| RoE | 测试授权约定 | 目标/时间窗/速率/禁止动作 |
| 等保 / 个保法（PIPL） | 合规面向 | 合规影响表述 |
| DFD | 数据流图 | 入口到存储的变换节点 |
| SBOM | 软件物料清单 | 依赖清单 |
| ASR | 攻击成功率 | AI 护栏判定基线，非单个模型指标 |
| Pass / Fail / N/A / NOT ASSESSED | 基线核对结论 | 未覆盖不得默认通过 |

### B. 漏洞类型 · 攻击手法（服务端）

| 术语 | 中文 | 备注 |
|---|---|---|
| SQLi / NoSQL Injection | SQL / NoSQL 注入 | NoSQL 对象操作符 `$gt` 绕过 |
| Blind SQLi / time-based / OOB | 盲注 / 时间型 / 带外 | `SLEEP(10)`、DNS 回连 |
| Second-order Injection | 二阶注入 | 先存后取再拼进查询 |
| OS Command Injection | 命令注入 | `;id` |
| SSTI / CSTI | 服务端 / 客户端模板注入 | `{{7*7}}`、`${7*7}` |
| SpEL / OGNL / MVEL | 表达式注入 | Java 生态 |
| LDAP / XPath Injection | 目录 / XPath 注入 | — |
| CRLF / HTTP Response Splitting | 响应拆分 | 头注入 |
| Log Injection / CSV Injection | 日志 / CSV 公式注入 | 表格公式执行 |
| SSI / LaTeX Injection | 服务端包含 / LaTeX 注入 | 解析类 |
| ORM raw SQL / ORM Leak | ORM 原生 SQL 拼接 / ORM 信息泄露 | 前者已落卡，后者候选 |
| Insecure Deserialization | 不安全反序列化 | `readObject` / `unserialize` / `pickle` / JSON 多态 / YAML |
| gadget chain | 利用链 | Commons-Collections / Fastjson |
| Java RMI | Java 远程方法调用 | 反序列化入口 |
| Path Traversal / Zip Slip | 路径穿越 / 解压路径穿越 | `../`、绝对路径、UNC、符号链接 |
| Client-side Path Traversal | 客户端路径穿越 | 候选池 |
| XXE / XEE / billion laughs | 外部实体 / 实体膨胀 | 解析类 |
| XSLT / schema external reference | XSLT / schema 外部引用 | 解析类 |
| IDOR / BOLA / BFLA | 越权 / 对象级 / 功能级授权缺失 | 水平与垂直越权 |
| Mass Assignment | 批量赋值 | CWE-915；`role` / `is_admin` / `tenant_id` |
| BOPLA / BOLA (property) | 属性级授权 / 过量数据暴露 | OWASP API3 |
| field-level authorization | 字段级鉴权 | GraphQL resolver 内常见漏检 |
| tenant scoping | 租户范围限定 | 缺失即跨租户 IDOR |
| Race Condition / TOCTOU | 竞态 / 检查与使用时间差 | 双花、超额、状态错乱 |
| Transaction isolation level | 事务隔离级别 | 竞态判据 |
| State-machine skip | 状态机跳跃 | 跳过支付 |
| Callback replay | 回调重放 | 支付/通知 |
| Precision overflow | 精度溢出 | 资金类 |
| ReDoS | 正则灾难性回溯 | 三判据：嵌套量词 + 输入可控 + 无长度上限 |
| Type Juggling | 类型松散比较 | PHP `"0e…"` 魔法哈希；PHP 8 起 `"1abc"==1` 为 false |
| Prototype Pollution | 原型链污染 | `__proto__` / `constructor.prototype` |
| UAF / OOB | 释放后使用 / 越界 | 内存类 |
| fail-open | 失败即放行 | 鉴权吞异常、限流器后端不可达放行 |
| Open Redirect | 开放重定向 | CWE-601；解析后比对而非前缀匹配 |
| Host Header Injection | Host 头注入 | 污染绝对 URL 与缓存键 |
| CORS Misconfiguration | CORS 通配 | 与 Public Access ACL 并列 |
| SSRF | 服务端请求伪造 | `169.254.169.254`、gopher/dict/file |
| DNS rebinding | DNS 重绑定 | SSRF 白名单绕过 |
| IMDSv1 / IMDSv2 | 云元数据服务 | 配合 SSRF 取临时凭据 |
| HTTP Request Smuggling | 请求走私 | CL.TE / TE.CL / TE.TE |
| HTTP/2 downgrade | HTTP/2 降级 | 前后端解析差异 |
| Response-queue desync | 响应队列错位 | 走私判定信号 |
| Web Cache Deception / Poisoning | 缓存欺骗 / 缓存投毒 | unkeyed 头 `X-Forwarded-Host` / `-Scheme` |
| HPP | HTTP 参数污染 | 重复参数 |
| WAF bypass | WAF 绕过 | URL/Unicode/双重编码、chunked、HPP |
| Unicode normalization NFC / NFKC | Unicode 归一化与形近字 | 本轮新落卡 |
| Clickjacking | 点击劫持 | `X-Frame-Options` / CSP `frame-ancestors` |
| DOM Clobbering | DOM 覆盖 | `id`/`name` 覆盖全局对象 |
| Reverse Tabnabbing | 反向标签劫持 | `window.opener` 缺 `noopener` |
| postMessage origin check | 消息来源校验 | 客户端面 |
| WebSocket handshake auth | 握手鉴权 | 客户端面 |
| CSS Injection | CSS 注入 | 客户端面 |
| DOM sink / JS execution sink | DOM 执行汇点 | `eval` / `innerHTML` / `document.write` |
| XSS: Reflected / Stored / DOM | 反射 / 存储 / DOM 型 XSS | CWE-79；`location.hash`、`javascript:` 协议 |
| XSSI | 跨站脚本包含 | 候选池 |
| SAML XSW / signature stripping | 签名包裹 / 签名剥离 | 单点登录 |
| OIDC assertion | OIDC 断言 | `aud`/`iss`/`alg`/`nonce` |
| JWT alg:none / algorithm confusion | 算法置空 / RS256→HS256 混淆 | 公钥当 HMAC 密钥 |
| JWT kid / jku / x5u | 密钥标识 / JWK 集 URL / X.509 URL 头 | 本轮新落 `jku` / `x5u` |
| PKCE downgrade | PKCE 降级 | OAuth |
| redirect_uri bypass | 回调地址匹配绕过 | OAuth |
| Session Fixation / Session Puzzling | 会话固定 / 会话混淆 | 会话类 |
| Session ID rotation / Remember-Me | 会话 ID 轮换 / 记住我 | 会话类 |
| Account Takeover (ATO) | 账号接管 | 重置密码 Host 头投毒、OAuth 绑定劫持 |
| Password spraying / credential stuffing | 口令喷洒 / 撞库 | 认证类 |
| User enumeration | 用户枚举 | 响应差异与时序 |
| HTTP Verb Tampering | HTTP 方法篡改 | WSTG 类目 |
| Feature Flag Bypass | 功能开关绕过 | 配置类 |
| BOLA via cache key | 缓存键越权 | 共享状态类 |
| kill chain | 攻击链 | 低危点串联 |

### C. CWE 编号（卡库已引用）

| 编号 | 含义 | 落点 |
|---|---|---|
| CWE-79 | XSS | sec-audit-31 |
| CWE-94 | 代码生成控制不当（Actions 表达式插值进 `run:`） | sec-audit-14 |
| CWE-208 | 时序侧信道（应用 `hmac.compare_digest`） | sec-audit-39 |
| CWE-308 | 单因素/未重新验证（step-up MFA） | sec-audit-40 |
| CWE-338 | 弱伪随机数 | sec-audit-39 |
| CWE-345 | 客户端可读的会话状态可伪造 | sec-audit-07 |
| CWE-384 | Session Fixation 变体 / session id 不是凭据 | sec-audit-16 |
| CWE-441 | confused deputy（令牌透传） | sec-audit-16 |
| CWE-601 | 开放重定向 | sec-audit-30 |
| CWE-613 | 会话/令牌未失效（refresh token 重放） | sec-audit-40 |
| CWE-74 | 注入族（工具输出回灌模型） | sec-audit-16 |
| CWE-778 | 审计日志缺失（actor vs effective_user） | sec-audit-40 |
| CWE-79 | 见上 | — |
| CWE-913 | 动态管理代码资源控制不当（`pull_request_target`） | sec-audit-14 |
| CWE-915 | 自动绑定写越权字段 | sec-audit-22 |
| CWE-916 | 口令哈希强度不足（cost factor） | sec-audit-39 |
| CWE-1240 | 自研/不安全密码学套件 | sec-audit-39 |
| CWE-1336 | SSTI（用户输入当模板源） | sec-audit-22 |
| CWE-1357 | 依赖未固定到可信版本（action 未锁 commit SHA） | sec-audit-14 |

> CWE-79 重复行是编号表的自然结果，卡库内只引用一次。

### D. 认证 · 会话 · 令牌字段

`AuthN` / `AuthZ`（认证与授权分离）、`bcrypt` / `Argon2id` / `scrypt` + `cost factor`、`hmac.compare_digest`、`IV/nonce reuse`、`ECB`、`PRNG`、`TLS weak cipher suite`、`claims` (`role` / `sub` / `aud` / `iss` / `exp` / `nonce` / `alg`)、`refresh token rotation` / `replay detection`、`step-up authentication`、`actor` vs `effective_user`、`MFA`、`DPAPI`、`STS` / `IAM policy escalation`、`presigned URL`、`object storage ACL`、`K8s RBAC` / `Secret mount`、`container escape`。

### E. 云 · 内网 · 供应链 · CI-CD

`Kerberoasting` / `AS-REP Roasting` / `Timeroasting`、`LLMNR` / `NBT-NS` / `mDNS poisoning`、`NTLM Relay`、`ADCS ESC1–ESC15`、`Golden Certificate`、`delegation`（unconstrained / RBCD / S4U / Bronze Bit）、`relay-coerce`、`shadow credentials`、`gMSA` / `dMSA` / `LAPS`、`AMSI` / `EDR bypass`、`LOLBins`、`IOC`、`MDT` / `SCCM` / `SCOM` / `WSUS`、`lockfile`、`EOL`、`typosquatting`、`dependency confusion`、`Poisoned Pipeline Execution`、`GitHub Actions` / `GitLab CI` / `Azure DevOps`、`pull_request_target`、`install scripts`、`AWS IMDS` / `Cognito` / `S3` / `SSM`、`Azure KeyVault` / `Intune`、`CDN origin` / `WAF virtual patch`。

### F. AI · LLM · Agent

`Prompt Injection`（直接 / 间接）、间接注入三形态（PDF 白字、HTML 注释、图像隐写）、`LLM01` / `LLM05` / `LLM06` / `LLM07` / `LLM08` / `LLM10`、`RAG` 跨租户检索 / `vector store poisoning`、`tool privilege escalation`、`system prompt leakage`、`unbounded consumption`、`denial-of-wallet`、`ASR`（200 次尝试约 78.6% 突破 / 10 次约 50%）、`adaptive attack` 对已发表提示级防御绕过率 >90%、`guardrail outside the model`、`confused deputy`、`session id is not a credential`、`parameter schema enforced server-side`、`tool output re-ingestion`、`deterministic authorization`、`least autonomy`、`MCP`、`ASI01–ASI10`、`AST01–AST10`（skill 注册表投毒、manifest 签名 `ed25519`、权限范围最小化）、`MITRE ATLAS` 战术分层、`NIST AI 100-2 E2025` 三分类、`CSA MAESTRO` 七层。

### G. 客户端 · 移动端 · 解析

`MASVS-STORAGE` / `-CRYPTO` / `-AUTH` / `-NETWORK` / `-PLATFORM` / `-CODE`、`certificate pinning`、`Frida` / `objection`、`exported component` / `ContentProvider`、`WebView JS bridge`、`deep-link hijacking` / `URL scheme`、`keystore`、`biometric bypass`、`debuggable build`、`sourcemap` / `webpack chunk`、`bundle`、`contextBridge` / `preload` / `session partition (persist:)`、`setPermissionCheckHandler` / `setPermissionRequestHandler`、`DSI`、`Electron`、`localStorage plaintext token`、`CSP frame-ancestors`、`Cross-Origin-Opener-Policy`、`noopener`。

### H. 定级 · 度量 · 统计

`Critical → Info` 分级、`[已验证]` / `[高置信]` / `[待验证]`、`Exploitable` / `needs preconditions` / `theoretical`、`runtime observation`、`static ceiling`、`reachability argument`、`severity ceiling`、`CVSS 3.1 vector (AV/PR/UI)`、`CVSS 4.0`、`EPSS`、`CISA KEV`、`exposure window`（泄露时间窗，轮换 ≠ 撤销）、`≥2σ`、交错采样 / 均值 / 标准差、`nonce marker`（8 位以上随机标记）、`per-sink subdomain`、`response-body diff`、`≥10 alternating requests`、`[to verify]` / `NOT ASSESSED`。

### I. 方法 · 工具 · 协议名

`SAST` / `DAST`、`threat modeling` / `trust boundary` / `attack surface`、`source→sink` / `taint propagation` / `sanitizer`、`minimal PoC`、`regression test`、`attack surface mapping`、`Asset Discovery` / `CT logs` / `shadow asset`、`Burp project` / `HAR`、`Arjun`、`hashcat`、`interactsh` / `Collaborator` / `DNSLog`、`OOB`、`CSP` / `CORS` / `HSTS`（作为配置项名）、`SPF` / `DKIM` / `DMARC`、`wildcard DNS` / `CNAME dangling` / `subdomain takeover`、`Transfer-Encoding` / `chunked`、`gopher` / `dict` / `file` 协议链、`HTTP/2 multiplexing` / `single-packet multi-request`、`introspection` / `field suggestion` / `depth & complexity DoS` / `batch & alias`。

### J. 工具调用术语（内部机制层）

前九节收的是「叫什么」，J.8 收的是「怎么敲」。**J.1–J.7 收的是调用工具时真正要说清的东西：用哪个 API、返回什么对象、核对哪个字段或枚举、以及哪一层结果不可信。**

只写快捷键或命令行，模型仍会把伪代码、反汇编与运行时观测混成一层证据；写清调用层，指令才能落到可核对的对象上。例如「用 IDA 看引用」是空的，`idautils.XrefsTo(ea) → xrefblk_t`，按 `.type` 的 `fl_CN`/`fl_CF` 区分普通调用与远调用、`dr_R`/`dr_W` 区分读写，才是可核对的指令。

#### J.1 IDA / Hex-Rays：SDK 对象与反编译器层级

| 调用 | 返回 / 对象 | 要核对什么 |
|---|---|---|
| `ida_bytes.get_wide_byte(ea)` / `patch_byte` | 原始字节 | IDA 是否把数据误标成代码 |
| `ida_ua.decode_insn(insn, ea)` | `insn_t` / `op_t` | 操作数类型 `o_reg` / `o_mem` / `o_phrase` / `o_displ` / `o_imm` / `o_near` |
| `ida_funcs.get_func(ea)` | `func_t` / `range_t` / `func_tail_t` | 函数边界、`chunked function` / `thunk` 误判 |
| `idautils.XrefsTo(ea, flags)` / `XrefsFrom` | `xrefblk_t` | `.type`：`fl_CN` 普通调用 / `fl_CF` 远调用 / `fl_JN` / `fl_JF` 跳转 / `dr_R` 读 / `dr_W` 写 / `dr_O` 偏移 |
| `ida_xref.add_cref` / `add_dref` | — | 补上间接调用造成的引用断链 |
| `ida_hexrays.decompile(ea)` | `cfunc_t` / `hexrays_failure_t` | 失败原因；`sp-analysis failed`、`positive sp value` 时伪代码不可信 |
| `cfunc_t.body` / `ctree` | `cinsn_t` / `cexpr_t` / `citem_t` / `cot_*` | 表达式树结构，别把 F5 的文本当结构 |
| `ctree_visitor_t` / `ctree_parentee_t` | `visit_insn` / `visit_expr` | 遍历改写时保留父节点上下文 |
| `cfunc_t.lvars` / `set_lvar_type` | `lvar_t` / `lvar_uservec_t` / `tinfo_t` | 类型传播结果，核对 `is_stk_var` / `is_reg_var` |
| `gen_microcode()` | `mba_t` / `mblock_t` / `minsn_t` / `mop_t` | **下沉到微码**：伪代码与汇编冲突时以 microcode 为准 |
| `mop_d` / `mop_S` / `mop_v` / `mop_a` / `mop_r` / `mop_n` | 微码操作数种类 | 区分寄存器、栈变量、全局、立即数 |
| `MMA_*` 成熟度 / `vd` / `optblock_t` | 优化 pass 阶段 | 决定哪一层 IR 可比对 |
| `ida_typeinf.apply_cdecl` / `apply_type` / `get_idati()` | `til` 类型库 / local types | 签名套用与结构体还原 |
| `ida_struct` / `ida_enum` / `ida_frame.get_frame` | `struc_t` / `member_t` / 栈帧结构 | 栈变量偏移与参数区 |
| `ida_netnode` | `netnode` / `supval` / `altval` / `blob` | IDB 内部元数据，不被 `get_bytes` 覆盖 |
| `ida_segment.getseg` | `segment_t` / 段权限 | 段属性、`extern` 与 `HEADER` 段 |
| `ida_name.set_name` / `get_name_ea_simple` / `ida_auto.plan_and_wait` | 命名与重分析队列 | `auto_mark_range` 后要等分析完成再取结果 |
| `FLIRT` / `FLAIR` / `.pat` / `.sig` / `sigmake` / Lumina `pull_metadata` | 库函数识别 | 静态链接里 libc / CRT 的已知函数 |
| `idaapi.plugin_t` / processor module `ph` / `ida_loader` | 扩展入口 | `IDC` 与 `IDAPython` 的能力边界 |
| `switch_info_t` / jump table / `JUMPOUT` | 间接跳转恢复 | 跳转表未识别时伪代码会丢分支 |

> 反编译证据层级：**原始字节 → `insn_t` 反汇编 → `mba_t` 微码 → `ctree` 伪代码**。下层与上层冲突时信下层，且要在结论里写明是哪一层给的证据。

#### J.2 Ghidra / P-code / Sleigh

- **Sleigh 规格**：`.slaspec` / `.sinc` / `token` / `field` / `constructor` / `disassembly action` / `semantic section` / `attach variables` / `space` 定义。
- **P-code 对象**：`Varnode` / `PcodeOp` / `AddressSpace` / `unique space` / `constant space` / `register space` / `ram space`；`seqnum`（含 `time` 与 `order`）。
- **常用 opcode**：`COPY` / `LOAD` / `STORE` / `BRANCH` / `CBRANCH` / `CALL` / `CALLIND` / `RETURN` / `INT_ADD` / `INT_SUB` / `INT_AND` / `INT_LESS` / `INT_ZEXT` / `INT_SEXT` / `BOOL_NEGATE` / `PIECE` / `SUBPIECE`。
- **Decompiler API**：`DecompInterface.decompileFunction` → `DecompileResults.getHighFunction` → `HighFunction` / `HighVariable` / `HighSymbol` / `HighParam` / `VarnodeAST` / `PcodeOpAST` / `BlockGraph`；核对 `Varnode.isConstant` / `isRegister` / `isUnique` 与 `HighVariable.storage` / `dataType`。
- **程序模型**：`Program` / `Listing` / `FunctionManager` / `SymbolTable` / `DataTypeManager` / `AddressFactory` / `MemoryBlock`。
- **批处理与扩展**：`HeadlessAnalyzer` / `analyzeHeadless` / `GhidraScript` / `FlatProgramAPI` / `Analyzer` / `DataTypePropagator` / `DecompilerParameterId` / `analysis options` / `variable recovery`。

#### J.3 调试器与运行时插桩机制

- **`ptrace` 调用族**：`PTRACE_ATTACH` / `PTRACE_PEEKTEXT` / `PTRACE_POKETEXT` / `PTRACE_GETREGS` / `PTRACE_SETREGS` / `PTRACE_SINGLESTEP` / `PTRACE_SYSCALL` / `PTRACE_CONT` / `PTRACE_DETACH`；配套 `waitpid` / `WIFSTOPPED` / `SIGTRAP`。
- **断点机制**：`INT3` / `0xCC` 软件断点、硬件断点 `DR0–DR3` + `DR7` L/G 位 + `DR6` 状态、`TF` 单步标志、页保护断点 `mprotect` / `VirtualProtect` / `PAGE_GUARD`、`SIGSEGV` 处理。
- **进程内存**：`/proc/<pid>/maps` / `/proc/<pid>/mem` / `process_vm_readv` / `process_vm_writev` / `vm_area_struct`。
- **链接与 hook**：`LD_PRELOAD` / `dlsym(RTLD_NEXT)` / `LD_AUDIT` / `link_map` / `r_debug` / `dl_iterate_phdr`；`GOT`/`PLT` 覆写、`IAT`/`EAT` hook、`inline hook` + `trampoline` + `detour`、`MinHook` / `Dobby` / `ShadowHook`。
- **Frida Gum**：`Interceptor.attach` / `replace` / `NativeFunction` / `NativeCallback` / `Stalker.follow` / `Stalker.transform` / `GumInvocationContext` / `GumEvent` / `Memory.scan` / `Memory.protect` / `Module.enumerateRanges` / `Arm64Writer` / `X86Writer`。
- **DBI / 模拟 / 反汇编框架**：`DynamoRIO` / `Intel PIN` / `QEMU TCG` / `Unicorn Engine` / `Capstone` / `Keystone` / `LLVM MC`；`Binary Ninja` 的 `LLIL → MLIL → HLIL → SSA` / `BinaryView` / `AnalysisContext` / IL lifting。
- **Windows 例外与遥测**：`VEH` / `SEH` / `KiUserExceptionDispatcher` / `ETW` / `AMSI` `AmsiScanBuffer` patch / `ntdll` syscall stub / `SSN` / `Hell's Gate` / `Halo's Gate` / `direct syscall` / `indirect syscall`。

#### J.4 符号执行 / SMT / 程序分析框架

- **符号执行**：`path predicate` / `fork` / `path explosion` / `state merging` / `veritesting` / `concretization` / `symbolic memory` / `lazy initialization`。
- **求解**：`SMT` / `SAT` / `Z3` `Solver` / `BitVec` / `Array` / `ForAll` / `simplify` / `unsat core` / `model` / `QF_BV` / `QF_AUFBV` / `bit-blasting`。
- **angr**：`Project` / `factory` / `SimState` / `SimulationManager` / `claripy.BVS` / `BVV` / `SimProcedure` / `hook` / `CFGFast` / `CFGEmulated` / `Veritesting` / `explore(find, avoid)` / `call_state` / `state.posix.dumps` / `SimFile` / `SimMemory` / `state.inspect`。
- **其它引擎**：`Triton` / `miasm` / `BAP` / `KLEE` / `S2E` / `SymCC` / `QSym`。
- **静态分析结构**：`AST` / `CFG` / `DFG` / `PDG` / `CPG`（Code Property Graph）/ `basic block` / `dominator tree` / `post-dominator` / `natural loop` / `SSA` / `phi node` / `reaching definitions` / `def-use chain` / `points-to` / `Andersen` / `Steensgaard` / `k-CFA` / `context sensitivity` / `interprocedural summary` / `VSA`（value set analysis）/ `strided interval` / `affine relation`。
- **CodeQL**：`TaintTracking::Configuration` / `isSource` / `isSink` / `isSanitizer` / `isAdditionalTaintStep` / `DataFlow::PathNode` / `DataFlow::PathGraph` / `path-problem` / `QL database` / `extractor` / `SARIF`。
- **Semgrep**：`pattern-sources` / `pattern-sinks` / `pattern-sanitizers` / `metavariable` / `metavariable-pattern` / `metavariable-comparison` / `taint mode` / `SARIF`。
- **Joern / LLVM**：`cpg.method` / `cpg.call` / `reachableBy` / `overflowdb`；`Module` / `Function` / `BasicBlock` / `Instruction` / `FunctionPass` / `mem2reg` / `DominatorTree` / `MLIR`。

#### J.5 反编译还原与混淆对抗

- **结构恢复**：`type propagation` / `VSA` / `affine relation` / `strided interval` / `jump table recovery` / `switch_info_t` / `indirect call resolution` / `vtable recovery` / `RTTI` / `.eh_frame` / `unwind info` / `LSDA` / `calling convention` / `prologue` / `epilogue` / `stack frame` / `sp-analysis failed` / `positive sp value`。
- **化简**：`constant folding` / `constant propagation` / `copy propagation` / `CSE` / `DCE` / `peephole` / `MBA`（mixed boolean-arithmetic）化简 / `symbolic simplification`。
- **混淆**：`control flow flattening`（CFF）/ `dispatcher` / `state variable` / `opaque predicate` / `bogus control flow` / `dead code insertion` / `instruction substitution` / `virtualization` / VM handler / `string encryption` / `import hiding`；`OLLVM` / `VMProtect` / `Themida`。
- **脱壳**：`packer` / `OEP`（Original Entry Point）/ `IAT rebuilding` / `dump` / `Scylla` / `ImportREC` / `esp 定律` / 栈上内存断点 / `section hopping`。
- **反调试**：`IsDebuggerPresent` / `NtQueryInformationProcess` / `TracerPid` / `RDTSC` 时序检查 / `INT3` 扫描 / `TLS callback`。

#### J.6 二进制利用原语与缓解机制

- **glibc heap**：`arena` / `malloc_state` / `mchunkptr` / `prev_size` / `size` / `fd` / `bk` / `fd_nextsize` / `bk_nextsize` / `tcache_entry` / `tcache_perthread_struct` / `fastbin` / `unsorted bin` / `smallbin` / `largebin` / `top chunk` / `last_remainder` / `unlink` / `consolidation` / `tcache poisoning` / `safe-linking` `PROTECT_PTR` / `house of *` / `__malloc_hook` / `__free_hook` / `_IO_list_all` / `FSOP` / `_IO_jump_t` vtable / `one_gadget`。
- **利用原语**：`ROP` / `JOP` / `COP` / `COOP` / `DOP` / `ret2libc` / `ret2csu` / `ret2dlresolve` / `SROP` / `sigreturn` / `stack pivot` / `GOT overwrite` / `partial overwrite` / `format string` `%n` / `arbitrary read/write` / `heap feng shui` / `heap grooming` / `type confusion`。
- **缓解机制**：`ASLR` / `KASLR` / `PIE` / `RELRO`（partial/full）/ `NX` / `DEP` / `W^X` / `stack canary` / `__stack_chk_fail` / `FORTIFY` / `CFI` / `shadow stack` / `CET` `IBT` / `SHSTK` / `PAC` / `MTE` / `CFG`（Windows Control Flow Guard）/ `ACG` / `SafeSEH` / `SEHOP` / `SMAP` / `SMEP` / `seccomp` / `HVCI` / `DSE`。
- **内核**：`ioctl` / `IRP` / `MajorFunction` / `MmMapIoSpace` / `ProbeForRead` / `ProbeForWrite` / `copy_from_user` / `EPROCESS` / `token stealing` / `IDT` / `SSDT` / `MSR` / `SYSENTER` / `CR3` / `page table` / `EPT` / `SLAT` / `ObRegisterCallbacks` / `PsSetCreateProcessNotifyRoutine`。

#### J.7 平台运行时内部

- **Electron / V8**：`asar` header（pickle 编码 + JSON 目录）/ `app.asar.unpacked` / `node::Environment` / `V8 Isolate` / `Context` / `HandleScope` / `N-API` / native addon `.node` / `contextBridge` 的结构化克隆 / `ipcRenderer` / `ipcMain` / `MessagePort` / `preload` sandbox / `nodeIntegration` / `contextIsolation` / `sandbox` / `webSecurity` / `file://` origin / `--inspect-brk` / `NODE_OPTIONS` / `process.binding` / `BrowserWindow.webPreferences`。
- **Android / ART**：`libart.so` / `JNIEnv` / `RegisterNatives` / `ArtMethod` / `art::ClassLinker` / `DexFile` / `OAT` / `ODEX` / `VDEX` / Quick compiled code / `JIT` / `binder` / `seccomp` / `TracerPid` / `LSPlant` / `Dobby` / `Zygisk` / `Riru`。
- **Windows 原生**：`PEB` / `TEB` / `LdrLoadDll` / `InLoadOrderModuleList` / `IAT` / `EAT` / `delay import` / `TLS callback` / `.pdata` / `.xdata` / `unwind` / `SEH` / `VEH` / `ETW` / `AMSI` / `WLDP` / `minifilter`。

### J.9 重建语义 · 权威层级 · 工具陷阱（最深一层）

J.1–J.7 讲「调哪个 API、拿什么对象、读哪个字段」；这一层讲**这些对象是怎么算出来的、哪一层才是真相、以及工具会在哪骗你**。不掌握这层，模型会把伪代码当源码、把求解器的反例当结论、把桩函数当真实系统调用。

#### J.9.1 权威层级（冲突时信谁）

反编译 / 模拟产出的每层表示可信度不同；**下层是上层的事实来源，上层是下层的解释，不是相反**：

```
原始字节 → insn_t（反汇编，可靠） → mba_t / microcode（微码，CPU 实际执行语义，可靠）
                                            ↓  Hex-Rays 翻译（可错）
                                      cfunc_t（伪代码，是重建假设，不是事实）
```

- `insn_t`：按指令集解码的单条指令，是「能说什么被执行了」的下限，IDA 解码错极少见。
- `mba_t`：Hex-Rays microcode，把指令归一成寄存器传输中间表示；**这才是 CPU 真正执行的语义**，不受 C 语法糖、源码结构干扰。
- `cfunc_t`：由 `mba_t` 经 `gen_citers` + `mjst_*` 成熟度化简得到的类 C 伪代码。它是**解释不是事实**——化简越激进（`MMA_MAX`），越可能把等价但意图不同的结构合并掉，或把未识别的间接调用 / 栈别名当成「变量未使用 / 条件恒真」。
- 规则：**伪代码与反汇编 / 微码冲突时，信反汇编与微码**。这条本身就是证据层级判据，落在 `sec-audit-02`。

#### J.9.2 各工具会在哪骗你（失败模式）

- **Hex-Rays 伪代码可错**：`switch` 计算跳转表、`setjmp/longjmp`、C++ 异常 / RAII 展开、可变参数、自定义调用约定、未解析间接调用、控制流扁平化之后，会产出「看着合理但语义错」的伪代码。判据：凡涉及上述结构，回 `insn_t`/`mba_t` 复核，不把伪代码当源码引用。
- **IDA 栈帧错**：`sp-analysis failed` / `positive sp value` 表示栈指针分析失败，后续变量映射与参数识别全错。先 `Alt+K` 修 SP 或手动标 `stack frame`，再信变量。
- **Ghidra Sleigh / P-code**：P-code 是寄存器传输抽象，不是真实 ISA；冗余前缀、变长指令前缀可能被错分，要看真实语义回原生反汇编。
- **CodeQL `DataFlow`**：默认**不跨函数边界**流动，除非补 `isAdditionalTaintStep`；`isSanitizer` 会截断流；`path-problem` 必须实现 `PathNode`/`PathGraph` 才有路径证据；隐式流（控制依赖泄露，如 `if(secret) x=1`）默认不追踪。
- **符号执行（angr / Triton）**：`path explosion`（循环 / 递归爆炸）、`SimProcedure` 把 syscall 桩成不建模内核行为的 stub、`concretization` 丢覆盖、`claripy` 只追你标成 taint 的变量，控制依赖的隐式流需手动加 `isAdditionalTaintStep`。
- **`ptrace` 调试**：单步是 O(指令) 慢、追不到自修改代码、不加 `PTRACE_O_TRACECLONE` 不跟 `clone`/线程、目标检测到 `PTRACE_ATTACH` 直接退出（反调试）。
- **Frida `Interceptor.attach`**：只 Hook 经该函数的调用，attach 之前已跑过的检查看不到；原生反 Frida（`/proc/self/maps` grep、`pthread_create` 检测、`frida-server` 端口探测）可绕过它。
- **求解器（Z3）**：`simplify` 做理论感知重写；`model()` 给的是**一个**可满足赋值，不是唯一解，不能据「解存在」推断「这是实际输入」；`unsat` 只在你建模的范围内成立。

#### J.9.3 内部算法（知其盲点）

- **Hex-Rays**：`mba_t` 经 `gen_citers` 生成 `ctree`，再 `mjst_*` 做常量传播 / CSE / DCE；`MMA_*` 标记 microcode 成熟度，低成熟度意味着还有未化简分支。
- **CodeQL**：先建 CPG，再对 `DataFlow` 边跑 Datalog 不动点；`TaintTracking::Configuration` 本质是带 `isSource`/`isSink`/`isSanitizer` 边过滤的可达性查询。
- **angr**：`CFGEmulated` 用 unicorn 单步出较准 CFG（慢），`CFGFast` 线性扫描快但不准；`explore(find, avoid)` 是在 SimState 上做图搜索。
- **Z3**：`BitVec` 定宽、`Array` 建模内存、`QF_BV` 位向量理论、`unsat core` 给导致不可满足的最小约束集。

### J.8 表层入口动作（快捷键与命令行）

以下是**入口层**操作，只说明「怎么敲」，不涉及工具内部对象；调用层术语见 J.1–J.7。标准写法：**工具名 + 具体指令 + 要看的输出**，避免只写「用 IDA 分析」这种没有动作的表述。

**IDA Pro / Hex-Rays**

| 指令 | 动作 | 看什么 |
|---|---|---|
| `F5` | Hex-Rays 反编译伪代码 | 参数类型、返回值流向 |
| `Shift+F12` | Strings 窗口 | 硬编码口令、URL、错误串、格式化串 |
| `Ctrl+X` | xrefs to（交叉引用） | 谁引用了这个字符串/函数，回溯调用点 |
| `Alt+T` / `Alt+B` | 文本 / 字节序列搜索 | 指令特征、常量、shellcode |
| `N` | 重命名函数或变量 | 让后续跳表可读 |
| `Y` | 设置变量或函数类型 | 修正被识别成 `int` 的指针/结构体 |
| `G` | 跳转到地址 | 从日志/崩溃地址回到代码 |
| `Space` | 图形 / 文本视图切换 | 分支与循环结构 |
| `F2` / `F7` / `F8` / `F9` | 下断 / 步入 / 步过 / 运行 | 运行时寄存器与栈 |
| `IDAPython` | `idautils.XrefsTo()`、`ida_hexrays.decompile()`、`idc.get_name_ea_simple()` | 批量导出跳表、自动标注 |
| `FLIRT` / `Lumina` | 库函数识别 / 云端签名 | 剥离静态链接的 libc 等已知函数 |
| `IDB` / `.i64` | 分析数据库 | 保存重命名与注释成果 |
| `Imports` / `Exports` / `Names` / `callgraph` / `stack frame` | 视图与结构 | 攻击面清单、调用关系、栈布局 |

**Ghidra**：`CodeBrowser`、`Decompiler`、`Defined Strings`、`References → Show References to`、`analyzeHeadless`（-import / -postScript）、`Ghidra Script`（Java / Jython）。

**gdb / pwndbg / gef**：`break *0xADDR`、`run` / `continue`、`ni` / `si`、`x/20gx $rsp`、`info registers`、`disassemble`、`cyclic 200` / `cyclic -l`、`checksec`、`vmmap`、`telescope`、`rop`、`set follow-fork-mode child`、`set disable-randomization on`。

**pwntools**：`process()` / `remote()`、`ELF()` / `ROP()`、`p64()` / `u64()`、`sendlineafter()` / `recvuntil()`、`gdb.debug()`、`asm()` / `shellcraft`、`context.arch` / `context.log_level`。

**ELF / binutils**：`file`、`readelf -h` / `-S` / `-s` / `-r`、`objdump -d -M intel`、`nm -D`、`strings -a`、`ldd`、`strace -f` / `ltrace`、`patchelf --set-interpreter`；结构名 `GOT` / `PLT`、`RPATH` / `RUNPATH`、`RELRO` / `NX` / `PIE` / `STACK CANARY` / `FORTIFY`。

**radare2 / rizin**：`r2 -A`、`aaa`、`afl`、`s sym.main`、`pdf @ main`、`izz`、`axt`、`V`、`/R`。

**Frida / objection**：`frida -U -f <pkg> -l hook.js --no-pause`、`frida-trace -U -i open <pkg>`、`Interceptor.attach()`、`Java.perform()`、`Module.findExportByName()`、`objection -g <pkg> explore`、`android sslpinning disable`。

**Android / Electron / 解包**：`jadx -d out app.apk`、`apktool d app.apk`、`dex2jar`、`adb shell`、`aapt dump badging`、`drozer`；`asar e app.asar out/`（`npx asar extract`）、`app.asar.unpacked`、`nodeIntegration` / `contextIsolation` / `contextBridge` / `preload`。

**SAST / 依赖**：`semgrep --config=auto .`、`codeql database create` / `analyze`、`trivy fs` / `trivy image`、`syft` / `grype`、`npm audit`、`pip-audit`、`dependency-check`。

**Burp / DevTools**：`Ctrl+R`（Send to Repeater）、`Proxy → Intercept`、`Intruder`、`Comparer`、`Export as HAR`、`sitemap`；`Ctrl+Shift+F`（全局搜索）、`Sources → Pretty Print`、`Network → Export HAR`、`source-map-explorer`、`webpack chunk`。

**HTTP / 网络 / 侦察**：`curl -i` / `-v` / `-X` / `-H` / `--data-binary` / `--path-as-is` / `-k` / `--proxy`；`tshark -r x.pcap -Y "http.request" -T fields`、`Follow TCP Stream`；`nmap -sS` / `-sV` / `-sC` / `-A` / `-Pn` / `-p-` / `--min-rate`；`ffuf -w params.txt -u "URL?FUZZ=1" -fs 0`、`arjun -u URL`、`feroxbuster`、`gf`、`sqlmap -r req.txt --batch`；`hashcat -m <mode>` / `john`。

**云 / 容器 / 其它**：`aws sts get-caller-identity`、`kubectl auth can-i --list`、`docker inspect`、`xxd -g1`、`binwalk -e`、`jq`、`git grep`。

> 收录原则：只写**可执行的动作名与命令**，不写工具的安装配置、不写任何针对具体对象的操作步骤。命令里的 `<pkg>` / `URL` 等只是占位写法。

---

## 三、覆盖实测（机器可查）

口径：把上表出现的术语（大小写不敏感）对 `src/data/preset/*.ts` 与 `src/data/preset/en/*.ts` 做全量字符串扫描，命中即视为「已落」。此前第四轮对 66 个目标术语实测覆盖 65/66，唯一缺口是 `NFC/NFKC` 归一化；本轮补上它，并消化了 4 组候选池术语，其余仍留第五节。

覆盖结果分三档写，避免把「出现在文档里」误算成「落在卡里」：

- **已落卡**：绝大多数术语已在中英双层正文或 tags 中出现（见 B/C 节标注的具体落点）。
- **本轮新落卡**：见第四节。
- **候选池**（已收集、未落卡）：见第五节，继续受 150 张定额与 160 字上限约束。

本轮改完后的逐项核查（`grep` 中英两层，正文或 tags 任一命中即计）：

| 术语 | 中文层 | 英文层 |
|---|---|---|
| `API2` / `API8` | ✓ `pentest-13` | ✓ `pentest-13` |
| `jku` / `x5u` | ✓ `pentest-11` | ✓ `pentest-11` |
| `NFC/NFKC` | ✓ `pentest-24` 正文 + tags | ✓ `pentest-24` 正文 + tags |
| `DOM sink` / `CSS 注入` / `localStorage` | ✓ `sec-audit-31` 正文 + `CSS 注入` tags | ✓ `sec-audit-31` 正文 + `CSS injection` tags |

扫描只检查字符串存在，**不校验语义**：某个术语出现在卡里不等于该卡真的把它讲透了。这层仍靠人工逐张读。

---

## 四、本轮新落卡（2026-11-04）

只把「前几轮已确认存在、但因字数挤出正文」的候选池术语补回去，**不动任何判据、不改卡片数量、不新增卡**。中英双层同步。

| 术语 | 落点 | 改法 |
|---|---|---|
| API2 Broken Authentication、API8 Security Misconfiguration | `pentest-13`「API 资产清单」 | 在 API9 / API10 后补两项，紧凑改写以留在 160 字内 |
| JWT `jku` / `x5u` | `pentest-11`「JWT 与令牌校验」 | `kid` 扩为 `kid/jku/x5u` 指向可控密钥材料 |
| Unicode 归一化 `NFC/NFKC` 形近字 | `pentest-24`「WAF 绕过验证」 | 并入编码混淆项，tags 同步 |
| DOM sink 枚举、CSS 注入、localStorage 明文令牌 | `sec-audit-31`「XSS 专项」 | 补在 scheme 白名单之后，压缩冗余措辞 |

`Reverse Tabnabbing`（`window.opener` / `noopener`）本轮**尝试过但未落卡**：`pentest-14` 现有正文已占满 160 字，实测最紧凑的改写仍为 169 字；再压缩就得删掉 `Clickjacking` 的 `X-Frame-Options` 或 `DOM Clobbering` 的 `id/name` 判据，属于用术语换术语、还削弱指导性，不划算。沿用前几轮的处理方式，留在第五节候选池等下一次换卡时再进正文。

---

## 五、候选池（已收集，未落卡）

以下术语已在来源中确认存在，本轮仍未单独成卡，留作后续替换备用。与 `2026-10-29-terminology-round3.md` 第六节的候选池口径一致。

- **WSTG-CLNT 剩余**：`local-storage` 敏感数据成条、`JS execution sink` 全量枚举、`CSTI` / `XSSI`
- **API 剩余**：API1（BOLA 已由其它卡覆盖，编号未逐条列）、API5（BFLA 同上）、API7（Server Side Request Forgery 已由 `pentest-34` 覆盖）
- **格式/解析**：`ORM Leak`、`Client-side Path Traversal`、`Reverse Tabnabbing`（`window.opener` / `noopener`，本轮因 160 字上限挤出）、`Unicode NFC/NFKC` 深层用例
- **Agentic**：`AST01–AST10` 逐条（skill 注册表投毒、manifest 签名 `ed25519`、权限范围最小化）、`MITRE ATLAS` 战术分层细化、`CSA MAESTRO` 七层逐层
- **令牌**：`jku` / `x5u` 的 JWK 集托管利用细节、`JWT` 的 `x5c` 链校验
- **其它**：`HTTP Verb Tampering`、`Session Puzzling`、`Incubated Vulnerability`、`Feature Flag Bypass` 独立成卡

替换判定标准沿用前四轮：**与现有卡语义重叠度最高、或最泛化（无动作）的卡优先被替换**。

---

## 六、纪律与边界

- 本仓库只收录**自己写的**术语整理与写法分析；第三方提示词原文一律不入库（`docs/research/agent-prompts/raw/` 已在 `.gitignore` 内，仅本地留存）。
- 术语整理不涉及提示词结构、任务树、输出分段、置信度模板等设计研究；那些属于另一类工作，不在本表范围内。
- 内容只取自公开标准与类目索引，不涉及任何具体目标或本地工作产物。
- 验证方式：`npm run test`（150 张定额、长度与唯一性、tags、变量登记、英译层覆盖与无中文、判据契约）、`npx tsc --noEmit`、`npm run build`。

---

## 七、操作术语落地（2026-11-04 补，同日第二轮重写）

### 第一轮（已作废）

先按「怎么敲」补过一批快捷键与命令行（`F5` / `ffuf -w` / `asar e`），落地 5 张卡。复核后判定**层级太浅**：只有入口动作，没说清调哪个 API、拿到什么对象、核对哪个字段，模型仍会把伪代码、反汇编与运行时观测混成一层证据。这批内容已降级为 J.8「表层入口动作」，仅作索引保留。

### 第二轮（现行）：调用层落地

把 3 张卡升级到**对象与字段级**，中英双层同步；另 2 张保留入口层动作，作为「表层 → 调用层」的对照。仍不增删卡片、分类配额不变。

| 卡 | 表层（第一轮） | 调用层（现行） |
|---|---|---|
| `sec-audit-02` 逐跳污点跳表 | `Shift+F12` / `Ctrl+X` / `F5` / `N` / `Y` | `idautils.XrefsTo` → `xrefblk_t`，按 `fl_CN`/`fl_CF` 分调用与跳转；`decompile()` → `cfunc_t` → `ctree`；伪代码与 `microcode` 冲突信下层 |
| `sec-audit-11` 静态→动态 | `semgrep --config=auto .` / `gdb` 下断 | `CodeQL DataFlow::PathNode` 从 `isSource` 追到 `isSink`；`ptrace(PTRACE_GETREGS)` 取寄存器、`SIGTRAP` 判命中 |
| `pentest-07` 保留原始证据 | `Ctrl+R` / `Export as HAR` / `tshark -r` | `IHttpListener` 抓原始字节、`HAR entries[].request/response` 字段级留痕、`tshark Follow TCP Stream` |
| `pentest-09` 参数侦察 | `arjun -u` / `ffuf -w ... -fs 0` | 保留入口层（本轮未升级） |
| `pentest-22` 泄露面扫描 | `asar e app.asar out/` | 保留入口层（本轮未升级） |

写法约束：

- 深术语进卡必须**带对象或字段**（`xrefblk_t` 的 `.type`、`cfunc_t` 的 `ctree`、`DataFlow::PathNode`），只列 API 名等于换个姿势堆名词。
- 保留原有命中与否证判据；新增的「伪代码与 microcode 冲突信下层」本身就是一条**证据层级判据**，不是装饰。
- 卡正文避开 `{...}`：`compose` 会把花括号内容当变量提取，未登记就测试失败（`entries[].request`、`ptrace(...)` 的方括号与圆括号不受影响）。
- 中英双限：中文 ≤160 字、英文 ≤480 字符。本轮 3 张中文改后最长 158 字，英文最长 468 字符。
- J.1–J.7 的整族术语（Ghidra/P-code、Frida Gum、angr/Z3、glibc heap、缓解机制、平台运行时）**只收进术语表**：每族都是完整专题，整族塞进单张卡只会变成没有动作的清单；但**单条机制判据可以落卡**，见第三轮。
- 「卡正文已顶到 160 字」这一说法只对第二轮改过的 5 张卡成立，不是全库结论。全库体检（150 张中文 + 150 张英文）显示：117 张中文卡还剩 ≥20 字余量，英文层普遍剩 200–340 字符。**不需要换卡腾配额**。

### 第三轮（本轮）：机制与陷阱层 + 落卡

第二轮的「对象 / 字段级」仍停在「调什么」；再深一层是「**这对象怎么算出来、哪层是真相、工具会在哪骗你**」，新增 **J.9 重建语义 · 权威层级 · 工具陷阱**。

J.9 的三块内容：

- **J.9.1 权威层级**：`原始字节 → insn_t（可靠）→ mba_t/microcode（可靠，CPU 实际执行）→ cfunc_t（重建假设，可错）`；规则是冲突时信下层，不把伪代码当源码。
- **J.9.2 失败模式**：逐一列出 Hex-Rays / IDA 栈帧 / Ghidra P-code / CodeQL DataFlow / 符号执行 / ptrace / Frida / Z3 各自会在哪骗人（计算跳转表、`sp-analysis failed`、不跨函数、path explosion、`PTRACE_ATTACH` 反调试、`/proc/self/maps` 反 Frida、`model()` 只给一个解等）。
- **J.9.3 内部算法**：Hex-Rays `gen_citers` + `mjst_*`、CodeQL CPG + Datalog 不动点、angr `CFGEmulated`/`CFGFast`/`explore`、Z3 `BitVec`/`Array`/`QF_BV`/`unsat core`，点明每家的盲点来源。

**本轮真正落卡 4 张**（不增删卡、不改既有判据、中英双层同步），把 J.9 的机制层压成可核对的否证判据，而不是只在文档里堆名词：

| 卡 | 语义落点 | 补进去的机制判据 | J.9 出处 |
|---|---|---|---|
| `sec-audit-19` 只报可验证结论 | 原本只管「代码要真读过」 | 反编译伪代码与求解器 `model` 只是重建假设，不是源码或运行时事实；冲突时回 `insn_t`/`mba_t` 微码或动态观测复核 | J.9.1 / J.9.2 |
| `sec-audit-06` 标注可利用性 | 原本只给三级分级 | 静态流不跨函数边界需补 `isAdditionalTaintStep`；符号执行的 `SimProcedure` 是桩、`path explosion` 会漏路径；**别把工具建模盲区写成阻断点** | J.9.2 |
| `pentest-02` 先自检我方环境 | 原本只管「工具故障别写成目标不存在」 | 插桩前查 `TracerPid` 与 `/proc/self/maps`，防反调试让 `Frida` 静默失效 | J.9.2 |
| `output-04` 证据与引用 | 原本只管「只归纳不下结论」 | 引用反编译结果须注明是 `cfunc_t` 伪代码层，不得当源码引用 | J.9.1 |

4 张卡各补一个工具术语 tag（`microcode` / `SimProcedure` / `Frida` / `cfunc_t`），界面按工具名可搜。落卡后全库体检：中文最长 160/160、英文最长 470/480，**0 超限**。

判定：J.9 的机制层已能落成「工具结果哪层可信、工具会在哪骗你」这类**否证判据**，这是它进 prompt 的正确形态；整族术语仍留 J 节备查。
