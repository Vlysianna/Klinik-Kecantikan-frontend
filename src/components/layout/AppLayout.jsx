import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Package, BarChart3, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatters'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    {
      to: '/pos',
      label: 'Kasir (POS)',
      icon: ShoppingCart,
    },
    {
      to: '/products',
      label: 'Manajemen Produk',
      icon: Package,
    },
    {
      to: '/reports',
      label: 'Laporan Harian',
      icon: BarChart3,
    },
  ]

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/pos':
        return {
          title: 'Kasir & Transaksi',
          description: 'Pilih produk klinik, kelola keranjang, dan proses pembayaran transaksi kasir.',
        }
      case '/products':
        return {
          title: 'Manajemen Produk & Layanan',
          description: 'Katalog stok produk skincare, treatment klinik, dan perincian tarif.',
        }
      case '/reports':
        return {
          title: 'Laporan Penjualan Harian',
          description: 'Rekapitulasi omzet klinik, jumlah transaksi, dan rincian transaksi per tanggal.',
        }
      default:
        return {
          title: 'Dr Nich Beauty Clinic',
          description: 'Sistem Kasir & Administrasi Klinik',
        }
    }
  }

  const currentMeta = getPageTitle()
  const todayFormatted = formatDate(new Date().toISOString())

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-800 flex flex-col md:flex-row antialiased">
      <aside className="w-full md:w-60 bg-white border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-zinc-100">
          <div className="font-semibold text-zinc-900 tracking-tight text-sm">
            Dr Nich Beauty Clinic
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Sistem Kasir & Penjualan</div>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          <div className="px-2 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded transition-colors ${isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="p-3 border-t border-zinc-200 bg-zinc-50/50">
          <div className="px-2 py-1.5">
            <p className="text-xs font-semibold text-zinc-800 truncate">
              {user?.name || 'Petugas Kasir'}
            </p>
            <p className="text-[11px] text-zinc-400 truncate">
              {user?.email || 'admin@drnich.com'}
            </p>
          </div>

          <button
            onClick={handleLogout}
            type="button"
            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-rose-700 hover:bg-rose-50/60 rounded border border-zinc-200 hover:border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-zinc-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-zinc-900 tracking-tight">
              {currentMeta.title}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {currentMeta.description}
            </p>
          </div>
          <div className="text-xs text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded border border-zinc-200 self-start sm:self-auto">
            {todayFormatted}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
