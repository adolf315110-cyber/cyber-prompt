import type { CardI18n } from '../../../types'

/**
 * 通用 · 英文英译层（20 张）
 * - 键 = 原卡片 id；vars 的键 = 原(中)文变量名，值为英文变量名与默认值
 * - 约束（由 src/__tests__/presetCardsEn.test.ts 校验）：title ≤ 64 字符、text ≤ 480 字符、tags 2-4、标题与文本唯一
 */
export const GENERAL_EN: Record<string, CardI18n> = {
  'builtin:general-01': {
    title: 'Restate before answering',
    text: 'First restate my goal and constraints in your own words; start answering only after we agree on the understanding',
    tags: ['restate', 'alignment'],
  },
  'builtin:general-02': {
    title: 'Mark uncertainty',
    text: 'Label uncertain conclusions with confidence level and grounds; never fabricate citations, data or non-existent APIs',
    tags: ['uncertainty', 'anti-hallucination'],
  },
  'builtin:general-03': {
    title: 'Ask when information is missing',
    text: 'If key information is missing, ask at most 3 clarifying questions first; do not assume silently and then output a long answer',
    tags: ['clarification', 'questions'],
  },
  'builtin:general-04': {
    title: 'Step-by-step reasoning',
    text: 'List your analysis steps and key assumptions first, then work step by step to the conclusion',
    tags: ['reasoning', 'assumptions'],
  },
  'builtin:general-05': {
    title: 'Define success criteria',
    text: 'Confirm the success criteria for this task with me first: what counts as done, what counts as extra credit, what is explicitly out of scope',
    tags: ['success criteria', 'scope'],
  },
  'builtin:general-06': {
    title: 'List counterexamples',
    text: 'and list counterexamples and edge cases: what would overturn the current conclusion, which inputs fail most easily',
    tags: ['counterexamples', 'boundaries'],
  },
  'builtin:general-07': {
    title: 'Decompose the problem',
    text: 'Split the task into independent subproblems: give the breakdown list first, then tackle items one by one with a short summary after each',
    tags: ['decomposition', 'progress'],
  },
  'builtin:general-08': {
    title: 'Red-team self-review',
    text: 'Then self-review as a red teamer: assume you are the reviewer and find the three weakest or most error-prone points in your own plan',
    tags: ['red team', 'self-review'],
  },
  'builtin:general-09': {
    title: 'State dependencies',
    text: 'and state the premises and external conditions the conclusion depends on, and how it changes when they fail',
    tags: ['premises', 'conditions'],
  },
  'builtin:general-10': {
    title: 'Anchor the domain',
    text: 'This task is in the {domain} domain: prefer that domain\'s mature methods and terminology, and cite its recognized standards',
    tags: ['domain', 'standards'],
    vars: { 领域: { name: 'domain', default: 'security auditing' } },
  },
  'builtin:general-11': {
    title: 'Outline first',
    text: 'Give an outline of at most 8 items for my confirmation first, then expand section by section to avoid a long off-target answer',
    tags: ['outline', 'segmented'],
  },
  'builtin:general-12': {
    title: 'Control scope',
    text: 'Stay strictly focused on my question: do not expand the topic and do not add sections that were not requested',
    tags: ['focus', 'scope'],
  },
  'builtin:general-13': {
    title: 'Suggest next steps',
    text: 'and give a suggested next-action list, ordered by priority, with the purpose of each step',
    tags: ['next steps', 'actions'],
  },
  'builtin:general-14': {
    title: 'Segment long tasks',
    text: 'Deliver long tasks in segments: end each segment with current progress, a to-do list and the handoff point so work can be resumed',
    tags: ['segmented', 'resumable'],
  },
  'builtin:general-15': {
    title: 'Compliance boundaries',
    text: 'Compliance boundary: only provide content within targets and purposes I explicitly authorize; on out-of-bound requests, flag it first and offer a compliant alternative',
    tags: ['compliance', 'authorization'],
  },
  'builtin:general-16': {
    title: 'Unify terminology first',
    text: 'Unify terminology first: define the key concepts for this discussion and reuse them throughout, avoiding synonymous mixing',
    tags: ['terminology', 'definitions'],
  },
  'builtin:general-17': {
    title: 'Attach self-check results',
    text: 'and attach a self-check at the end: verify every constraint I gave, one by one, and explain any unmet one',
    tags: ['self-check', 'constraints'],
  },
  'builtin:general-18': {
    title: 'Fallback plan',
    text: 'If uncertain or missing information: state your assumption → label confidence → explain how to roll back quickly if the assumption is wrong',
    tags: ['fallback', 'assumptions'],
  },
  'builtin:general-19': {
    title: 'Use numbers',
    text: 'and speak with numbers and conditions: orders of magnitude, probability, cost, time — avoiding vague adjectives without quantitative support',
    tags: ['quantification', 'precision'],
  },
  'builtin:general-20': {
    title: 'Output language and style',
    // 英文页的默认输出语言是 English（中文页那张卡的默认值仍是「中文」）
    text: 'Output language is {language}; restrained and professional style; keep necessary English terms with a short explanation',
    tags: ['language', 'style'],
    vars: { 语言: { name: 'language', default: 'English' } },
  },
}
