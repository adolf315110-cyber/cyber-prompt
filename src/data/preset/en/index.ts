import type { CardI18n } from '../../../types'
import { SEC_AUDIT_EN } from './secAudit'
import { PENTEST_EN } from './pentest'
import { CODING_EN } from './coding'
import { OUTPUT_EN } from './output'
import { GENERAL_EN } from './general'

/**
 * 内置卡英译层（键为卡片 id）。
 * zh 界面不使用；en 界面由 src/lib/localize.ts 合并进卡片。
 * 覆盖与字段约束由 src/__tests__/presetCardsEn.test.ts 强制。
 */
export const EN_CARDS: Record<string, CardI18n> = {
  ...SEC_AUDIT_EN,
  ...PENTEST_EN,
  ...CODING_EN,
  ...OUTPUT_EN,
  ...GENERAL_EN,
}
