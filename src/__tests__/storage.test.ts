import { describe, expect, it } from 'vitest'
import {
  CORRUPT_BACKUP_KEY,
  SCHEMA_VERSION,
  STORAGE_KEY,
  buildExportFile,
  defaultCompose,
  defaultData,
  isCard,
  isRecipe,
  lastLoadCorrupted,
  loadData,
  mergeById,
  parseImportFile,
  saveData,
  type StorageLike,
} from '../lib/storage'
import { USER_CARD_LIMITS } from '../lib/cardUtils'

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  const storage: StorageLike & { map: Map<string, string> } = {
    map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
  }
  return storage
}

describe('defaultCompose / defaultData', () => {
  it('默认拼装状态为空且三槽都是空数组', () => {
    expect(defaultCompose()).toEqual({ baseSentence: '', slots: { prefix: [], suffix: [], block: [] }, manualText: null })
  })
  it('默认数据带当前 schemaVersion', () => {
    expect(defaultData().schemaVersion).toBe(SCHEMA_VERSION)
  })
})

describe('loadData / saveData', () => {
  it('空存储返回默认值', () => {
    expect(loadData(fakeStorage())).toEqual(defaultData())
  })

  it('saveData 后 loadData 能往返（含拼装状态）', () => {
    const storage = fakeStorage()
    const data = defaultData()
    data.compose.baseSentence = '帮我审计这段代码'
    data.compose.slots.prefix = [{ instanceId: 'i1', cardId: 'builtin:general-01', vars: {}, enabled: true }]
    saveData(data, storage)
    expect(loadData(storage)).toEqual(data)
  })

  it('存储内容不是合法 JSON 时回退默认值', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: '{不是 JSON' })
    expect(loadData(storage)).toEqual(defaultData())
  })

  it('schemaVersion 不匹配时回退默认值（迁移占位）', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify({ ...defaultData(), schemaVersion: 999 }) })
    expect(loadData(storage)).toEqual(defaultData())
  })

  it('compose 结构损坏时回退默认值', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify({ ...defaultData(), compose: { baseSentence: 1 } }) })
    expect(loadData(storage)).toEqual(defaultData())
  })

  it('storage 不可用（null）时读写都不抛错', () => {
    expect(loadData(null)).toEqual(defaultData())
    expect(() => saveData(defaultData(), null)).not.toThrow()
  })

  it('迁移：旧版本焊在实例里的默认值被清空（老数据在英文界面也不该拼出中文）', () => {
    // builtin:general-20 的中文层默认值是「中文」、英文层是「English」
    const data = defaultData()
    data.compose.slots.block = [{ instanceId: 'i1', cardId: 'builtin:general-20', vars: { 语言: '中文' }, enabled: true }]
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify(data) })
    const loaded = loadData(storage)
    expect(loaded.compose.slots.block[0].vars).toEqual({ 语言: '' })
  })

  it('迁移：英文层默认值同样被清空（反向）', () => {
    const data = defaultData()
    data.compose.slots.block = [{ instanceId: 'i1', cardId: 'builtin:general-20', vars: { 语言: 'English' }, enabled: true }]
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify(data) })
    expect(loadData(storage).compose.slots.block[0].vars).toEqual({ 语言: '' })
  })

  it('迁移：用户自己填的值不动', () => {
    const data = defaultData()
    data.compose.slots.block = [{ instanceId: 'i1', cardId: 'builtin:general-20', vars: { 语言: 'Rust' }, enabled: true }]
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify(data) })
    expect(loadData(storage).compose.slots.block[0].vars).toEqual({ 语言: 'Rust' })
  })

  it('迁移：配方条目里焊死的默认值也被清空', () => {
    const data = defaultData()
    data.recipes = [
      {
        id: 'r1',
        name: '配方',
        baseSentence: '',
        items: [{ cardId: 'builtin:general-20', vars: { 语言: '中文' }, enabled: true }],
      },
    ]
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify(data) })
    expect(loadData(storage).recipes[0].items[0].vars).toEqual({ 语言: '' })
  })

  it('迁移：非预置卡（用户卡）的值不动', () => {
    const data = defaultData()
    data.compose.slots.block = [{ instanceId: 'i1', cardId: 'user:x', vars: { 语言: '中文' }, enabled: true }]
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify(data) })
    expect(loadData(storage).compose.slots.block[0].vars).toEqual({ 语言: '中文' })
  })

  it('setItem 抛错（配额满）时静默降级', () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    expect(() => saveData(defaultData(), storage)).not.toThrow()
  })

  it('saveData 返回是否写入成功（UI 靠它提示"可能没保存"）', () => {
    expect(saveData(defaultData(), fakeStorage())).toBe(true)
    expect(saveData(defaultData(), null)).toBe(false)
    const failing: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    expect(saveData(defaultData(), failing)).toBe(false)
  })

  it('存储内容损坏 → 回退默认值，并把原始内容另存备份（不丢数据）', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: '{坏掉的 JSON' })
    expect(loadData(storage)).toEqual(defaultData())
    expect(storage.getItem(CORRUPT_BACKUP_KEY)).toBe('{坏掉的 JSON')
    expect(lastLoadCorrupted()).toBe(true)
  })

  it('结构损坏（不是合法 JSON 对象）同样走备份', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify({ schemaVersion: 1 }) })
    loadData(storage)
    expect(storage.getItem(CORRUPT_BACKUP_KEY)).toBeTruthy()
  })

  it('正常读取不会标记为损坏', () => {
    const storage = fakeStorage()
    loadData(storage)
    expect(lastLoadCorrupted()).toBe(false)
  })

  it('用户卡 / 配方元素形状不对 → 判为损坏并备份（渲染期会崩）', () => {
    const badCard = {
      schemaVersion: 1,
      userCards: [{ id: 'user:1', category: 'general', title: '缺 vars 的卡', text: 'x', mode: 'suffix', tags: [] }],
      recipes: [],
      compose: { baseSentence: '', slots: { prefix: [], suffix: [], block: [] }, manualText: null },
    }
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify(badCard) })
    expect(loadData(storage)).toEqual(defaultData())
    expect(storage.getItem(CORRUPT_BACKUP_KEY)).toBeTruthy()
    expect(lastLoadCorrupted()).toBe(true)
  })
})

