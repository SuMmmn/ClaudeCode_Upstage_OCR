import { useNavigate } from 'react-router-dom'
import { Menu, Upload } from 'lucide-react'

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:px-6">
      <div className="flex items-center gap-3">
        {/* 모바일 햄버거 버튼 */}
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="사이드바 열기"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="text-base font-semibold text-gray-900 lg:text-lg">
          AI 영수증 지출 관리
        </span>
      </div>

      <button
        onClick={() => navigate('/upload')}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 lg:px-4"
        aria-label="영수증 업로드"
      >
        <Upload className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">영수증 업로드</span>
      </button>
    </header>
  )
}
