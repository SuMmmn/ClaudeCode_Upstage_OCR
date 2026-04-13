import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { BarChart2, LayoutDashboard, List, Upload, X } from 'lucide-react'

const navItems = [
  { to: '/',         icon: LayoutDashboard, label: '대시보드' },
  { to: '/upload',   icon: Upload,          label: '영수증 업로드' },
  { to: '/expenses', icon: List,            label: '지출 내역' },
  { to: '/stats',    icon: BarChart2,       label: '통계 분석' },
]

function NavContent({ onClose }) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
        <span className="text-base font-bold text-blue-600">Receipt AI</span>
        {/* 모바일 닫기 버튼 */}
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 lg:hidden"
          aria-label="사이드바 닫기"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="주 메뉴">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              ].join(' ')
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default function Sidebar({ open, onClose }) {
  // 모바일 열림 시 body 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* 데스크탑: 항상 표시 */}
      <div className="hidden lg:flex">
        <NavContent onClose={onClose} />
      </div>

      {/* 모바일: 오버레이 슬라이드 */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* 반투명 배경 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* 사이드바 패널 */}
          <div className="relative z-50 h-full">
            <NavContent onClose={onClose} />
          </div>
        </div>
      )}
    </>
  )
}
