import type { CardI18n } from '../../../types'

/**
 * 输出格式 · 英文英译层（25 张）
 * - 键 = 原卡片 id；vars 的键 = 原(中)文变量名，值为英文变量名与默认值
 * - 约束（由 src/__tests__/presetCardsEn.test.ts 校验）：title ≤ 64 字符、text ≤ 480 字符、tags 2-4、标题与文本唯一
 */
export const OUTPUT_EN: Record<string, CardI18n> = {
  'builtin:output-01': {
    title: 'Chinese output',
    text: 'Output requirement: Chinese; keep technical terms in their English original form with a Chinese explanation at first mention (e.g. sink, taint propagation, PoC)',
    tags: ['Chinese', 'terminology'],
  },
  'builtin:output-02': {
    title: 'Table format',
    text: 'Render comparison information as a table (columns: issue, location, severity, impact, fix), followed by a conclusion of at most three lines',
    tags: ['table', 'structure'],
  },
  'builtin:output-03': {
    title: 'Limit length',
    text: 'Keep the whole answer within {length}; conclusion first, details after',
    tags: ['length', 'conclusion first'],
    vars: { 篇幅: { name: 'length', default: '500 words' } },
  },
  'builtin:output-04': {
    title: 'Evidence and citations',
    text: 'Every conclusion must cite evidence: file and line, command and output, or a link; label anything unverifiable explicitly as inference',
    tags: ['evidence', 'citations'],
  },
  'builtin:output-05': {
    title: 'Conclusion first',
    text: 'Start with a one-sentence conclusion, then argue in three layers: conclusion, grounds, details',
    tags: ['conclusion first', 'layering'],
  },
  'builtin:output-06': {
    title: 'Numbered steps',
    text: 'and write the procedure as numbered steps — one action and one command per step, ready to follow directly',
    tags: ['steps', 'actionable'],
  },
  'builtin:output-07': {
    title: 'CVSS output',
    text: 'CVSS 3.1 output: the vector string (e.g. AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H) and score, justifying each metric; add CVSS 4.0 or EPSS references where useful',
    tags: ['CVSS', 'scoring'],
  },
  'builtin:output-08': {
    title: 'Reproduction format',
    text: 'Reproduction format: preconditions → numbered steps (with commands/requests) → expected result → actual result; all four parts are mandatory',
    tags: ['repro', 'format'],
  },
  'builtin:output-09': {
    title: 'For developer readers',
    text: 'Audience: developers — use terms directly and give code-level detail and fixes, not a management-style overview',
    tags: ['audience', 'developers'],
  },
  'builtin:output-10': {
    title: 'Cite sources',
    text: 'and cite sources for key claims (doc links, standard clauses, source locations); mark claims without a source as experience-based judgment',
    tags: ['sources', 'marking'],
  },
  'builtin:output-11': {
    title: 'One-page overview',
    text: 'Start with a one-page overview: a risk landscape table + the three most important action items; detailed analysis goes in later sections',
    tags: ['overview', 'summary'],
  },
  'builtin:output-12': {
    title: 'Glossary table',
    text: 'Collect first-appearance abbreviations into a glossary (abbr | full name | one-line explanation); keep terminology usage consistent throughout',
    tags: ['terminology', 'consistency'],
  },
  'builtin:output-13': {
    title: 'No inflated wording',
    text: 'and use restrained wording: no unquantified adjectives like "severe" or "fatal"; describe impact with data and conditions',
    tags: ['wording', 'restraint'],
  },
  'builtin:output-14': {
    title: 'Consistent formatting',
    text: 'Define the output conventions first: section numbering, code-block language tags, table and list usage rules — consistent throughout',
    tags: ['format', 'conventions'],
  },
  'builtin:output-15': {
    title: 'Self-check before output',
    text: 'Pre-output self-check: does every conclusion have evidence, are numbers verified, is formatting consistent, is the original question answered? Fix first, then output',
    tags: ['self-check', 'quality'],
  },
  'builtin:output-16': {
    title: 'State assumptions',
    text: 'and add an "Assumptions" section at the start: list every unproven default premise for the reader to falsify',
    tags: ['assumptions', 'transparency'],
  },
  'builtin:output-17': {
    title: 'Next-step suggestions',
    text: 'End with a next-step list: 3-5 items in priority order, each with its expected benefit and cost magnitude',
    tags: ['suggestions', 'priority'],
  },
  'builtin:output-18': {
    title: 'Structured lists',
    text: 'Organize information as structured lists: parallel phrasing within a level, one item per line, avoiding long paragraph piles',
    tags: ['lists', 'structure'],
  },
  'builtin:output-19': {
    title: 'Paste-ready artifacts',
    text: 'and produce paste-ready artifacts (configs, commands, code blocks) rather than descriptions that need rework',
    tags: ['artifacts', 'paste-ready'],
  },
  'builtin:output-20': {
    title: 'Audience adaptation',
    text: 'Audience: {audience}; adjust detail level and wording accordingly (developers want code-level detail, management wants risk and cost)',
    tags: ['audience', 'detail level'],
    vars: { 受众: { name: 'audience', default: 'developer' } },
  },
  'builtin:output-21': {
    title: 'Report first-screen contract',
    text: 'Report first screen: title as "[vuln type] in [endpoint] allows [role] to [impact]"; the first sentence must state what an attacker can do (impact first), not a vulnerability intro; steps give a paste-ready raw request; Critical/High add an equivalent reproduction command for a second tool',
    tags: ['report', 'impact first'],
  },
  'builtin:output-22': {
    title: 'Confidence-tagged output',
    text: 'Confidence-tagged output: tag each finding [verified]/[high confidence]/[to verify] and state the verification conditions — every taint hop checked, no effective filtering confirmed, a constructible input exists; note which step is missing',
    tags: ['confidence', 'output'],
  },
  'builtin:output-23': {
    title: 'Dedup and numbering',
    text: 'Dedup and numbering: merge findings with the same file and line, same type within <10 lines, or >80% description similarity; prefix numbers [C-01]/[H-02]/[M-03] and reference them consistently',
    tags: ['dedup', 'numbering'],
  },
  'builtin:output-24': {
    title: 'Report negative results',
    text: 'Negative results belong in the report: list what was tested without findings (with methods) as coverage proof, and note what remains uncovered',
    tags: ['coverage', 'negative results'],
  },
  'builtin:output-25': {
    title: 'Executive summary format',
    text: 'Executive summary format: risk landscape table (severity × count × asset) + top three fixes + a combined attack-chain sketch — decidable from this page alone',
    tags: ['summary', 'management'],
  },
}
