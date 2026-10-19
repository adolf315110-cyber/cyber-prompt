# 术语来源调研（2026-10-19 · 第二轮）

> 目的：给 150 张卡库做「术语密度强化」——把口语化描述替换/充实为行业标准术语（保留英文原名），让提示词对 AI 呈现专业信号。
> 配套：写法标准见 [2026-10-19-security-prompt-research.md](./2026-10-19-security-prompt-research.md)；本次只动术语，不新增/删除卡片（数量与结构保持 150 张）。
> 抓取通道：jsDelivr 镜像（`fastly.jsdelivr.net` / `data.jsdelivr.com`）+ GitHub 目录树（API 限流后改用 jsDelivr 数据接口）。

## 一、来源清单（6 个，均为术语高密度仓库）

| # | 仓库 | 提供了什么 | 抓取方式 |
|---|------|-----------|----------|
| 1 | [swisskyrepo/PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings) | 漏洞类目全表（63 个目录：ORM Leak、Type Juggling、DOM Clobbering、Zip Slip、XSLT/SSI/LaTeX Injection、CSV Injection、Client Side Path Traversal…） | jsDelivr 目录树 |
| 2 | [OWASP/wstg](https://github.com/OWASP/wstg) | WSTG 测试编号体系（INFO/CONF/IDNT/ATHN/ATHZ/SESS/INJT/ERRH/CRYP/BUSL/CLNT/APIT）+ 测试名（Session Puzzling、HTTP Verb Tampering、Host Header Injection、Incubated Vulnerability、Feature Flag Bypass…） | `checklists/checklist.md` |
| 3 | [HackTricks-wiki/hacktricks](https://github.com/HackTricks-wiki/hacktricks) | 方法论目录：网络协议攻击（LLMNR/NBT-NS/mDNS/WPAD spoofing+relay、Evil Twin、FragAttacks）、钓鱼手法（clipboard hijacking、homograph、AI agent abuse）、取证、Python sandbox escape | `src/SUMMARY.md` |
| 4 | [swisskyrepo/InternalAllTheThings](https://github.com/swisskyrepo/InternalAllTheThings) | 域/云/CI-CD 深目录：ADCS ESC1-15+Golden Certificate、Kerberoasting/AS-REP/Timeroasting、delegation（unconstrained/RBCD/S4U/Bronze Bit）、relay-coerce/NTLM/Kerberos、shadow credentials、gMSA/dMSA/LAPS、MDT/SCCM/SCOM/WSUS、AMSI/EDR bypass、DPAPI、CI-CD（GitHub Actions/GitLab/Azure DevOps）、AWS（IMDS/Cognito/S3/SSM）、Azure（KeyVault/DevOps/Intune） | jsDelivr 目录树（docs/ 全层级） |
| 5 | [Threekiii/Awesome-Redteam](https://github.com/Threekiii/Awesome-Redteam) | 中文红队术语体系：信息收集/权限维持/权限提升/凭据获取/防护规避/内网穿透/域渗透/内存马查杀/CMS-OA 漏洞/中间件序列化 | README 目录 |
| 6 | [OWASP/CheatSheetSeries](https://github.com/OWASP/CheatSheetSeries) | 辅助核对（README 为导航页，术语价值有限，仅作交叉验证） | README |

另有 GitHub API 无法直连的限制（未认证限流），改用 jsDelivr `data.jsdelivr.com/v1/packages/gh/<repo>@<branch>` 拿目录树，稳定可用。

## 二、本轮落卡的新术语（按卡定位）

安全审计（`src/data/preset/secAudit.ts`）：

- 01 信任边界：威胁建模、信任域
- 02/05/38 数据流：`source→sink`、sanitizer、DFD、Sink/Source
- 03/29/30 报告：CWE、Critical→Info 分级、最小 PoC、修复 diff、ASVS L1、WSTG、CWE Top 25
- 04/13 危险模式：readObject/unserialize/pickle、SpEL/OGNL/MVEL、SSTI、UAF/OOB、Insecure Deserialization、gadget chain、Commons-Collections/Fastjson 链
- 07 认证授权：AuthN/AuthZ、bcrypt/Argon2、Session Fixation、BOLA
- 08/28 文件：Path Traversal、Zip Slip、UNC、XXE、XEE/billion laughs、XSLT、schema
- 10 定级：CVSS 思路、BOLA
- 11 静态：SAST、过滤链
- 12 错误处理：fail-open、WSTG-ERRH-02
- 14 供应链：SBOM、lockfile、EOL、typosquatting、dependency confusion、CVSS
- 15 配置：Actuator、CORS 通配、Public Access ACL
- 16 修复：WAF 虚拟补丁、回归测试
- 17/36 越权：IDOR/BOLA/BFLA、水平/垂直越权、缓存键、幂等键
- 18 竞态：Race Condition/TOCTOU、事务隔离级别、双花
- 21 敏感数据：Secrets/PII、AK/SK
- 22 框架：Mass Assignment、SSTI、ORM 原生 SQL、@PreAuthorize
- 25 注入面：SQL/NoSQL、OS 命令、SSTI、LDAP、XPath、CRLF 响应拆分
- 26 局限：DAST
- 27 异步：MQ、schema 校验、死信队列、幂等
- 31/24 攻击链：kill chain、组合定级
- 34 异常信号：sourcemap、prod/staging 差异
- 35 LLM：OWASP LLM Top 10、Prompt Injection（含间接注入）、MCP、RAG 跨租户
- 37 日志：IP/UA、who/what/action、口令喷洒
- 39 密码学：PRNG、IV/nonce、TLS 弱套件、自研加密
- 40 会话：Remember-Me、Session ID 轮换

渗透测试（`src/data/preset/pentest.ts`）：

- 01/21 授权：RoE、应急联系人、持久化操作
- 02/14 复现：最小 PoC、双 HTTP 栈（curl/requests）、原始流量包
- 03 接口：bundle、sourcemap、webpack chunk、BOLA
- 04 噪音：口令喷洒层级
- 05 资产：Asset Discovery、CT 日志、影子资产
- 06 逻辑：业务逻辑漏洞
- 07 证据：Burp 工程、HAR
- 08 越权：IDOR/BOLA、Token、UUID 旁路泄露、类型变形（id[]=、id=1e3）
- 09 参数：Arjun、HPP
- 11 JWT：WSTG-SESS-10、算法混淆、hashcat、kid/JKU/X5U、claims role/sub
- 12 认证：WSTG-ATHN、用户枚举、Host 头投毒
- 13 影子 API：OpenAPI、GraphQL introspection、UA 降级
- 15 盲注：SQLi/SSTI、时间型 SLEEP(10)、OOB interactsh/Collaborator
- 16 上传：MIME/魔数、.user.ini/.htaccess、Nginx/Apache/IIS 解析链、图片马
- 17 内网：Kerberoasting/AS-REP Roasting、LLMNR/NBT-NS/mDNS、NTLM Relay、DPAPI
- 18 影响：PII、等保/个保法
- 19 云：STS/IAM、预签名 URL、IMDSv1/v2、K8s RBAC、Secret 挂载
- 20 域名：CT 日志、SPF/DKIM/DMARC、CNAME 悬挂
- 22 泄露：.svn/.DS_Store/.bak/.swp、GitHub 泄露凭据
- 24 WAF：Unicode/双重编码、chunked、HPP
- 25 走私：CL.TE/TE.CL/TE.TE、HTTP/2 降级、响应队列错位、请求劫持
- 27 竞态：Race Condition、单包多请求、HTTP/2 复用
- 28 缓存：Web Cache Deception/Poisoning、unkeyed 头（X-Forwarded-Host/Scheme）
- 30 评级：CVSS 3.1（AV/PR/UI）、CVSS 4.0
- 31 OAuth：redirect_uri 匹配绕过、state、PKCE 降级、nonce/iss/aud/alg
- 32 批量赋值：role/is_admin/tenant_id 字段差分
- 33 GraphQL：field suggestion、depth/complexity DoS、batch/alias
- 34 SSRF：IMDS、DNS rebinding、IPv4-mapped、gopher/dict/file、Collaborator
- 35 资金：精度溢出、状态机跳跃、回调重放
- 36/37 判定纪律：nonce 标记、分子域 OOB、diff 响应体
- 38 采样：均值/标准差 ≥2σ、交错采样
- 40 移动端：pinning、ContentProvider、WebView JS 桥、深链

输出格式（`src/data/preset/output.ts`）：output-07 升级为 CVSS 3.1 向量 + CVSS 4.0/EPSS 补充。

## 三、未落卡候选池（下轮替换备用）

以下术语已在来源中确认存在，但本轮受 150 张定额与 160 字上限约束未单独成卡，留作后续替换用：

- 专项缺口：XSS（反射/存储/DOM/CSTI/XSSI）、Open Redirect、Clickjacking、CORS Misconfiguration、SAML Injection、WebSocket、Host Header Injection、Session Puzzling、HTTP Verb Tampering
- 格式/解析类：ORM Leak、Type Juggling、DOM Clobbering、CSV Injection、SSI Injection、LaTeX Injection、Client-side Path Traversal、Reverse Tabnabbing
- 其他：Account Takeover、Insecure Randomness、ReDoS、Java RMI、Virtual Hosts、Hidden Parameters（已并入 pentest-09）

替换判定标准不变：与现有卡语义重叠度最高、或最泛化（无动作）的卡优先被替换。

## 四、验证方式（机器可查）

- `npm run test`：150 张定额、双类各 40 张、文本 ≤160、标题 ≤24、去标点后唯一、{变量} 登记齐全 —— 全绿
- 审计脚本（临时，已删）：全部文本 ≤156 字留余量、无重复、标题合规
- `npx tsc --noEmit` 与 `npm run build` 通过
