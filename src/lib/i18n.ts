import type { Category, Mode } from '../types'

/** 界面语言：卡片内容与拼装结果始终为中文，仅 UI 文案随此切换 */
export type Lang = 'zh' | 'en'

export const LANG_STORAGE_KEY = 'prompt-blocks:lang'

export const HTML_LANG: Record<Lang, string> = { zh: 'zh-CN', en: 'en' }
export const PAGE_TITLE: Record<Lang, string> = { zh: '提示词方块', en: 'Prompt Blocks' }

/** 全部 UI 文案；两种语言必须同构（由 src/__tests__/i18n.test.ts 校验） */
export interface UiStrings {
  appTitle: string
  appSubtitle: string
  library: string
  searchPlaceholder: string
  noMatches: string
  cardCount: (n: number) => string
  filteredCount: (shown: number, total: number) => string
  clickToInsert: string
  varsBadge: string
  modeLabels: Record<Mode, string>
  categoryLabels: Record<Category, string>
  inserted: (title: string) => string
  copied: string
  copyFailed: string
  composerTitle: string
  composerEmpty: string
  baseSentence: string
  baseSentencePlaceholder: string
  slotTitles: Record<Mode, string>
  slotCount: (n: number) => string
  slotEmpty: Record<Mode, string>
  cardDeleted: string
  enable: string
  disable: string
  moveUp: string
  moveDown: string
  remove: string
  unresolvedHint: string
  previewTitle: string
  unfilledVars: string
  manualSyncOff: string
  manualPlaceholder: string
  previewEmpty: string
  copy: string
  sync: string
  manualEdit: string
}

export const UI: Record<Lang, UiStrings> = {
  zh: {
    appTitle: '提示词方块',
    appSubtitle: '点卡拼装 · 一键复制',
    library: '卡库',
    searchPlaceholder: '搜索卡片（标题 / 内容 / 标签）',
    noMatches: '没有匹配的卡片',
    cardCount: (n) => `${n} 张`,
    filteredCount: (shown, total) => `${shown} / ${total} 张`,
    clickToInsert: '点击插入',
    varsBadge: '变量',
    modeLabels: { prefix: '前缀', suffix: '后缀', block: '段落' },
    categoryLabels: {
      'sec-audit': '安全审计',
      pentest: '渗透测试',
      coding: '编程',
      output: '输出格式',
      general: '通用',
    },
    inserted: (title) => `已插入：${title}`,
    copied: '已复制，可直接粘贴',
    copyFailed: '复制失败，请手动选择文本复制',
    composerTitle: '拼装区',
    composerEmpty: '点左边任意卡片开始拼装',
    baseSentence: '基础句',
    baseSentencePlaceholder: '例：帮我审计这段代码',
    slotTitles: { prefix: '前缀区', suffix: '后缀区', block: '段落区' },
    slotCount: (n) => `${n} 张`,
    slotEmpty: {
      prefix: '插入「前缀」卡会出现在这里（句子前段）',
      suffix: '插入「后缀」卡会出现在这里（接在句尾）',
      block: '插入「段落」卡会出现在这里（附在最后）',
    },
    cardDeleted: '（卡片已删除）',
    enable: '启用',
    disable: '停用',
    moveUp: '上移',
    moveDown: '下移',
    remove: '移除',
    unresolvedHint: '有未填写的变量，预览中会原样显示占位符',
    previewTitle: '预览',
    unfilledVars: '有未填变量',
    manualSyncOff: '手动微调中，不再自动同步',
    manualPlaceholder: '在这里微调最终文本',
    previewEmpty: '拼装结果会显示在这里：输入基础句，或点左侧卡片',
    copy: '复制',
    sync: '⟳ 与拼装同步',
    manualEdit: '手动微调',
  },
  en: {
    appTitle: 'Prompt Blocks',
    appSubtitle: 'Click to compose · One-click copy',
    library: 'Library',
    searchPlaceholder: 'Search cards (title / text / tags)',
    noMatches: 'No matching cards',
    cardCount: (n) => (n === 1 ? '1 card' : `${n} cards`),
    filteredCount: (shown, total) => `${shown} / ${total} ${total === 1 ? 'card' : 'cards'}`,
    clickToInsert: 'Click to insert',
    varsBadge: 'vars',
    modeLabels: { prefix: 'Prefix', suffix: 'Suffix', block: 'Block' },
    categoryLabels: {
      'sec-audit': 'Security Audit',
      pentest: 'Penetration Testing',
      coding: 'Coding',
      output: 'Output Format',
      general: 'General',
    },
    inserted: (title) => `Inserted: ${title}`,
    copied: 'Copied — ready to paste',
    copyFailed: 'Copy failed — select the text and copy manually',
    composerTitle: 'Composer',
    composerEmpty: 'Click any card on the left to start composing',
    baseSentence: 'Base sentence',
    baseSentencePlaceholder: 'e.g. Audit this code for security issues',
    slotTitles: { prefix: 'Prefix', suffix: 'Suffix', block: 'Blocks' },
    slotCount: (n) => (n === 1 ? '1 card' : `${n} cards`),
    slotEmpty: {
      prefix: 'Prefix cards you insert appear here (start of the sentence)',
      suffix: 'Suffix cards you insert appear here (right after the sentence)',
      block: 'Block cards you insert appear here (appended at the end)',
    },
    cardDeleted: '(card deleted)',
    enable: 'Enable',
    disable: 'Disable',
    moveUp: 'Move up',
    moveDown: 'Move down',
    remove: 'Remove',
    unresolvedHint: 'Unfilled variables will show as placeholders in the preview',
    previewTitle: 'Preview',
    unfilledVars: 'Unfilled variables',
    manualSyncOff: 'Manual edit — no longer auto-synced',
    manualPlaceholder: 'Fine-tune the final text here',
    previewEmpty: 'Your prompt appears here — type a base sentence or click a card on the left',
    copy: 'Copy',
    sync: '⟳ Sync with composer',
    manualEdit: 'Edit manually',
  },
}

/** 浏览器语言 → 默认界面语言：中文环境用中文，其余用英文 */
export function detectLang(navLang?: string): Lang {
  return navLang && navLang.trim().toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export interface LangStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function safeStorage(): LangStorage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

/** 读取语言偏好：已保存的选择优先，否则按浏览器语言检测 */
export function loadLang(storage: LangStorage | null = safeStorage(), navLang?: string): Lang {
  const fallback = detectLang(navLang ?? (typeof navigator !== 'undefined' ? navigator.language : undefined))
  if (!storage) return fallback
  try {
    const saved = storage.getItem(LANG_STORAGE_KEY)
    return saved === 'zh' || saved === 'en' ? saved : fallback
  } catch {
    return fallback
  }
}

/** 保存语言偏好；隐私模式/配额异常时静默降级 */
export function saveLang(lang: Lang, storage: LangStorage | null = safeStorage()): void {
  if (!storage) return
  try {
    storage.setItem(LANG_STORAGE_KEY, lang)
  } catch {
    /* 静默降级 */
  }
}