describe('buildExportFile（导出）', () => {
  it('带 app 标识与导出时间，只含用户卡（不含预置卡）', () => {
    const data = defaultData()
    data.userCards = [
      { id: 'user:1', category: 'general', title: '我的卡', text: '内容', mode: 'suffix', vars: [], tags: ['x'], builtin: false },
    ]
    data.recipes = [{ id: 'r1', name: '配方', baseSentence: '基础', items: [] }]
    const file = buildExportFile(data, '2026-10-28T00:00:00.000Z')
    expect(file.app).toBe('prompt-blocks')
    expect(file.exportedAt).toBe('2026-10-28T00:00:00.000Z')
    expect(file.schemaVersion).toBe(SCHEMA_VERSION)
    expect(file.cards).toHaveLength(1)
    expect(file.recipes).toHaveLength(1)
    expect(file.compose).toEqual(data.compose)
  })
})

describe('parseImportFile（导入解析）', () => {
  const valid = {
    schemaVersion: 1,
    app: 'prompt-blocks',
    exportedAt: '2026-10-28T00:00:00.000Z',
    cards: [{ id: 'user:1', category: 'general', title: '卡', text: '内容', mode: 'suffix', vars: [], tags: ['x'], builtin: false }],
    recipes: [{ id: 'r1', name: '配方', baseSentence: '基础', items: [] }],
    compose: { baseSentence: '拼装', slots: { prefix: [], suffix: [], block: [] }, manualText: null },
  }

  it('合法文件解析成功', () => {
    const r = parseImportFile(JSON.stringify(valid))
    expect(r.ok).toBe(true)
    expect(r.cards).toHaveLength(1)
    expect(r.recipes).toHaveLength(1)
    expect(r.compose?.baseSentence).toBe('拼装')
    expect(r.invalid).toBe(0)
  })

  it('不是 JSON → notJson', () => {
    expect(parseImportFile('{不是 JSON').error).toBe('notJson')
  })

  it('顶层是数组 → badShape', () => {
    expect(parseImportFile('[]').error).toBe('badShape')
  })

  it('app 标记不认识 → badShape（不是本工具的备份）', () => {
    expect(parseImportFile(JSON.stringify({ ...valid, app: 'other-tool' })).error).toBe('badShape')
  })

  it('schemaVersion 不匹配 → versionMismatch', () => {
    expect(parseImportFile(JSON.stringify({ ...valid, schemaVersion: 999 })).error).toBe('versionMismatch')
  })

  it('形状不合法的卡被丢弃并计数，不整份失败', () => {
    const r = parseImportFile(
      JSON.stringify({ ...valid, cards: [...valid.cards, { id: 'user:2', title: '缺字段' }, null, 42] }),
    )
    expect(r.ok).toBe(true)
    expect(r.cards).toHaveLength(1)
    expect(r.invalid).toBe(3)
  })

  it('compose 结构损坏 → compose 为 null（导入方回退默认值）', () => {
    const r = parseImportFile(JSON.stringify({ ...valid, compose: { baseSentence: 1 } }))
    expect(r.ok).toBe(true)
    expect(r.compose).toBeNull()
  })

  it('缺少 cards/recipes 字段 → 当空数组处理', () => {
    const r = parseImportFile(JSON.stringify({ app: 'prompt-blocks', schemaVersion: 1 }))
    expect(r.ok).toBe(true)
    expect(r.cards).toEqual([])
    expect(r.recipes).toEqual([])
  })

  it('拒绝文件里冒牌的预置卡（id 以 builtin: 开头）', () => {
    const fake = { ...valid.cards[0], id: 'builtin:sec-audit-01', builtin: true }
    const r = parseImportFile(JSON.stringify({ ...valid, cards: [...valid.cards, fake] }))
    expect(r.ok).toBe(true)
    expect(r.cards.map((c) => c.id)).toEqual(['user:1'])
    expect(r.invalid).toBe(1)
  })

  it('导入的用户卡一律视为自定义卡（builtin 强制为 false）', () => {
    const spoof = { ...valid.cards[0], id: 'user:spoof', builtin: true }
    const r = parseImportFile(JSON.stringify({ ...valid, cards: [spoof] }))
    expect(r.cards[0].builtin).toBe(false)
  })

  it('导入卡的正文折成单行（与编辑器同一套规则）', () => {
    const multi = { ...valid.cards[0], id: 'user:multi', text: '第一行\n第二行' }
    const r = parseImportFile(JSON.stringify({ ...valid, cards: [multi] }))
    expect(r.cards[0].text).toBe('第一行 第二行')
  })

  it('导入卡的变量按正文重新推导，正文里没有的变量被丢弃', () => {
    const card = {
      ...valid.cards[0],
      id: 'user:v',
      text: '用 {语言} 审计',
      vars: [
        { name: '语言', default: 'Java' },
        { name: '不存在的变量', default: 'x' },
      ],
    }
    const r = parseImportFile(JSON.stringify({ ...valid, cards: [card] }))
    expect(r.cards[0].vars).toEqual([{ name: '语言', default: 'Java' }])
  })

  it('手改过的备份缺 builtin 字段 → 补上后正常导入', () => {
    const noBuiltin = { ...valid.cards[0] }
    delete (noBuiltin as { builtin?: boolean }).builtin
    const r = parseImportFile(JSON.stringify({ ...valid, cards: [noBuiltin] }))
    expect(r.ok).toBe(true)
    expect(r.cards).toHaveLength(1)
    expect(r.cards[0].builtin).toBe(false)
  })

  it('导入卡不满足写作标准（标题超长 / 标签过多）→ 丢弃并计数', () => {
    // 超长标题的阈值取自 USER_CARD_LIMITS：写死数字会在限值调整后失效
    const longTitle = { ...valid.cards[0], id: 'user:long', title: 'x'.repeat(USER_CARD_LIMITS.titleMax + 1) }
    const manyTags = { ...valid.cards[0], id: 'user:tags', tags: ['1', '2', '3', '4', '5'] }
    const r = parseImportFile(JSON.stringify({ ...valid, cards: [longTitle, manyTags] }))
    expect(r.cards).toEqual([])
    expect(r.invalid).toBe(2)
  })

  it('拼装区里有字段不全的实例 → 整段判为无效（避免渲染时崩）', () => {
    const badCompose = {
      ...valid.compose,
      slots: { prefix: [{ instanceId: 'i1', cardId: 'c1' }], suffix: [], block: [] },
    }
    const r = parseImportFile(JSON.stringify({ ...valid, compose: badCompose }))
    expect(r.ok).toBe(true)
    expect(r.compose).toBeNull()
  })

  it('拼装区里的实例字段齐全 → 正常保留', () => {
    const okCompose = {
      ...valid.compose,
      slots: { prefix: [{ instanceId: 'i1', cardId: 'c1', vars: {}, enabled: true }], suffix: [], block: [] },
    }
    const r = parseImportFile(JSON.stringify({ ...valid, compose: okCompose }))
    expect(r.compose?.slots.prefix).toHaveLength(1)
  })

  it('变量值不是字符串 → 拼装区整段判为无效（渲染期会崩）', () => {
    const badVars = {
      ...valid.compose,
      slots: { prefix: [{ instanceId: 'i1', cardId: 'c1', vars: { lang: 5 }, enabled: true }], suffix: [], block: [] },
    }
    const r = parseImportFile(JSON.stringify({ ...valid, compose: badVars }))
    expect(r.compose).toBeNull()
  })

  it('配方里的变量值不是字符串 → 该配方被丢弃', () => {
    const badRecipe = {
      id: 'r1',
      name: '配方',
      baseSentence: '基础',
      items: [{ cardId: 'c1', vars: { lang: 5 }, enabled: true }],
    }
    const r = parseImportFile(JSON.stringify({ ...valid, recipes: [badRecipe] }))
    expect(r.recipes).toEqual([])
    expect(r.invalid).toBe(1)
  })

  it('没有 app / schemaVersion 的 JSON 一律拒绝（不是本工具的备份）', () => {
    expect(parseImportFile('{}').ok).toBe(false)
    expect(parseImportFile('{"hello":"world"}').ok).toBe(false)
    expect(parseImportFile(JSON.stringify({ cards: [] })).ok).toBe(false)
    expect(parseImportFile(JSON.stringify({ app: 'prompt-blocks' })).error).toBe('versionMismatch')
  })

  it('配方名为空 → 丢弃（避免出现无名空白 chip）', () => {
    const noName = { id: 'r1', name: '   ', baseSentence: '基础', items: [] }
    const r = parseImportFile(JSON.stringify({ ...valid, recipes: [noName] }))
    expect(r.recipes).toEqual([])
  })

  it('配方条目的 mode 非法 → 整个配方丢弃（否则还原时会拿它当下标用而抛错）', () => {
    for (const badMode of ['garbage', '', 0, '__proto__', 'constructor']) {
      const dirty = {
        id: 'r1',
        name: '配方',
        baseSentence: '基础',
        items: [{ cardId: 'c1', vars: {}, enabled: true, mode: badMode }],
      }
      const r = parseImportFile(JSON.stringify({ ...valid, recipes: [dirty] }))
      expect(r.recipes, `mode=${String(badMode)}`).toEqual([])
    }
  })

  it('配方条目的 mode 合法（prefix/suffix/block）→ 正常保留', () => {
    for (const mode of ['prefix', 'suffix', 'block']) {
      const ok = {
        id: 'r1',
        name: '配方',
        baseSentence: '基础',
        items: [{ cardId: 'c1', vars: {}, enabled: true, mode }],
      }
      const r = parseImportFile(JSON.stringify({ ...valid, recipes: [ok] }))
      expect(r.recipes, `mode=${mode}`).toHaveLength(1)
    }
  })

  it('变量表是数组 → 不算合法变量表', () => {
    const arrVars = { id: 'r1', name: '配方', baseSentence: '基础', items: [{ cardId: 'c1', vars: [], enabled: true }] }
    const r = parseImportFile(JSON.stringify({ ...valid, recipes: [arrVars] }))
    expect(r.recipes).toEqual([])
  })
})

