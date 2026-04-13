import { useNavigate } from 'react-router-dom'
import { Trash2, Upload } from 'lucide-react'
import { CATEGORY_STYLES } from '../../constants/categories'
import { SkeletonRow } from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'

const fmt = (amount) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)

export default function ReceiptTable({ items, loading, onDelete }) {
  const navigate = useNavigate()

  if (!loading && !items.length) {
    return (
      <EmptyState
        icon={Upload}
        title="등록된 영수증이 없습니다."
        description="영수증을 업로드하면 이곳에 표시됩니다."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">날짜</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">상호명</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">카테고리</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">금액</th>
            <th className="w-10 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
            : items.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer transition-colors hover:bg-blue-50/40"
                  onClick={() => navigate(`/expenses/${r.id}`)}
                >
                  <td className="px-4 py-3 text-gray-500">{r.date}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.store_name}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        CATEGORY_STYLES[r.category] ?? CATEGORY_STYLES['기타']
                      }`}
                    >
                      {r.category || '미분류'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {fmt(r.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(r) }}
                      className="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500"
                      aria-label={`${r.store_name} 삭제`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}
