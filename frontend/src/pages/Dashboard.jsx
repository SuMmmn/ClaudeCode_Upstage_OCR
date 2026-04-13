import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Receipt, TrendingUp, Upload, Wallet } from 'lucide-react'
import MonthlyBarChart from '../components/charts/MonthlyBarChart'
import CategoryPieChart from '../components/charts/CategoryPieChart'
import { SkeletonCard } from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { useStats } from '../hooks/useStats'
import { useReceipts } from '../hooks/useReceipts'
import { CATEGORY_STYLES } from '../constants/categories'

const fmtKRW = (v) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(v ?? 0)

// 이번 달 start
function thisMonthStart() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()

  const monthParams = { start_date: thisMonthStart(), end_date: today() }
  const { data: stats, loading: statsLoading } = useStats(monthParams)
  const { data: allStats } = useStats({})
  const { data: recent, loading: recentLoading } = useReceipts({ page: 1, limit: 5 })

  // 가장 많이 쓴 카테고리
  const topCategory = stats?.by_category?.[0]?.category ?? '—'

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <LayoutDashboard className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
      </div>

      {/* 요약 카드 3종 */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {statsLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <SummaryCard
              icon={Wallet}
              label="이번 달 지출"
              value={fmtKRW(stats?.total_amount)}
              color="bg-blue-500"
            />
            <SummaryCard
              icon={Receipt}
              label="이번 달 영수증"
              value={`${stats?.by_day?.length ?? 0}건`}
              color="bg-emerald-500"
            />
            <SummaryCard
              icon={TrendingUp}
              label="주요 지출 카테고리"
              value={topCategory}
              color="bg-purple-500"
            />
          </>
        )}
      </div>

      {/* 차트 영역 */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">월별 지출 추이</h2>
          <MonthlyBarChart data={allStats?.by_month} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">카테고리별 지출</h2>
          <CategoryPieChart data={allStats?.by_category} />
        </div>
      </div>

      {/* 최근 지출 5건 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">최근 지출</h2>
          <button
            onClick={() => navigate('/expenses')}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            전체 보기
          </button>
        </div>

        {recentLoading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : recent?.items?.length > 0 ? (
          <ul className="divide-y divide-gray-50">
            {recent.items.map((r) => (
              <li
                key={r.id}
                className="flex cursor-pointer items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg transition-colors"
                onClick={() => navigate(`/expenses/${r.id}`)}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      CATEGORY_STYLES[r.category] ?? CATEGORY_STYLES['기타']
                    }`}
                  >
                    {r.category || '미분류'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{r.store_name}</span>
                  <span className="text-xs text-gray-400">{r.date}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {fmtKRW(r.total_amount)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Upload}
            title="등록된 영수증이 없습니다."
            description="첫 번째 영수증을 업로드해 보세요."
            action={
              <button
                onClick={() => navigate('/upload')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                영수증 업로드하기
              </button>
            }
          />
        )}
      </div>
    </div>
  )
}
