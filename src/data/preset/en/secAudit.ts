import type { CardI18n } from '../../../types'

/**
 * 安全审计 · 英文英译层（40 张）
 * - 键 = 原卡片 id；vars 的键 = 原(中)文变量名，值为英文变量名与默认值
 * - 约束（由 src/__tests__/presetCardsEn.test.ts 校验）：title ≤ 64 字符、text ≤ 480 字符、tags 2-4、标题与文本唯一
 */
export const SEC_AUDIT_EN: Record<string, CardI18n> = {
  'builtin:sec-audit-01': {
    title: 'Map trust boundaries first',
    text: 'Start with threat modeling and trust boundaries: list every external input (query/body/cookie/header, uploaded files, MQ messages and callbacks, env vars) and mark where each piece of data crosses a trust zone',
    tags: ['threat modeling', 'trust boundary', 'attack surface'],
  },
  'builtin:sec-audit-02': {
    title: 'Per-hop taint table',
    text: 'and explain each issue with a per-hop source-to-sink taint table: for every hop write location (file:line) | data shape | the check that hop should apply | the check it actually applies | verdict; then name the hop still unverified and mark it [to verify] instead of claiming it as proven',
    tags: ['taint analysis', 'sanitizer', 'per-hop table'],
  },
  'builtin:sec-audit-03': {
    title: 'Renderer injection and privileged surface',
    text: 'Renderer injection and privileged surface: for every sink - dangerouslySetInnerHTML, innerHTML, eval - mark whether its data source can be controlled externally; the contextBridge surface of the renderer holding that sink sets the impact, since reaching local IPC is equivalent to RCE; when an unsanitized third-party response lands in the DOM, you must add the missing hop "who controls that response" before it can be rated',
    tags: ['DSI', 'contextBridge', 'Electron'],
  },
  'builtin:sec-audit-04': {
    title: 'Language-specific dangerous patterns',
    text: '{language} dangerous-pattern review: reflection and dynamic invocation, deserialization entry points (readObject/unserialize, JSON polymorphism, YAML), expression injection (SpEL/OGNL/MVEL) and SSTI, unsafe memory ops (UAF/OOB); catastrophic regex backtracking counts as exploitable only when all three hold - nested quantifier, attacker-controlled input, no length limit',
    tags: ['dangerous patterns', 'SSTI', 'ReDoS'],
    vars: { 语言: { name: 'language', default: 'Java' } },
  },
  'builtin:sec-audit-05': {
    title: 'Data flow first',
    text: 'Start from a data-flow diagram (DFD): at every transform node between entry and storage, check that validation and encoding match (parameterized queries, allowlists, context-aware escaping, type and length constraints)',
    tags: ['data flow', 'DFD', 'input validation'],
  },
  'builtin:sec-audit-06': {
    title: 'Rate exploitability',
    text: 'and rate each suspicious point: directly exploitable / needs preconditions / theoretical — with the reasoning and the exact blocking check',
    tags: ['exploitability', 'rating'],
  },
  'builtin:sec-audit-07': {
    title: 'Audit AuthN and AuthZ separately',
    text: 'AuthN line: password hashing (bcrypt/Argon2), session fixation, expiry and lockout mechanisms, client-readable session state that is forgeable (CWE-345); AuthZ line: per-endpoint role check plus object-ownership check (BOLA) — compare findById(id) against findById(userId,id)',
    tags: ['AuthN', 'AuthZ', 'BOLA'],
  },
  'builtin:sec-audit-08': {
    title: 'File operation audit',
    text: 'File operation audit (Path Traversal/Zip Slip): do read/write/delete paths come from user input without normalization (../, absolute paths, UNC, symlinks, extraction paths)? Are upload name and storage path separated? Are temp files race-free?',
    tags: ['path traversal', 'Zip Slip', 'file ops'],
  },
  'builtin:sec-audit-09': {
    title: 'Provide a minimal PoC',
    text: 'and give a minimal PoC: the input or call sequence that triggers it, with the raw request, preconditions and expected vs actual result — so anyone can reproduce it independently',
    tags: ['minimal repro', 'PoC'],
  },
  'builtin:sec-audit-10': {
    title: 'Attacker model and reachability closure',
    text: 'Attacker model and reachability closure: for every finding write down who -> from where -> against whom, then check link by link that the entry point is reachable (exposed surface, channel registration, preload exposure, call site), that the preconditions can be met, and that the impact lands on someone else; if any link fails it is not a vulnerability, it only goes into the to-verify and negative-conclusion lists',
    tags: ['reachability', 'attacker model', 'closure'],
  },
  'builtin:sec-audit-11': {
    title: 'Static first, then dynamic',
    text: 'Start with a SAST pass to locate suspects (dangerous functions, string concatenation, config switches, dependency manifests), then verify dynamic reachability and filter chains — show evidence for each step separately',
    tags: ['SAST', 'dynamic verification'],
  },
  'builtin:sec-audit-12': {
    title: 'Failure paths and fail-open controls',
    text: 'and read the failure branch of every control: an auth check wrapped in try/catch that swallows and continues (except: return True is Critical), a rate limiter that lets traffic through when its store is unreachable, a feature flag defaulting to the permissive side — a control that fails open is off exactly during the outage an attacker triggers',
    tags: ['fail-open', 'error handling', 'failure branch'],
  },
  'builtin:sec-audit-13': {
    title: 'Deserialization deep dive',
    text: 'Deserialization review (Insecure Deserialization): list all {language} entry points (readObject, unserialize, pickle) and test the type controls, gadget chain reachability (Commons-Collections/Fastjson chains), and component versions vs known CVEs',
    tags: ['deserialization', 'gadget chain', 'CVE'],
    vars: { 语言: { name: 'language', default: 'Java' } },
  },
  'builtin:sec-audit-14': {
    title: 'Supply chain and pipeline audit',
    text: 'Supply-chain and pipeline audit: parse lockfiles for direct and transitive dependency versions, flag known CVEs (ID and CVSS), EOL components and typosquatting/dependency-confusion suspects; then check CI config — actions not pinned to a commit SHA (CWE-1357), pull_request_target executing PR code (CWE-913), GitHub Actions expressions interpolated into run: blocks (CWE-94)',
    tags: ['supply chain', 'CI/CD', 'CWE-1357'],
  },
  'builtin:sec-audit-15': {
    title: 'Unsafe platform defaults',
    text: 'Start with whether the platform defaults are themselves unsafe: orchestrator secrets only base64-encoded with no encryption provider, container images with no USER instruction running as root, caches and KV stores with authentication off until a password is set; also test the origin directly behind any WAF/CDN, whose rules mask source vulnerabilities',
    tags: ['config security', 'defaults', 'WAF'],
  },
  'builtin:sec-audit-16': {
    title: 'Agent and MCP server audit',
    text: 'and audit the agent/MCP server side (OWASP Agentic Top 10): token passthrough makes it a confused deputy (CWE-441), a session id is not a credential (CWE-384), tool argument schemas must be enforced server-side and reject unknown properties, tool output is a channel back into the model (CWE-74), and permission decisions must be deterministic — never ask a model',
    tags: ['MCP', 'Agent', 'ASI'],
  },
  'builtin:sec-audit-17': {
    title: 'Access control matrix',
    text: 'Access-control matrix (IDOR/BOLA): resources × actions × roles (anonymous/user A/user B/admin), cell by cell; a hit means the response body carries another user\'s object data — 403/404 proves nothing, retry with other paths, methods (GET→POST), encodings and parameter shapes (id[]=, id=1e3), and record a negative only when it still refuses',
    tags: ['access control', 'IDOR', 'BOLA', 'BFLA'],
  },
  'builtin:sec-audit-18': {
    title: 'Race condition check',
    text: 'Race-condition check (Race Condition/TOCTOU): for balance, stock, coupon and rate-limit state points verify lock granularity, transaction isolation and atomicity (read-then-write without a lock is suspect); test with concurrent same-value requests for over-issue or double spend',
    tags: ['race condition', 'TOCTOU', 'concurrency'],
  },
  'builtin:sec-audit-19': {
    title: 'Only verifiable findings',
    text: 'Verify before concluding: cited code must actually be read (file:line must be inside the file), never guess paths from "typical structure" or versions from framework folklore; label anything unverified as an assumption',
    tags: ['evidence', 'anti-hallucination', 'assumptions'],
  },
  'builtin:sec-audit-20': {
    title: 'Regression verification',
    text: 'and give a regression case for every fix: an executable unit/integration test or verification command (curl assertion, pytest), with the pass/fail criteria and one negative case',
    tags: ['regression', 'test case'],
  },
  'builtin:sec-audit-21': {
    title: 'Sensitive data and leak handling',
    text: 'Sensitive data inventory (Secrets/PII): where keys, tokens and personal data live — code, config, logs, caches, error pages, backups and egress (webhooks, email, analytics); once a secret is exposed, handle it by exposure window: rotation stops future use only, and access logs across the window still need review',
    tags: ['sensitive data', 'Secrets', 'leak response'],
  },
  'builtin:sec-audit-22': {
    title: 'Framework misuse audit',
    text: '{framework} misuse checklist: auto-binding writes fields the form never showed (Mass Assignment, CWE-915), user input compiled as the template source rather than passed as a value (SSTI, CWE-1336), user URLs in href/src without a scheme allowlist, ORM raw SQL concatenation, whether annotation auth (@PreAuthorize and similar) actually takes effect',
    tags: ['framework', 'Mass Assignment', 'CWE-915'],
    vars: { 框架: { name: 'framework', default: 'Spring' } },
  },
  'builtin:sec-audit-23': {
    title: 'Type and prototype boundaries',
    text: 'Check the two boundaries of type and prototype first: Type Juggling — under loose comparison "0e123"=="0e456" and "1abc"==1 both evaluate equal; Prototype Pollution — __proto__/constructor.prototype poisoning flips an isAdmin check; give the triggering input and the actual decision after poisoning for both',
    tags: ['Type Juggling', 'prototype pollution', 'boundaries'],
  },
  'builtin:sec-audit-24': {
    title: 'Chain findings together',
    text: 'and derive chains (kill chain): feed each low-severity finding into the next step (info leak→credential theft→BOLA→bulk export); note preconditions, required privileges and final impact per hop',
    tags: ['vulnerability chain', 'kill chain'],
  },
  'builtin:sec-audit-25': {
    title: 'Injection surface inventory',
    text: 'Injection surface inventory: SQL/NoSQL ($gt bypass), OS command, SSTI, LDAP, XPath, CRLF, log injection, CSV formula, SSI, ORM field concatenation, second-order injection (stored then re-concatenated); per site decide whether input reaches an interpreter — if it does, log a candidate and send a minimal probe (\', ", {{7*7}}, ;id), then confirm via reflection, error or time delay',
    tags: ['injection', 'CSV injection', 'second-order'],
  },
  'builtin:sec-audit-26': {
    title: 'Baseline AI guardrails',
    text: 'and baseline AI guardrails against the real attack surface: a single-shot prompt-injection success rate means nothing (about 78.6% breach over 200 attempts at roughly 50% over 10), published prompt-level defenses can be bypassed by adaptive attacks at over 90%, so guardrails and approvals must live outside the model — not in the prompt alone',
    tags: ['ASR', 'guardrails', 'LLM'],
  },
  'builtin:sec-audit-27': {
    title: 'Async pipeline audit',
    text: 'Async pipeline audit (MQ/schedulers): can producers be spoofed or messages injected (publish directly from a custom client)? consumer-side deserialization and schema validation, duplicate execution from retries/dead-letter queues, scheduler concurrency and authorization; proof = your own message actually triggers the side effect (order/notification/charge) — merely reaching the broker proves nothing',
    tags: ['message queue', 'idempotency', 'async'],
  },
  'builtin:sec-audit-28': {
    title: 'File parsing safety',
    text: 'File parsing safety: disable external entities in {dataFormat} (XXE), cap size and nesting depth (billion laughs/XEE), forbid XSLT and schema external references, make upload directories non-executable and guard extraction against Zip Slip',
    tags: ['XXE', 'Zip Slip', 'parsing'],
    vars: { 数据格式: { name: 'dataFormat', default: 'XML' } },
  },
  'builtin:sec-audit-29': {
    title: 'Check against three baselines',
    text: 'Mark each item Pass / Fail / N/A against three baselines: STRIDE per trust boundary, CIS Benchmarks for configuration, OWASP ASVS and WSTG controls; a CVE already listed in CISA KEV is Critical outright, and anything not covered is marked NOT ASSESSED rather than silently passing',
    tags: ['STRIDE', 'CIS', 'ASVS'],
  },
  'builtin:sec-audit-30': {
    title: 'Open redirect and Host header',
    text: 'and check open redirects (CWE-601): compare the parsed target against an allowlist instead of prefix matching — try //evil.example, trusted.example.evil.example and backslash variants; in OAuth flows this leaks the authorization code. Then check Host header injection poisoning absolute URLs and cache keys',
    tags: ['open redirect', 'Host header', 'CWE-601'],
  },
  'builtin:sec-audit-31': {
    title: 'XSS: reflected, stored, DOM',
    text: 'XSS deep dive (CWE-79): reflected — parameter echoed back; stored — persisted and re-rendered; DOM — location.hash and innerHTML concatenation. Encode per output context: HTML escaping does not stop a javascript: URL in href/src, so allowlist the scheme',
    tags: ['XSS', 'DOM XSS', 'CWE-79'],
  },
  'builtin:sec-audit-32': {
    title: 'Coverage follow-up on located surfaces',
    text: 'Coverage follow-up only on surfaces you already located: for each located defect, walk the dimensions (injection/auth/session/authorization/crypto/config/dependencies/upload/deserialization/business logic) asking "can the same entry be hit again with another parameter, role or path"; a second path counts only if a changed request reproduces it independently — same-origin repetition does not; do not fill dimensions for their own sake',
    tags: ['coverage', 'gap filling', 'dimension re-check'],
  },
  'builtin:sec-audit-33': {
    title: 'Mobile checks against MASVS',
    text: 'Mobile checks against the six OWASP MASVS categories: STORAGE (tokens and PII stored in plaintext), CRYPTO (keys not in the keystore, weak algorithms), AUTH (biometric bypass, auth enforced only client-side), NETWORK (no TLS, no pinning), PLATFORM (exported components, URL schemes, WebView bridges), CODE (debuggable build, keys extractable)',
    tags: ['MASVS', 'mobile', 'MASVS-CODE'],
  },
  'builtin:sec-audit-34': {
    title: 'Weak spots from anomalies',
    text: 'Find weak implementations via anomalies: two implementations of one feature (userId vs user_id side by side), inconsistent error shapes (multiple backends), stale JS and source maps, prod vs staging drift; turn each anomaly into a hypothesis "the old implementation was never fixed", send the same request down both paths and diff the responses — only the difference is a candidate',
    tags: ['anomaly', 'sourcemap', 'heuristics'],
  },
  'builtin:sec-audit-35': {
    title: 'LLM application audit',
    text: 'Walk OWASP LLM Top 10 (2025) item by item: LLM01 direct and indirect prompt injection (white-on-white PDF text, HTML comments, image steganography), LLM05 improper output handling into HTML/SQL, LLM06 excessive agency, LLM07 system prompt leakage, LLM08 vector and embedding weaknesses, LLM10 unbounded consumption — judge over multiple turns and attempts, not a single shot',
    tags: ['LLM', 'Prompt Injection', 'LLM Top 10'],
  },
  'builtin:sec-audit-36': {
    title: 'Multi-tenant isolation',
    text: 'Multi-tenant isolation audit: every query must carry tenant scoping — one missing filter is a cross-tenant IDOR; cache keys, vector-store retrieval, session memory and export jobs partition by tenant too; then check whether untrusted input headers (X-Forwarded-Host/Host) can poison a cache key',
    tags: ['multi-tenant', 'tenant', 'IDOR'],
  },
  'builtin:sec-audit-37': {
    title: 'Logging and monitoring audit',
    text: 'Logging and monitoring audit: auth successes/failures and lockouts must be logged (with source IP/UA), authorization failures record who/what/action, secrets masked before logging, alerts covering password spraying and bulk export',
    tags: ['logging', 'monitoring', 'masking'],
  },
  'builtin:sec-audit-38': {
    title: 'Unicode and control-character smuggling',
    text: 'Unicode and control-character smuggling: bidi overrides (U+202A-U+202E, U+2066-U+2069) and the RTL override U+202E can display instructions reversed; the invisible tag block (U+E0000-U+E007F) and zero-width characters carry hidden instructions; ANSI escapes and NUL truncation alter terminal behaviour; base64 can hide in comments — confirm the bytes actually reach the sink',
    tags: ['Unicode', 'smuggling', 'invisible characters'],
  },
  'builtin:sec-audit-39': {
    title: 'Cryptographic misuse audit',
    text: 'Cryptographic misuse audit: password hashing must be argon2id/bcrypt/scrypt with a re-tuned cost factor (CWE-916); compare tokens with hmac.compare_digest, never === (CWE-208, timing oracle); Math.random-style weak randomness is not for tokens or session ids (CWE-338); plus IV/nonce reuse, ECB mode and hand-rolled crypto (CWE-1240)',
    tags: ['cryptography', 'CWE-208', 'weak randomness'],
  },
  'builtin:sec-audit-40': {
    title: 'Token and session lifecycle',
    text: 'Token and session lifecycle: rotate the refresh token on every use and bind it to device and audience — presenting an already-rotated token is a compromise signal, revoke the whole family (CWE-613); sensitive actions need fresh verification, not "MFA was used at login" (CWE-308); support impersonation must keep actor distinct from effective_user and be audited (CWE-778)',
    tags: ['token', 'refresh token', 'CWE-613'],
  },
}
