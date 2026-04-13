import { useState } from 'react'
import { List } from 'lucide-react'
import FilterBar from '../components/receipt/FilterBar'
import ReceiptTable from '../components/receipt/ReceiptTable'
import Pagination from '../components/common/Pagination'
import Modal from '../components/common/Modal'
import { useReceipts } from '../hooks/useReceipts'
import { deleteReceipt } from '../api/receipts'
import { useToast } from '../store/ToastContext'

const INIT_FILTERS = { start_date: '', end_date: '', category: '', store_name: '' }

export default function ExpenseList() {
  const toast = useToast()
  const [filters, setFilters] = useState(INIT_FILTERS)
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // 빈 값 제거 후 API 파라미터 구성
  const apiParams = {
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    page,
    limit: 20,
  }

  const { data, loading, error, refetch } = useReceipts(apiParams)

  const handleFilterChange = (next) => {
    setFilters(next)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteReceipt(deleteTarget.id)
      toast(`${deleteTarget.store_name} 영수증이 삭제되었습니다.`, 'success')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <List className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">지출 내역</h1>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <FilterBar filters={filters} onChange={handleFilterChange} />

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">불러오는 중...</div>
        ) : (
          <>
            <ReceiptTable items={data.items} onDelete={setDeleteTarget} />
            <Pagination
              page={page}
              limit={data.limit}
              total={data.total}
              onChange={setPage}
            />
          </>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="영수증 삭제"
      >
        <p className="text-gray-600">
          <span className="font-semibold">{deleteTarget?.store_name}</span> 영수증을
          삭제하시겠습니까?
        </p>
        <p className="mt-1 text-sm text-gray-400">삭제된 데이터는 복구할 수 없습니다.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-40"
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
