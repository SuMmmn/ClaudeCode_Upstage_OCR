import { FileX } from 'lucide-react'

/**
 * 데이터 없음 상태 컴포넌트
 *
 * @param {React.ElementType} icon      - lucide 아이콘 (기본: FileX)
 * @param {string}            title     - 주 메시지
 * @param {string}            [description] - 보조 메시지
 * @param {React.ReactNode}   [action]  - CTA 버튼 등
 */
export default function EmptyState({
  icon: Icon = FileX,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Icon className="h-8 w-8 text-gray-400" aria-hidden="true" />
      </div>
      <p className="text-base font-medium text-gray-600">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-gray-400">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
