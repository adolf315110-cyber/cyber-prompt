import { describe, expect, it } from 'vitest'
import { SCHEMA_VERSION, STORAGE_KEY, defaultCompose, defaultData, loadData, saveData, type StorageLike } from '../lib/storage'

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

  it('setItem 抛错（配额满）时静默降级', () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    expect(() => saveData(defaultData(), storage)).not.toThrow()
  })
})
