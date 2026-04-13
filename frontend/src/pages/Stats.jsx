import { useState } from 'react'
import { BarChart2 } from 'lucide-react'
import MonthlyBarChart from '../components/charts/MonthlyBarChart'
import CategoryPieChart from '../components/charts/CategoryPieChart'
import DailyLineChart from '../components/charts/DailyLineChart'
import { useStats } from '../hooks/useStats'

const fmtKRW = (v) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(v ?? 0)

// 오늘 기준 날짜 계산 헬퍼
function offsetDate(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const PRESETS = [
  { label: '최근 7일', start: offsetDate(-6), end: offsetDate(0) },
  {
    label: '이번 달',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10),
    end: offsetDate(0),
  },
  { label: '최근 3개월', start: offsetDate(-89), end: offsetDate(0) },
  { label: '전체', start: '', end: '' },
]

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-700">{title}</h2>
      {children}
    </div>
  )
}

export default function Stats() {
  const [preset, setPreset] = useState(1) // 이번 달 기본값
  const [custom, setCustom] = useState({ start: '', end: '' })
  const [useCustom, setUseCustom] = useState(false)

  const params =
    useCustom
      ? Object.fromEntries(
          Object.entries({ start_date: custom.start, end_date: custom.end }).filter(
            ([, v]) => v,
          ),
        )
      : Object.fromEntries(
          Object.entries({
            start_date: PRESETS[preset].start,
            end_date: PRESETS[preset].end,
          }).filter(([, v]) => v),
        )

  const { data, loading, error } = useStats(params)

  const selectPreset = (idx) => {
    setPreset(idx)
    setUseCustom(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <BarChart2 className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">통계 분석</h1>
      </div>

      {/* 기간 선택기 */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => selectPreset(i)}
            className={[
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              !useCustom && preset === i
                ? 'bg-blue-600 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
            ].join(' ')}
          >
            {p.label}
          </button>
        ))}

        {/* 직접 입력 */}
        <div className="flex items-end gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">시작일</label>
            <input
              type="date"
              value={custom.start}
              onChange={(e) => {
                setCustom((p) => ({ ...p, start: e.target.value }))
                setUseCustom(true)
              }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <span className="pb-2.5 text-gray-400">—</span>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">종료일</label>
            <input
              type="date"
              value={custom.end}
              onChange={(e) => {
                setCustom((p) => ({ ...p, end: e.target.value }))
                setUseCustom(true)
              }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {/* 합계 카드 */}
      {data && (
        <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-6 py-4">
          <p className="text-xs font-medium text-blue-400">기간 합계</p>
          <p className="mt-0.5 text-2xl font-bold text-blue-700">
            {fmtKRW(data.total_amount)}
          </p>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400">불러오는 중...</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="월별 지출">
            <MonthlyBarChart data={data?.by_month} />
          </ChartCard>

          <ChartCard title="카테고리별 비율">
            <CategoryPieChart data={data?.by_category} />
          </ChartCard>

          <div className="lg:col-span-2">
            <ChartCard title="일별 지출 추이">
              <DailyLineChart data={data?.by_day} />
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  )
}
