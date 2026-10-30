import type { CardI18n } from '../../../types'

/**
 * 输出格式 · 英文英译层（25 张）
 * - 键 = 原卡片 id；vars 的键 = 原(中)文变量名，值为英文变量名与默认值
 * - 约束（由 src/__tests__/presetCardsEn.test.ts 校验）：title ≤ 64 字符、text ≤ 480 字符、tags 2-4、标题与文本唯一
 */
export const OUTPUT_EN: Record<string, CardI18n> = {
  'builtin:output-01': {
    // 英文页不该再要求「用中文输出」——这张卡在英文界面指定英文输出
    title: 'English output',
    text: 'Output requirement: English; keep technical terms in their English original form with a short explanation at first mention (e.g. sink, taint propagation, PoC)',
    tags: ['English', 'terminology'],
  },
  'builtin:output-02': {
    title: 'Table format',
    text: 'Render comparison information as a table (columns: issue, CWE ID, location, severity Critical to Info, impact, fix suggestion with an applicable diff), followed by a conclusion of at most three lines',
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
    text: 'Reproduction format: preconditions → numbered steps (with commands/requests) → expected result → actual result; all four parts are mandatory; for high-severity findings give two mutually independent reproduction paths (e.g. curl and Python requests)',
    tags: ['repro', 'format'],
  },
  'builtin:output-09': {
    title: 'Scale depth to complexity',
    text: 'Scale output depth to task complexity: simple change → changes + verification checklist; standard change → objective, key files, implementation steps, verification; large change → background, scope and impact, proposed solution, alternatives considered, phased plan, verification, migration and rollback',
    tags: ['tiering', 'verification', 'output structure'],
  },
  'builtin:output-10': {
    title: 'Cite sources',
    text: 'and cite sources for key claims (doc links, standard clauses, source locations); mark claims without a source as experience-based judgment',
    tags: ['sources', 'marking'],
  },
  'builtin:output-11': {
    title: 'Decision log',
    text: 'Decision log: append one line per step — "Step N | decision | outcome" — and state which observation forced any change of direction; each step must be self-contained so a reader understands why it was done without reading earlier steps',
    tags: ['decision log', 'traceability', 'self-contained'],
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
    text: 'Define the output conventions first: section numbering, code-block language tags, table and list usage rules — consistent throughout; the same input should produce the same report structure so several audits can be compared side by side',
    tags: ['format', 'conventions'],
  },
  'builtin:output-15': {
    title: 'Self-check before output',
    text: 'Pre-output self-check: does every conclusion have evidence, are numbers verified, is formatting consistent, is the original question answered? Fix first, then output; at the end list each of my constraints one by one and explain any unmet one',
    tags: ['self-check', 'quality'],
  },
  'builtin:output-16': {
    title: 'State assumptions',
    text: 'and add an "Assumptions" section at the start: list every unproven default premise for the reader to falsify',
    tags: ['assumptions', 'transparency'],
  },
  'builtin:output-17': {
    title: 'Next-step suggestions',
    text: 'End with a next-step list: 3-5 items in priority order, each with its expected benefit and cost magnitude; also give a retest plan (per finding: retest time, owner, acceptance criteria)',
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
    text: 'Audience: {audience}; adjust detail level and wording accordingly (developers want code-level detail and terms used directly, management wants risk and cost)',
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
    text: 'Confidence-tagged output: tag each finding [verified]/[high confidence]/[to verify] - [verified] must cite a concrete runtime observation (request, response, log or reproduction output); having only read the source caps it at [high confidence] and must not be rated; to-verify items go to an appendix, not the conclusions',
    tags: ['confidence', 'output', 'runtime proof'],
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
