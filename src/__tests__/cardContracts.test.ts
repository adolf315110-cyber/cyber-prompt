import { describe, expect, it } from 'vitest'
import { PRESET_CARDS } from '../data/presetCards'
import { EN_CARDS } from '../data/preset/en'

/**
 * 判据契约测试（regression lock）
 *
 * 目的：锁住几张卡里「必须存在的判定标准」，防止后续改文案时被无声软化、删掉或换成空话。
 *
 * 边界（重要）：本测试只证明「判据文字还在」，**不证明「判据在实践中有效」**。
 * 判据是否真的能提升产出质量，只能靠对比实验验证；这里的绿灯不等于已验证。
 *
 * 维护约定：若刻意调整某张卡的判据，请同步更新对应断言。
 * 不要为了让测试变绿而把判据改虚——那正是本测试要拦的事。
 */

const zhById = new Map(PRESET_CARDS.map((c) => [c.id, c]))

function zh(id: string) {
  const card = zhById.get(id)
  if (!card) throw new Error(`卡库缺少 ${id}`)
  return card
}

function en(id: string) {
  const card = EN_CARDS[id]
  if (!card) throw new Error(`英译层缺少 ${id}`)
  return card
}

describe('判据契约 · 中文层', () => {
  it('sec-audit-10：三段式攻击者模型 + 逐环可达 + 闭环否决', () => {
    const { text } = zh('builtin:sec-audit-10')
    // 三段式：谁 → 从哪 → 打谁
    expect(text).toContain('谁')
    expect(text).toContain('从哪')
    expect(text).toContain('打谁')
    // 可达性要拆成具体环节，不能只留"确认可达"四个字
    expect(text).toContain('可达')
    expect(text).toMatch(/暴露面|通道注册|preload|调用点/)
    // 闭环：任一环不成立即否决，不允许留"疑似"
    expect(text).toMatch(/不成立|不算漏洞/)
    // 否决后必须有去处，否则等于让发现凭空消失
    expect(text).toMatch(/待验证|负结论/)
  })

  it('sec-audit-32：只对已定位面反查 + 要求第二条路径 + 反对铺维度', () => {
    const { text } = zh('builtin:sec-audit-32')
    expect(text).toContain('已定位')
    expect(text).toMatch(/第二条路径|第二条/)
    // 反向约束：不得退化成"把维度铺满"
    expect(text).toMatch(/不为铺满|不为.*铺维度/)
  })

  it('output-22：[已验证] 必须点名运行时观测，只读源码封顶 [高置信]', () => {
    const { text } = zh('builtin:output-22')
    expect(text).toContain('已验证')
    expect(text).toContain('运行时观测')
    expect(text).toContain('高置信')
    // 只读源码不得进入定级
    expect(text).toMatch(/不计级|不参与定级/)
    // 观测要给出可核验的具体形态，不能只说"已验证"
    expect(text).toMatch(/请求|响应|日志|复现/)
  })

  it('sec-audit-04：ReDoS 三条判据必须同时满足才算可利用', () => {
    const { text } = zh('builtin:sec-audit-04')
    expect(text).toContain('嵌套量词')
    expect(text).toContain('输入可控')
    expect(text).toMatch(/长度上限|无长度/)
    // 必须是"三条齐了才成立"的合取，不能退化成任一命中
    expect(text).toMatch(/三条|同时|齐/)
  })
})

describe('判据契约 · 英文层必须与中文层同口径', () => {
  it('sec-audit-10：三段式 + 可达环节 + 闭环否决', () => {
    const { text } = en('builtin:sec-audit-10')
    expect(text).toMatch(/who/i)
    expect(text).toMatch(/from where/i)
    expect(text).toMatch(/against whom/i)
    expect(text).toMatch(/reachab/i)
    expect(text).toMatch(/preload|call site|channel registration|exposed/i)
    expect(text).toMatch(/not a vulnerability|any link fails/i)
  })

  it('sec-audit-32：只对已定位面 + 第二条路径 + 反对铺维度', () => {
    const { text } = en('builtin:sec-audit-32')
    expect(text).toMatch(/located/i)
    expect(text).toMatch(/second path/i)
    expect(text).toMatch(/do not fill|for their own sake/i)
  })

  it('output-22：运行时观测 + 高置信封顶', () => {
    const { text } = en('builtin:output-22')
    expect(text).toMatch(/runtime observation/i)
    expect(text).toMatch(/high confidence/i)
    expect(text).toMatch(/must not be rated|not be rated/i)
  })

  it('sec-audit-04：ReDoS 三条判据的合取', () => {
    const { text } = en('builtin:sec-audit-04')
    expect(text).toMatch(/nested quantifier/i)
    expect(text).toMatch(/attacker-controlled|controlled input/i)
    expect(text).toMatch(/no length limit|length limit/i)
    expect(text).toMatch(/all three|three hold/i)
  })
})

