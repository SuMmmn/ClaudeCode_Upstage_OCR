import { useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold text-gray-900">
          AI 영수증 지출 관리
        </span>
      </div>

      <button
        onClick={() => navigate('/upload')}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <Upload className="h-4 w-4" />
        영수증 업로드
      </button>
    </header>
  )
}
