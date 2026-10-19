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
    title: 'Show the taint path',
    text: 'and explain each issue with a full source→sink taint path: for every hop give file:line and the data shape, plus the missing sanitizer (filtering/encoding/parameterization/allowlist)',
    tags: ['taint analysis', 'sanitizer', 'data flow'],
  },
  'builtin:sec-audit-03': {
    title: 'Audit report structure',
    text: 'Output structure: first a risk summary table (ID/severity Critical→Info/file:line/one-line impact), then per-item detail — CWE ID, trigger conditions, minimal PoC, fix diff and regression check',
    tags: ['report structure', 'CWE', 'PoC'],
  },
  'builtin:sec-audit-04': {
    title: 'Language-specific dangerous patterns',
    text: '{language} dangerous-pattern review: reflection and dynamic invocation, deserialization entry points (readObject/unserialize, JSON polymorphism, YAML), expression injection (SpEL/OGNL/MVEL) and SSTI, unsafe memory ops (UAF/OOB) — state exploitability preconditions for each',
    tags: ['dangerous patterns', 'SSTI', 'deserialization'],
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
    text: 'AuthN line: password hashing (bcrypt/Argon2), session fixation, expiry and lockout mechanisms; AuthZ line: per-endpoint role check plus object-ownership check (BOLA) — compare findById(id) against findById(userId,id)',
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
    title: 'Sort by risk',
    text: 'Sorting rule: rank by reachability × impact scope × exploitation complexity × required privileges (CVSS-style); unauthenticated RCE and full data read/write first, then authenticated BOLA and injection, hardening items last',
    tags: ['risk ranking', 'CVSS', 'severity'],
  },
  'builtin:sec-audit-11': {
    title: 'Static first, then dynamic',
    text: 'Start with a SAST pass to locate suspects (dangerous functions, string concatenation, config switches, dependency manifests), then verify dynamic reachability and filter chains — show evidence for each step separately',
    tags: ['SAST', 'dynamic verification'],
  },
  'builtin:sec-audit-12': {
    title: 'Check failure paths',
    text: 'and check whether failure paths fail open: swallowed exceptions, fail-open defaults, stack traces and config leaked in error pages (WSTG-ERRH-02), retries and fallbacks that bypass validation',
    tags: ['error handling', 'fail-open', 'WSTG'],
  },
  'builtin:sec-audit-13': {
    title: 'Deserialization deep dive',
    text: 'Deserialization review (Insecure Deserialization): list all {language} entry points (readObject, unserialize, pickle) and test the type controls, gadget chain reachability (Commons-Collections/Fastjson chains), and component versions vs known CVEs',
    tags: ['deserialization', 'gadget chain', 'CVE'],
    vars: { 语言: { name: 'language', default: 'Java' } },
  },
  'builtin:sec-audit-14': {
    title: 'Supply chain audit',
    text: 'Supply-chain audit (SBOM): parse lockfiles for direct and transitive dependency versions, flag known CVEs (with IDs and CVSS), EOL components and typosquatting/dependency-confusion suspects; give a minimal upgrade path',
    tags: ['supply chain', 'SBOM', 'CVE'],
  },
  'builtin:sec-audit-15': {
    title: 'Start from config and defaults',
    text: 'Start from deployment config and defaults: debug/Actuator endpoints, default credentials (admin/admin), wildcard CORS, directory listing, cloud storage ACL/Public Access — biggest blast radius, often unauthenticated',
    tags: ['config security', 'Actuator', 'defaults'],
  },
  'builtin:sec-audit-16': {
    title: 'Fix priorities',
    text: 'and give three fix tiers by urgency: immediate hotfix (config/switch/WAF virtual patch), scheduled fix (code change), architectural change (design level) — each with its verification method',
    tags: ['fix priority', 'virtual patch', 'regression'],
  },
  'builtin:sec-audit-17': {
    title: 'Access control matrix',
    text: 'Access-control matrix (IDOR/BOLA): resources × actions × roles (anonymous/user A/user B/admin), checking accessibility cell by cell; focus on endpoints that query by ID alone (horizontal) and admin functions reachable by regular users (BFLA, vertical)',
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
    title: 'Sensitive data inventory',
    text: 'Sensitive data inventory (Secrets/PII): where keys, tokens and personal data appear — code, config, logs, caches, error pages, backups — and whether each is over-exposed, readable across users, or bulk-exportable',
    tags: ['sensitive data', 'Secrets', 'PII'],
  },
  'builtin:sec-audit-22': {
    title: 'Framework misuse audit',
    text: '{framework} misuse checklist: auto-binding (Mass Assignment), view rendering and SSTI surface, interceptor/filter coverage (route allowlist bypass), ORM raw SQL concatenation, whether annotation auth (@PreAuthorize and similar) actually takes effect',
    tags: ['framework', 'Mass Assignment', 'SSTI'],
    vars: { 框架: { name: 'framework', default: 'Spring' } },
  },
  'builtin:sec-audit-23': {
    title: 'Boundaries and edge cases first',
    text: 'Test boundaries and abnormal paths first: null/None, oversized input, negative and zero values, Unicode and encoding differences, timeouts and retries, concurrent ordering — missing validation concentrates there',
    tags: ['boundary values', 'edge paths'],
  },
  'builtin:sec-audit-24': {
    title: 'Chain findings together',
    text: 'and derive chains (kill chain): feed each low-severity finding into the next step (info leak→credential theft→BOLA→bulk export); note preconditions, required privileges and final impact per hop',
    tags: ['vulnerability chain', 'kill chain'],
  },
  'builtin:sec-audit-25': {
    title: 'Injection surface inventory',
    text: 'Injection surface inventory: SQL/NoSQL, OS command, SSTI and expression injection, LDAP, XPath, CRLF response splitting, log injection — locate every concatenation point and note the parameterization, allowlists and escaping in place',
    tags: ['injection', 'SSTI', 'CRLF'],
  },
  'builtin:sec-audit-26': {
    title: 'State audit limitations',
    text: 'and state the audit limitations: uncovered modules and test gaps, unverified assumptions, reachability that needs DAST confirmation, and new vulnerability classes possibly missed due to the knowledge cutoff',
    tags: ['limitations', 'DAST'],
  },
  'builtin:sec-audit-27': {
    title: 'Async pipeline audit',
    text: 'Async pipeline audit (MQ/schedulers): can producers be spoofed or messages injected? consumer-side deserialization and schema validation, duplicate execution and idempotency via retries/dead-letter queues, scheduler concurrency and authorization',
    tags: ['message queue', 'idempotency', 'async'],
  },
  'builtin:sec-audit-28': {
    title: 'File parsing safety',
    text: 'File parsing safety: disable external entities in {dataFormat} (XXE), cap size and nesting depth (billion laughs/XEE), forbid XSLT and schema external references, make upload directories non-executable and guard extraction against Zip Slip',
    tags: ['XXE', 'Zip Slip', 'parsing'],
    vars: { 数据格式: { name: 'dataFormat', default: 'XML' } },
  },
  'builtin:sec-audit-29': {
    title: 'Check against baselines',
    text: 'Against OWASP ASVS / WSTG / CWE Top 25 mark each item Pass / Fail / N/A; for every Fail give file:line, evidence and the fix, covering ASVS L1 controls first',
    tags: ['ASVS', 'WSTG', 'baseline'],
  },
  'builtin:sec-audit-30': {
    title: 'Output the attack chain',
    text: 'and draw the attack chain as entry→propagation→trigger→impact, noting required privileges, preconditions, verification status and blocking points at each hop',
    tags: ['attack chain', 'impact'],
  },
  'builtin:sec-audit-31': {
    title: 'Five-step chain derivation',
    text: 'Chain derivation: for every finding ask — can its preconditions be met by another bug? can its output feed the next hop? iterate expansion (≤3 layers) until it converges, then judge whether combined severity beats the sum of single points',
    tags: ['attack chain', 'composition', 'severity'],
  },
  'builtin:sec-audit-32': {
    title: 'Coverage self-check, 10 dimensions',
    text: 'Coverage self-check across 10 dimensions: injection/auth/session/authorization/crypto/config/dependencies/file upload/deserialization/business logic; list and fill uncovered items before reporting; below 60% breadth, do not go deep',
    tags: ['coverage', 'self-check'],
  },
  'builtin:sec-audit-33': {
    title: 'Avoid tunnel vision',
    text: 'Avoid tunnel vision: no single module over 30% of effort; merge ≥3 files sharing a pattern into one finding with a comparison table; after each module ask "which attack surface is still untouched"',
    tags: ['breadth first', 'pace'],
  },
  'builtin:sec-audit-34': {
    title: 'Weak spots from anomalies',
    text: 'Find weak implementations via anomalies: two implementations of the same feature (userId vs user_id naming), inconsistent error shapes (multiple backends), stale JS and source maps, prod vs staging behavior drift',
    tags: ['anomaly', 'sourcemap', 'heuristics'],
  },
  'builtin:sec-audit-35': {
    title: 'LLM feature audit',
    text: 'LLM application audit (OWASP LLM Top 10): does user input reach the system prompt (Prompt Injection, incl. indirect)? are tool/MCP calls allowlisted and validated? does model output flow unescaped into HTML/SQL? do memory and RAG leak across tenants?',
    tags: ['LLM', 'Prompt Injection', 'RAG'],
  },
  'builtin:sec-audit-36': {
    title: 'Cache and shared state',
    text: 'Shared-state and cache audit: cache keys must include the user dimension (no cross-user bleed), untrusted cache-key input headers (X-Forwarded-Host/Host), per-object cache authorization, distributed locks and idempotency keys in critical sections',
    tags: ['cache', 'access control', 'idempotency key'],
  },
  'builtin:sec-audit-37': {
    title: 'Logging and monitoring audit',
    text: 'Logging and monitoring audit: auth successes/failures and lockouts must be logged (with source IP/UA), authorization failures record who/what/action, secrets masked before logging, alerts covering password spraying and bulk export',
    tags: ['logging', 'monitoring', 'masking'],
  },
  'builtin:sec-audit-38': {
    title: 'Five-step taint analysis',
    text: 'Five-step taint analysis: identify Sink (dangerous functions) → trace variable origins backwards → locate Source (user-controlled input) → check sanitizers and bypass routes → output the path graph with broken links marked',
    tags: ['taint analysis', 'Sink', 'Source'],
  },
  'builtin:sec-audit-39': {
    title: 'Crypto and randomness audit',
    text: 'Cryptography audit: flag MD5/SHA1/DES/RC4 and homemade crypto; weak randomness (Math.random-style PRNG) in security contexts; hard-coded keys, salts and IVs; TLS 1.0/1.1 and weak suites; ECB mode and IV/nonce reuse',
    tags: ['cryptography', 'randomness', 'TLS'],
  },
  'builtin:sec-audit-40': {
    title: 'Session and token lifecycle',
    text: 'Session and token lifecycle audit: real server-side invalidation on logout, old sessions and Remember-Me tokens invalidated after a password change, reset tokens single-use with short TTL (≤15 min), concurrent sessions and kick-out, session ID rotation on login',
    tags: ['session', 'token', 'lifecycle'],
  },
}
