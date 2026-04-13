import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './store/ToastContext'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import ExpenseList from './pages/ExpenseList'
import ExpenseDetail from './pages/ExpenseDetail'
import Stats from './pages/Stats'

function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/expenses/:id" element={<ExpenseDetail />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </BrowserRouter>
  )
}
