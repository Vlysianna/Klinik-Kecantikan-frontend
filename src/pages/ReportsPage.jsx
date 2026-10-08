import { useState, useEffect } from 'react'
import { reportApi } from '../api/reports'
import {
  formatRupiah,
  getTodayDateString,
  formatDate,
  formatDateTime,
  formatTime,
} from '../utils/formatters'

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString())
  const [reportData, setReportData] = useState({
    date: getTodayDateString(),
    total_omzet: 0,
    total_transactions: 0,
    transactions: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTransaction, setActiveTransaction] = useState(null)

  const fetchDailyReport = async (date) => {
    try {
      setLoading(true)
      setError(null)
      const res = await reportApi.getDailyReport(date)
      const data = res.data || res
      setReportData({
        date: data.date || date,
        total_omzet: Number(data.total_omzet) || 0,
        total_transactions: Number(data.total_transactions) || 0,
        transactions: data.transactions || [],
      })
    } catch (err) {
      setError(
        err.response?.data?.message || 'Gagal memuat data laporan harian.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDailyReport(selectedDate)
  }, [selectedDate])

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
  }

  const setDateToToday = () => {
    setSelectedDate(getTodayDateString())
  }

  const averageTicket =
    reportData.total_transactions > 0
      ? reportData.total_omzet / reportData.total_transactions
      : 0

  return (
    <div className="space-y-6">
      <div className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
            Rekapitulasi Penjualan Harian
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Laporan transaksi kasir per tanggal {formatDate(selectedDate)}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <label htmlFor="report-date" className="text-xs font-medium text-zinc-600">
            Tanggal:
          </label>
          <input
            id="report-date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
          />
          {selectedDate !== getTodayDateString() && (
            <button
              type="button"
              onClick={setDateToToday}
              className="px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 rounded cursor-pointer"
            >
              Hari Ini
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex justify-between items-center">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchDailyReport(selectedDate)}
            className="underline font-medium cursor-pointer"
          >
            Coba lagi
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Total Omzet Penjualan
          </div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1.5 tracking-tight">
            {formatRupiah(reportData.total_omzet)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Pendapatan kotor pada tanggal terpilih
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Jumlah Transaksi
          </div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1.5 tracking-tight">
            {reportData.total_transactions}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Total nota faktur yang berhasil dibayar
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Rata-rata Nilai Transaksi
          </div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1.5 tracking-tight">
            {formatRupiah(averageTicket)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Rerata belanja per struk kasir
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
            Daftar Faktur Pembayaran ({reportData.transactions.length})
          </h3>
          <span className="text-xs text-zinc-400">
            {formatDate(selectedDate)}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-zinc-400">
            Memuat data transaksi...
          </div>
        ) : reportData.transactions.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-400">
            Tidak ada transaksi kasir pada tanggal {formatDate(selectedDate)}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-medium">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nomor Faktur</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4 text-center">Jumlah Item</th>
                  <th className="py-3 px-4 text-right">Total Transaksi</th>
                  <th className="py-3 px-4 text-right w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {reportData.transactions.map((tx, index) => {
                  const itemCount = (tx.transaction_details || []).reduce(
                    (sum, d) => sum + d.qty,
                    0
                  )

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-zinc-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-zinc-900">
                        {tx.invoice_number}
                      </td>
                      <td className="py-3 px-4 text-zinc-600">
                        {formatTime(tx.created_at)}
                      </td>
                      <td className="py-3 px-4 text-center text-zinc-600">
                        {itemCount} item
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-zinc-900">
                        {formatRupiah(tx.total_amount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTransaction(tx)}
                          className="px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded transition-colors cursor-pointer"
                        >
                          Lihat Rincian
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-2xs">
          <div className="bg-white border border-zinc-200 rounded-lg w-full max-w-lg p-6 shadow-md">
            <div className="flex items-start justify-between pb-4 border-b border-zinc-100">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Rincian Transaksi {activeTransaction.invoice_number}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Waktu: {formatDateTime(activeTransaction.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTransaction(null)}
                className="text-xs text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div className="my-4 max-h-72 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 font-medium">
                    <th className="py-2 px-2">Item</th>
                    <th className="py-2 px-2 text-right">Harga</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-800">
                  {(activeTransaction.transaction_details || []).map((detail) => (
                    <tr key={detail.id}>
                      <td className="py-2.5 px-2">
                        <div className="font-medium text-zinc-900">
                          {detail.product?.name || `Produk #${detail.product_id}`}
                        </div>
                        {detail.product?.category && (
                          <div className="text-[11px] text-zinc-400">
                            {detail.product.category}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right text-zinc-600">
                        {formatRupiah(detail.price)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-medium">
                        {detail.qty}
                      </td>
                      <td className="py-2.5 px-2 text-right font-medium text-zinc-900">
                        {formatRupiah(detail.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
              <span className="text-xs font-bold text-zinc-900 uppercase">
                Grand Total Faktur
              </span>
              <span className="text-base font-bold text-zinc-900">
                {formatRupiah(activeTransaction.total_amount)}
              </span>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTransaction(null)}
                className="px-4 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