/**
 * 中英跨层契约（2026-10-30，agent 提示词落地轮）
 *
 * 背景：仓库的测试能保证英译层"有翻译、无中文、长度合规"，但保证不了**两层语义等价**——
 * 英文把中文写反了，测试照样绿。本组用例把本轮新增/增补的卡的关键判据词在两层同时锁住。
 * 维护约定：改这些卡的文案时，中英两层的关键词必须一起改。
 */
describe('中英跨层契约 · 本轮新增与增补的卡', () => {
  it('output-11 决策记录：两层都要有"决策记录"这件事', () => {
    expect(zh('builtin:output-11').text).toContain('决策记录')
    expect(zh('builtin:output-11').text).toContain('自包含')
    expect(en('builtin:output-11').text).toMatch(/decision log/i)
    expect(en('builtin:output-11').text).toMatch(/self-contained/i)
  })

  it('output-09 按复杂度分档：两层都要有三档', () => {
    expect(zh('builtin:output-09').text).toMatch(/简单.*标准.*(大|复杂)/)
    const enText = en('builtin:output-09').text
    expect(enText).toMatch(/simple change/i)
    expect(enText).toMatch(/standard change/i)
    expect(enText).toMatch(/large change/i)
  })

  it('pentest-02 环境自检：回连自测这条判据两层都在', () => {
    expect(zh('builtin:pentest-02').text).toContain('OOB')
    expect(zh('builtin:pentest-02').text).toContain('未回连')
    const enText = en('builtin:pentest-02').text
    expect(enText).toContain('OOB')
    expect(enText).toMatch(/no OOB/i)
  })

  it('pentest-39 节奏纪律：不重试 + 放弃条件两层都在', () => {
    expect(zh('builtin:pentest-39').text).toContain('重试')
    expect(zh('builtin:pentest-39').text).toContain('放弃条件')
    const enText = en('builtin:pentest-39').text
    expect(enText).toMatch(/re-running the same command/i)
    expect(enText).toMatch(/abandon criteria/i)
  })

  it('general-05：成功标准与放弃条件必须成对出现', () => {
    expect(zh('builtin:general-05').text).toContain('成功标准')
    expect(zh('builtin:general-05').text).toContain('放弃条件')
    const enText = en('builtin:general-05').text
    expect(enText).toMatch(/success criteria/i)
    expect(enText).toMatch(/abandon criteria/i)
  })

  it('逐项观测纪律：置信度标记中英用同一套词', () => {
    for (const id of ['builtin:sec-audit-25', 'builtin:pentest-33']) {
      expect(zh(id).text, id).toContain('[待验证]')
      expect(zh(id).text, id).toContain('汇总')
      expect(en(id).text, id).toContain('[to verify]')
      expect(en(id).text, id).toMatch(/never summarize/i)
    }
  })
})

describe('卡库卫生', () => {
  // 不查 TODO/待补 一类词——卡正文里有正当用法（如要求输出标注未完成项与后续 TODO）。
  // 只查真正会破坏功能的：正文被删空或截断。
  it('每张卡的正文不得为空或被截断', () => {
    for (const card of PRESET_CARDS) {
      expect(card.text.trim().length, `${card.id} 中文正文过短（疑似被删空）`).toBeGreaterThanOrEqual(20)
      expect(card.title.trim().length, `${card.id} 中文标题为空`).toBeGreaterThan(0)
    }
    for (const [id, ov] of Object.entries(EN_CARDS)) {
      expect(ov.text.trim().length, `${id} 英译正文过短（疑似被删空）`).toBeGreaterThanOrEqual(40)
      expect(ov.title.trim().length, `${id} 英译标题为空`).toBeGreaterThan(0)
    }
  })
})
