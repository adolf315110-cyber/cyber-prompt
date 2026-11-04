# 专业术语表（2026-11-04）

> **口径**：本仓库只**收集专业术语**——标准编号、漏洞类别、攻击手法、协议/字段/工具名、框架与基线名称。
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
