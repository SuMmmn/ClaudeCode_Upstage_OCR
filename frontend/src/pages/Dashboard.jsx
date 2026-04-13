import { LayoutDashboard } from 'lucide-react'

export default function Dashboard() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <LayoutDashboard className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
      </div>
      {/* Sprint 4에서 구현: 요약 카드, 월별 차트, 카테고리 파이, 최근 지출 */}
      <p className="text-gray-500">Sprint 4에서 구현 예정입니다.</p>
    </div>
  )
}
