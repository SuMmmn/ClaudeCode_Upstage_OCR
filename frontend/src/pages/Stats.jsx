import { BarChart2 } from 'lucide-react'

export default function Stats() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <BarChart2 className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">통계 분석</h1>
      </div>
      {/* Sprint 4에서 구현: 기간 선택기, BarChart, PieChart, LineChart */}
      <p className="text-gray-500">Sprint 4에서 구현 예정입니다.</p>
    </div>
  )
}
