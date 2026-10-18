interface Props {
  message: string | null
}

/** 底部轻提示；显示/隐藏时机由 App 控制 */
export function Toast({ message }: Props) {
  if (!message) return null
  return (
    <div className="toast" role="status">
      {message}
    </div>
  )
}
