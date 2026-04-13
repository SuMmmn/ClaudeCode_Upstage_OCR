import { NavLink } from 'react-router-dom'
import { BarChart2, LayoutDashboard, List, Upload } from 'lucide-react'

const navItems = [
  { to: '/',         icon: LayoutDashboard, label: '대시보드' },
  { to: '/upload',   icon: Upload,          label: '영수증 업로드' },
  { to: '/expenses', icon: List,            label: '지출 내역' },
  { to: '/stats',    icon: BarChart2,       label: '통계 분석' },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
      {/* 로고 영역 */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <span className="text-base font-bold text-blue-600">Receipt AI</span>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              ].join(' ')
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