describe('mergeById（按 id 合并）', () => {
  it('新 id 追加，已存在的 id 跳过并计数', () => {
    const existing = [{ id: 'a' }, { id: 'b' }]
    const incoming = [{ id: 'b' }, { id: 'c' }]
    const { merged, skipped } = mergeById(existing, incoming)
    expect(merged.map((x) => x.id)).toEqual(['a', 'b', 'c'])
    expect(skipped).toBe(1)
  })

  it('不修改入参', () => {
    const existing = [{ id: 'a' }]
    const incoming = [{ id: 'a' }]
    mergeById(existing, incoming)
    expect(existing).toEqual([{ id: 'a' }])
    expect(incoming).toEqual([{ id: 'a' }])
  })

  it('空 incoming → 原样返回，skipped 为 0', () => {
    const existing = [{ id: 'a' }]
    const { merged, skipped } = mergeById(existing, [])
    expect(merged).toEqual(existing)
    expect(skipped).toBe(0)
  })
})

describe('isCard / isRecipe 结构守卫', () => {
  it('分类非法的卡不算合法卡', () => {
    expect(
      isCard({ id: 'u', category: 'unknown', title: 't', text: 'x', mode: 'suffix', vars: [], tags: [], builtin: false }),
    ).toBe(false)
  })

  it('mode 非法的卡不算合法卡', () => {
    expect(
      isCard({ id: 'u', category: 'general', title: 't', text: 'x', mode: 'middle', vars: [], tags: [], builtin: false }),
    ).toBe(false)
  })

  it('builtin 不是布尔值 → 不合法', () => {
    expect(
      isCard({ id: 'u', category: 'general', title: 't', text: 'x', mode: 'suffix', vars: [], tags: [], builtin: 'yes' }),
    ).toBe(false)
  })

  it('变量名为空串 → 不合法', () => {
    expect(
      isCard({
        id: 'u',
        category: 'general',
        title: 't',
        text: 'x',
        mode: 'suffix',
        vars: [{ name: '' }],
        tags: [],
        builtin: false,
      }),
    ).toBe(false)
  })

  it('变量的 default 不是字符串 → 不合法（会在渲染期让 .trim() 抛错）', () => {
    expect(
      isCard({
        id: 'u',
        category: 'general',
        title: 't',
        text: 'x',
        mode: 'suffix',
        vars: [{ name: '语言', default: 123 }],
        tags: [],
        builtin: false,
      }),
    ).toBe(false)
    expect(
      isCard({
        id: 'u',
        category: 'general',
        title: 't',
        text: 'x',
        mode: 'suffix',
        vars: [{ name: '语言', default: {} }],
        tags: [],
        builtin: false,
      }),
    ).toBe(false)
  })

  it('items 形状不对的配方不合法', () => {
    expect(isRecipe({ id: 'r', name: 'n', baseSentence: 'b', items: [{ cardId: 'c' }] })).toBe(false)
  })

  it('合法卡与合法配方通过', () => {
    expect(
      isCard({ id: 'u', category: 'general', title: 't', text: 'x', mode: 'suffix', vars: [], tags: [], builtin: false }),
    ).toBe(true)
    expect(isRecipe({ id: 'r', name: 'n', baseSentence: 'b', items: [{ cardId: 'c', vars: {}, enabled: true }] })).toBe(true)
  })
})
