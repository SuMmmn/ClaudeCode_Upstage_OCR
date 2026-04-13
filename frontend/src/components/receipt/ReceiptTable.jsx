import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { CATEGORY_STYLES } from '../../constants/categories'

const fmt = (amount) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)

export default function ReceiptTable({ items, onDelete }) {
  const navigate = useNavigate()

  if (!items.length) {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 py-16 text-center">
        <p className="text-sm text-gray-400">등록된 영수증이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            {['날짜', '상호명', '카테고리', '금액', ''].map((h, i) => (
              <th
                key={i}
                className={`px-4 py-3 text-xs font-medium text-gray-500 ${i >= 2 ? 'text-right' : 'text-left'} ${i === 4 ? 'w-10' : ''}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((r) => (
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
                  aria-label="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
