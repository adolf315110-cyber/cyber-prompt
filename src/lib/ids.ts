/** 生成带前缀的唯一 id：优先 crypto.randomUUID，环境不支持时降级 */
export function newId(prefix: string): string {
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
  return `${prefix}:${uuid}`
}
