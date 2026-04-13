import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit2, Image, Save, Trash2, X } from 'lucide-react'
import Modal from '../components/common/Modal'
import { useReceiptDetail } from '../hooks/useReceiptDetail'
import { useToast } from '../store/ToastContext'
import { CATEGORIES, CATEGORY_STYLES } from '../constants/categories'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const fmt = (amount) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)

function Field({ label, children }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-gray-400">{label}</p>
      {children}
    </div>
  )
}

export default function ExpenseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { receipt, loading, error, update, remove } = useReceiptDetail(id)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const startEdit = () => {
    setForm({
      store_name: receipt.store_name,
      date: receipt.date,
      total_amount: receipt.total_amount,
      category: receipt.category || '',
      items: receipt.items.map((it) => ({ ...it })),
    })
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setForm(null)
  }

  const setFormField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

  const setItemField = (idx, key, val) => {
    setForm((prev) => {
      const items = [...prev.items]
      items[idx] = { ...items[idx], [key]: val }
      return { ...prev, items }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await update({
        store_name: form.store_name,
        date: form.date,
        total_amount: Number(form.total_amount),
        category: form.category || null,
        items: form.items.map((it) => ({
          item_name: it.item_name,
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
          total_price: Number(it.total_price),
        })),
      })
      toast('저장되었습니다.', 'success')
      setEditing(false)
      setForm(null)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await remove()
      toast('영수증이 삭제되었습니다.', 'success')
      navigate('/expenses')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-400">불러오는 중...</div>
  }
  if (error) {
    return <div className="py-20 text-center text-sm text-red-500">{error}</div>
  }
  if (!receipt) return null

  const view = editing ? form : receipt

  return (
    <div className="mx-auto max-w-3xl">
      {/* 상단 액션 바 */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/expenses')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </button>

        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
              >
                <Save className="h-4 w-4" />
                {saving ? '저장 중...' : '저장'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <Edit2 className="h-4 w-4" />
                수정
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      {/* 영수증 정보 카드 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <Field label="상호명">
            {editing ? (
              <input
                value={form.store_name}
                onChange={(e) => setFormField('store_name', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <span className="font-semibold text-gray-900">{receipt.store_name}</span>
            )}
          </Field>

          <Field label="날짜">
            {editing ? (
              <input
                type="date"
                value={form.date}
                onChange={(e) => setFormField('date', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <span className="text-gray-700">{receipt.date}</span>
            )}
          </Field>

          <Field label="카테고리">
            {editing ? (
              <select
                value={form.category}
                onChange={(e) => setFormField('category', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">선택 안 함</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  CATEGORY_STYLES[receipt.category] ?? CATEGORY_STYLES['기타']
                }`}
              >
                {receipt.category || '미분류'}
              </span>
            )}
          </Field>

          <Field label="합계 금액">
            {editing ? (
              <input
                type="number"
                value={form.total_amount}
                onChange={(e) => setFormField('total_amount', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <span className="font-semibold text-blue-600">{fmt(receipt.total_amount)}</span>
            )}
          </Field>
        </div>

        {receipt.image_path && (
          <button
            onClick={() => setShowImage(true)}
            className="mt-5 flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <Image className="h-4 w-4" />
            원본 영수증 보기
          </button>
        )}
      </div>

      {/* 항목 목록 */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">구매 항목</h2>

        {view.items?.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400">
                <th className="pb-2 text-left font-medium">상품명</th>
                <th className="pb-2 text-right font-medium">수량</th>
                <th className="pb-2 text-right font-medium">단가</th>
                <th className="pb-2 text-right font-medium">합계</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {view.items.map((item, idx) => (
                <tr key={item.id ?? idx}>
                  <td className="py-2.5">
                    {editing ? (
                      <input
                        value={item.item_name}
                        onChange={(e) => setItemField(idx, 'item_name', e.target.value)}
                        className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      item.item_name
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    {editing ? (
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => setItemField(idx, 'quantity', e.target.value)}
                        className="w-16 rounded border border-gray-200 px-2 py-1 text-right text-sm focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>
                  <td className="py-2.5 text-right text-gray-500">
                    {editing ? (
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => setItemField(idx, 'unit_price', e.target.value)}
                        className="w-28 rounded border border-gray-200 px-2 py-1 text-right text-sm focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      fmt(item.unit_price)
                    )}
                  </td>
                  <td className="py-2.5 text-right font-medium text-gray-900">
                    {editing ? (
                      <input
                        type="number"
                        value={item.total_price}
                        onChange={(e) => setItemField(idx, 'total_price', e.target.value)}
                        className="w-28 rounded border border-gray-200 px-2 py-1 text-right text-sm focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      fmt(item.total_price)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-400">항목 정보가 없습니다.</p>
        )}
      </div>

      {/* 이미지 확대 모달 */}
      <Modal open={showImage} onClose={() => setShowImage(false)} title="원본 영수증" size="xl">
        <img
          src={`${API_BASE}/${receipt.image_path}`}
          alt="영수증 원본"
          className="max-h-[70vh] w-full object-contain"
        />
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="영수증 삭제"
      >
        <p className="text-gray-600">이 영수증을 삭제하시겠습니까?</p>
        <p className="mt-1 text-sm text-gray-400">삭제된 데이터는 복구할 수 없습니다.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleDelete}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            삭제
          </button>
        </div>
      </Modal>
    </div>
  )
}
