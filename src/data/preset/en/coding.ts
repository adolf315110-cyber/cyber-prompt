import type { CardI18n } from '../../../types'

/**
 * 编程 · 英文英译层（25 张）
 * - 键 = 原卡片 id；vars 的键 = 原(中)文变量名，值为英文变量名与默认值
 * - 约束（由 src/__tests__/presetCardsEn.test.ts 校验）：title ≤ 64 字符、text ≤ 480 字符、tags 2-4、标题与文本唯一
 */
export const CODING_EN: Record<string, CardI18n> = {
  'builtin:coding-01': {
    title: 'Minimal reproduction first',
    text: 'Build a minimal reproduction case before anything else; locate the root cause from evidence instead of guessing and changing code',
    tags: ['minimal repro', 'root cause'],
  },
  'builtin:coding-02': {
    title: 'Fix constraints',
    text: 'Constraints: minimal change; do not alter public interfaces; follow the existing code style; provide a directly applicable diff rather than a full rewrite',
    tags: ['minimal change', 'diff'],
  },
  'builtin:coding-03': {
    title: 'Pin the tech stack',
    text: 'Tech stack: {language} + {framework}; use officially recommended patterns and current stable version APIs, not deprecated interfaces',
    tags: ['tech stack', 'version'],
    vars: {
      语言: { name: 'language', default: 'TypeScript' },
      框架: { name: 'framework', default: 'React' },
    },
  },
  'builtin:coding-04': {
    title: 'Add edge-case tests',
    text: 'and add test cases for boundary conditions and failure paths (nulls, extremes, concurrency, failed retries)',
    tags: ['edge cases', 'failure paths'],
  },
  'builtin:coding-05': {
    title: 'Contract before code',
    text: 'Define the interface contract first: inputs and outputs, error codes, timeout and retry semantics — then write the implementation',
    tags: ['interface design', 'contract'],
  },
  'builtin:coding-06': {
    title: 'Complexity analysis',
    text: 'and give time and space complexity analysis, explaining how behavior changes as data volume grows',
    tags: ['performance', 'complexity'],
  },
  'builtin:coding-07': {
    title: 'Error handling strategy',
    text: 'Error handling strategy: separate recoverable from unrecoverable errors; logs carry context but are sanitized; external error messages leak no internal details',
    tags: ['error handling', 'sanitization'],
  },
  'builtin:coding-08': {
    title: 'Small steps',
    text: 'Work in small steps: do one thing at a time, keep it compilable and testable, always rollback-able',
    tags: ['small steps', 'rollback'],
  },
  'builtin:coding-09': {
    title: 'Add regression tests',
    text: 'and add a regression test covering this behavior; make the test fail first, then make it pass',
    tags: ['regression test', 'TDD'],
  },
  'builtin:coding-10': {
    title: 'Code review checklist',
    text: 'Self-review checklist: clear naming, no duplicated code, boundaries handled, no dead code, comments explain why rather than what',
    tags: ['review', 'self-check'],
  },
  'builtin:coding-11': {
    title: 'Compatibility check',
    text: 'Compatibility check: are public APIs, serialization formats and database migration scripts backward compatible, and is rollback feasible?',
    tags: ['compatibility', 'migration'],
  },
  'builtin:coding-12': {
    title: 'Start from the data model',
    text: 'Design from the data model and invariants first: which state combinations are legal, enforced at the type or constraint layer',
    tags: ['data model', 'invariants'],
  },
  'builtin:coding-13': {
    title: 'Explain trade-offs',
    text: 'and explain the trade-offs against alternatives: complexity, performance, maintainability, the cost of each',
    tags: ['trade-offs', 'balance'],
  },
  'builtin:coding-14': {
    title: 'Tech stack constraints',
    text: 'Tech stack: {language} {version}; follow that version\'s idioms and introduce no unconfirmed third-party dependencies; pin a lockfile and freeze installs in CI, review each install script because it runs with developer and runner privileges, and keep internal package names unresolvable from the public registry (dependency confusion)',
    tags: ['tech stack', 'dependencies', 'lockfile'],
    vars: {
      语言: { name: 'language', default: 'Python' },
      版本: { name: 'version', default: '3.12' },
    },
  },
  'builtin:coding-15': {
    title: 'Test strategy',
    text: 'Test strategy: unit tests cover core branches; boundaries and failure paths in a separate group; stub external dependencies; tests stay fast and repeatable',
    tags: ['testing', 'strategy'],
  },
  'builtin:coding-16': {
    title: 'Check existing usage first',
    text: 'Search the codebase first for existing solutions and conventions to the same problem; consistency beats novelty',
    tags: ['consistency', 'conventions'],
  },
  'builtin:coding-17': {
    title: 'Runnable verification',
    text: 'and provide a minimal runnable script or command that proves the change works',
    tags: ['verification', 'runnable'],
  },
  'builtin:coding-18': {
    title: 'Data consistency',
    text: 'Data consistency: check transaction boundaries, idempotency keys and compensation logic item by item, stating the consistency outcome in each failure scenario',
    tags: ['transactions', 'idempotency'],
  },
  'builtin:coding-19': {
    title: 'Quantify before optimizing',
    text: 'Quantify performance problems before optimizing: provide baseline data and profiling results, and name the bottleneck layer',
    tags: ['performance', 'quantification'],
  },
  'builtin:coding-20': {
    title: 'Update docs and changelog',
    text: 'and update docs and changelog: impact scope, migration steps, rollback method',
    tags: ['docs', 'changes'],
  },
  'builtin:coding-21': {
    title: 'Logging and observability',
    text: 'Logging and observability: instrument critical paths, track {metric} metrics and alert thresholds so production issues can be diagnosed',
    tags: ['logging', 'observability'],
    vars: { 监控维度: { name: 'metric', default: 'error rate / latency / throughput' } },
  },
  'builtin:coding-22': {
    title: 'Check secure defaults',
    text: 'and check secure defaults: timeouts, size limits, least privilege, fail-closed behavior',
    tags: ['secure defaults', 'fail-closed'],
  },
  'builtin:coding-23': {
    title: 'Refactoring steps',
    text: 'Refactoring steps: add characterization tests first, then replace in small steps, keeping behavior unchanged at each step',
    tags: ['refactoring', 'behavior unchanged'],
  },
  'builtin:coding-24': {
    title: 'Mark unfinished items',
    text: 'and clearly mark unfinished items and follow-up TODOs: which are temporary solutions and when they must be replaced',
    tags: ['TODO', 'tech debt'],
  },
  'builtin:coding-25': {
    title: 'Commit message standard',
    text: 'Commit standard: one commit does one thing; the subject explains why in one sentence; the body lists behavior changes and impact',
    tags: ['commit', 'standard'],
  },
}
