import { Search, X } from 'lucide-react'
import { CATEGORIES } from '../../constants/categories'

export default function FilterBar({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val, page: 1 })
  const reset = () =>
    onChange({ start_date: '', end_date: '', category: '', store_name: '' })
  const hasFilter = Object.entries(filters)
    .filter(([k]) => k !== 'page')
    .some(([, v]) => v)

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">시작일</label>
        <input
          type="date"
          value={filters.start_date}
          onChange={(e) => set('start_date', e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">종료일</label>
        <input
          type="date"
          value={filters.end_date}
          onChange={(e) => set('end_date', e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">카테고리</label>
        <select
          value={filters.category}
          onChange={(e) => set('category', e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">전체</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">상호명</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="검색"
            value={filters.store_name}
            onChange={(e) => set('store_name', e.target.value)}
            className="rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {hasFilter && (
        <button
          onClick={reset}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
          초기화
        </button>
      )}
    </div>
  )
}
