import type { Category, Mode } from '../types'
import type { CardIssue } from './cardUtils'

/** 界面语言：UI 文案与卡片内容随此切换；en 的卡片内容走内置英译层（src/data/preset/en） */
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
  /* 配方条 */
  recipesLabel: string
  saveRecipe: string
  recipeNamePlaceholder: string
  recipeNameRequired: string
  recipeSaved: (name: string) => string
  recipeRestored: (name: string) => string
  recipeDeleted: (name: string) => string
  recipeRenamed: string
  noRecipes: string
  restoreRecipe: string
  renameRecipe: string
  deleteRecipe: string
  confirmRestoreRecipe: string
  confirmDeleteRecipe: (name: string) => string
  recipeMissingCards: (n: number) => string
  /* 卡库分栏 */
  presetTab: string
  myCardsTab: string
  myCardsCount: (n: number) => string
  newCard: string
  copyToCustom: string
  editCard: string
  deleteCard: string
  customBadge: string
  noUserCards: string
  /* 卡片编辑器 */
  editorNewTitle: string
  editorEditTitle: string
  fieldTitle: string
  fieldCategory: string
  fieldMode: string
  fieldText: string
  fieldTags: string
  fieldVars: string
  varDefault: string
  save: string
  cancel: string
  close: string
  cardSaved: string
  cardDeletedToast: string
  cardCopiedToCustom: string
  confirmDeleteCard: string
  formErrors: Record<CardIssue, string>
  /* 数据管理 */
  dataMenu: string
  dataTitle: string
  exportData: string
  importData: string
  clearData: string
  exported: (file: string) => string
  imported: (cards: number, recipes: number) => string
  importFailed: string
  importInvalidEntries: (n: number) => string

  importConfirm: (cards: number, recipes: number) => string
  importConfirmCompose: string
  importConfirmNoCompose: string
  importSkipped: (cards: number, recipes: number) => string
  storageFailed: string
  storageRecovered: string
  confirmClear: string
  cleared: string
  /* 通用弹窗 */
  confirmOk: string
  confirmCancel: string
  /* 错误兜底界面 */
  errorTitle: string
  errorBody: string
  errorReload: string
  errorDetails: string
  errorReset: string
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
    /* 配方条 */
    recipesLabel: '配方',
    saveRecipe: '存为配方',
    recipeNamePlaceholder: '给这套组合起个名字',
    recipeNameRequired: '配方名称不能为空',
    recipeSaved: (name) => `已保存配方：${name}`,
    recipeRestored: (name) => `已还原配方：${name}`,
    recipeDeleted: (name) => `已删除配方：${name}`,
    recipeRenamed: '已重命名配方',
    noRecipes: '还没有配方',
    restoreRecipe: '还原',
    renameRecipe: '重命名',
    deleteRecipe: '删除',
    confirmRestoreRecipe: '还原配方会覆盖当前拼装区（含变量值），确定继续？',
    confirmDeleteRecipe: (name) => `删除配方「${name}」？此操作不可撤销。`,
    recipeMissingCards: (n) => `有 ${n} 张卡已被删除，未能还原`,
    /* 卡库分栏 */
    presetTab: '预置卡库',
    myCardsTab: '我的卡片',
    myCardsCount: (n) => `${n} 张`,
    newCard: '新建卡片',
    copyToCustom: '复制为自定义',
    editCard: '编辑',
    deleteCard: '删除',
    customBadge: '自定义',
    noUserCards: '还没有自定义卡片，点「新建卡片」开始',
    /* 卡片编辑器 */
    editorNewTitle: '新建自定义卡片',
    editorEditTitle: '编辑自定义卡片',
    fieldTitle: '标题',
    fieldCategory: '分类',
    fieldMode: '模式',
    fieldText: '正文',
    fieldTags: '标签（逗号分隔，最多 4 个）',
    fieldVars: '变量（从正文自动提取）',
    varDefault: '默认值',
    save: '保存',
    cancel: '取消',
    close: '关闭',
    cardSaved: '已保存卡片',
    cardDeletedToast: '已删除卡片',
    cardCopiedToCustom: '已复制为自定义卡片',
    confirmDeleteCard: '删除这张卡片？已插入拼装区的该卡会显示为「卡片已删除」。',
    formErrors: {
      titleRequired: '标题不能为空',
      titleTooLong: '标题不能超过 24 字',
      textRequired: '正文不能为空',
      textTooLong: '正文不能超过 160 字',
      tooManyTags: '标签最多 4 个',
      textNotSingleLine: '正文必须是单行',
    },
    /* 数据管理 */
    dataMenu: '数据',
    dataTitle: '数据管理',
    exportData: '导出 JSON',
    importData: '导入 JSON',
    clearData: '清空本地数据',
    exported: (file) => `已导出：${file}`,
    imported: (cards, recipes) => `导入完成：新增 ${cards} 张卡片、${recipes} 个配方`,
    importFailed: '导入失败：文件不是有效的提示词方块备份',
    importInvalidEntries: (n) => `有 ${n} 条数据不可用，已跳过`,
    importConfirm: (cards, recipes) => `将新增 ${cards} 张卡片、${recipes} 个配方。`,
    importConfirmCompose: '当前拼装区会被文件中的拼装区覆盖。',
    importConfirmNoCompose: '文件里没有拼装区，当前拼装区保持不变。',
    importSkipped: (cards, recipes) => `跳过 ${cards} 张重复卡片、${recipes} 个重复配方`,
    storageFailed: '本地存储写入失败，数据可能没有保存',
    storageRecovered: '本地数据损坏，已回退；原始内容备份在 prompt-blocks:v1:corrupt-backup',
    confirmClear: '将清空自定义卡片、配方与拼装区，且不可撤销。建议先导出备份。确定继续？',
    cleared: '已清空本地数据',
    /* 通用弹窗 */
    confirmOk: '确定',
    confirmCancel: '取消',
    /* 错误兜底界面 */
    errorTitle: '界面出错了',
    errorBody: '你的数据仍安全地存在浏览器本地存储里，没有丢失。刷新页面通常就能继续使用。',
    errorReload: '刷新页面',
    errorDetails: '错误详情',
    errorReset: '重置本地数据并重试',
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
    /* 配方条 */
    recipesLabel: 'Recipes',
    saveRecipe: 'Save as recipe',
    recipeNamePlaceholder: 'Name this combination',
    recipeNameRequired: 'Recipe name cannot be empty',
    recipeSaved: (name) => `Recipe saved: ${name}`,
    recipeRestored: (name) => `Recipe restored: ${name}`,
    recipeDeleted: (name) => `Recipe deleted: ${name}`,
    recipeRenamed: 'Recipe renamed',
    noRecipes: 'No recipes yet',
    restoreRecipe: 'Restore',
    renameRecipe: 'Rename',
    deleteRecipe: 'Delete',
    confirmRestoreRecipe: 'Restoring a recipe overwrites the current composer (including variable values). Continue?',
    confirmDeleteRecipe: (name) => `Delete recipe "${name}"? This cannot be undone.`,
    recipeMissingCards: (n) => `${n} card(s) were deleted and could not be restored`,
    /* 卡库分栏 */
    presetTab: 'Preset library',
    myCardsTab: 'My cards',
    myCardsCount: (n) => `${n}`,
    newCard: 'New card',
    copyToCustom: 'Copy to custom',
    editCard: 'Edit',
    deleteCard: 'Delete',
    customBadge: 'Custom',
    noUserCards: 'No custom cards yet — click "New card" to start',
    /* 卡片编辑器 */
    editorNewTitle: 'New custom card',
    editorEditTitle: 'Edit custom card',
    fieldTitle: 'Title',
    fieldCategory: 'Category',
    fieldMode: 'Mode',
    fieldText: 'Text',
    fieldTags: 'Tags (comma-separated, max 4)',
    fieldVars: 'Variables (auto-detected from text)',
    varDefault: 'Default',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    cardSaved: 'Card saved',
    cardDeletedToast: 'Card deleted',
    cardCopiedToCustom: 'Copied to a custom card',
    confirmDeleteCard: 'Delete this card? Cards already inserted into the composer will show as "(card deleted)".',
    formErrors: {
      titleRequired: 'Title cannot be empty',
      titleTooLong: 'Title cannot exceed 24 characters',
      textRequired: 'Text cannot be empty',
      textTooLong: 'Text cannot exceed 160 characters',
      tooManyTags: 'At most 4 tags',
      textNotSingleLine: 'Text must be a single line',
    },
    /* 数据管理 */
    dataMenu: 'Data',
    dataTitle: 'Data management',
    exportData: 'Export JSON',
    importData: 'Import JSON',
    clearData: 'Clear local data',
    exported: (file) => `Exported: ${file}`,
    imported: (cards, recipes) => `Imported: ${cards} card(s) and ${recipes} recipe(s) added`,
    importFailed: 'Import failed: not a valid Prompt Blocks backup file',
    importInvalidEntries: (n) => `${n} unusable entries were skipped`,
    importConfirm: (cards, recipes) => `Will add ${cards} card(s) and ${recipes} recipe(s).`,
    importConfirmCompose: 'Your current composer will be overwritten by the one in the file.',
    importConfirmNoCompose: 'The file has no composer, so your current composer stays as it is.',
    importSkipped: (cards, recipes) => `Skipped ${cards} duplicate card(s) and ${recipes} duplicate recipe(s)`,
    storageFailed: 'Could not write to local storage — your changes may not be saved',
    storageRecovered: 'Local data was corrupted and has been reset; the original was kept in prompt-blocks:v1:corrupt-backup',
    confirmClear: 'This clears custom cards, recipes and the composer, and cannot be undone. Export a backup first?',
    cleared: 'Local data cleared',
    /* 通用弹窗 */
    confirmOk: 'Confirm',
    confirmCancel: 'Cancel',
    /* 错误兜底界面 */
    errorTitle: 'Something broke',
    errorBody: 'Your data is still safely in local storage — nothing was lost. Reloading usually fixes it.',
    errorReload: 'Reload page',
    errorDetails: 'Error details',
    errorReset: 'Reset local data and retry',
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
