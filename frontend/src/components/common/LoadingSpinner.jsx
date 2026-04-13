/** 스피너 및 Skeleton 컴포넌트 모음 */

export function LoadingSpinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
    </div>
  )
}

/** 테이블 행 Skeleton */
export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded-md bg-gray-100" />
        </td>
      ))}
    </tr>
  )
}

/** 카드 Skeleton */
export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-3 h-3 w-1/3 animate-pulse rounded-md bg-gray-100" />
      <div className="h-7 w-1/2 animate-pulse rounded-md bg-gray-100" />
    </div>
  )
}
