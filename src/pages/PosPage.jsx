import { useState, useEffect, useMemo } from 'react'
import { productApi } from '../api/products'
import { transactionApi } from '../api/transactions'
import { formatRupiah, formatDateTime } from '../utils/formatters'

export default function PosPage() {
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productError, setProductError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const [cart, setCart] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)

  const [completedTransaction, setCompletedTransaction] = useState(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  const loadProducts = async () => {
    try {
      setLoadingProducts(true)
      setProductError(null)
      const res = await productApi.getAll()
      const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []
      setProducts(list)
    } catch (err) {
      setProductError(err.response?.data?.message || 'Gagal memuat katalog produk.')
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean))
    return ['ALL', ...Array.from(set)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCategory =
        selectedCategory === 'ALL' || p.category === selectedCategory
      return matchSearch && matchCategory
    })
  }, [products, searchTerm, selectedCategory])

  const addToCart = (product) => {
    if (product.stock <= 0) return

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.qty >= product.stock) {
          return prevCart
        }
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      }
      return [...prevCart, { product, qty: 1 }]
    })
  }

  const updateQty = (productId, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.qty + delta
            if (nextQty <= 0) return null
            if (nextQty > item.product.stock) return item
            return { ...item, qty: nextQty }
          }
          return item
        })
        .filter(Boolean)
    })
  }

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setCheckoutError(null)
  }

  const grandTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.qty, 0)
  }, [cart])

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0)
  }, [cart])

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setIsSubmitting(true)
    setCheckoutError(null)

    const payload = {
      items: cart.map((item) => ({
        product_id: item.product.id,
        qty: item.qty,
      })),
    }

    try {
      const res = await transactionApi.create(payload)
      const transactionData = res.data || res
      setCompletedTransaction(transactionData)
      setIsReceiptOpen(true)
      setCart([])
      await loadProducts()
    } catch (err) {
      setCheckoutError(
        err.response?.data?.message || 'Gagal memproses transaksi kasir.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  const handleCloseReceipt = () => {
    setIsReceiptOpen(false)
    setCompletedTransaction(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <section className="lg:col-span-7 xl:col-span-8 space-y-4">
        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari produk perawatan / treatment..."
              className="w-full sm:w-80 px-3 py-2 text-xs bg-white border border-zinc-200 rounded text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
            />
            <div className="text-xs text-zinc-500 self-center sm:self-auto">
              Menampilkan {filteredProducts.length} item
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-zinc-100">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        </div>

        {productError && (
          <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex justify-between items-center">
            <span>{productError}</span>
            <button
              onClick={loadProducts}
              className="underline font-medium cursor-pointer"
            >
              Coba lagi
            </button>
          </div>
        )}

        {loadingProducts ? (
          <div className="py-16 text-center text-xs text-zinc-400 bg-white border border-zinc-200 rounded-lg">
            Memuat katalog produk...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-400 bg-white border border-zinc-200 rounded-lg">
            Tidak ada produk yang sesuai dengan kriteria pencarian.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredProducts.map((product) => {
              const inCartItem = cart.find(
                (item) => item.product.id === product.id
              )
              const inCartQty = inCartItem ? inCartItem.qty : 0
              const isOutOfStock = product.stock <= 0
              const isMaxInCart = inCartQty >= product.stock

              return (
                <div
                  key={product.id}
                  className={`bg-white border rounded-lg p-4 flex flex-col justify-between transition-colors ${
                    isOutOfStock
                      ? 'border-zinc-200 bg-zinc-50/50 opacity-70'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-600">
                        {product.category}
                      </span>
                      <span
                        className={`text-[11px] font-medium ${
                          isOutOfStock
                            ? 'text-rose-600'
                            : product.stock <= 5
                            ? 'text-amber-600'
                            : 'text-zinc-500'
                        }`}
                      >
                        {isOutOfStock
                          ? 'Stok Habis'
                          : `Sisa ${product.stock}`}
                      </span>
                    </div>

                    <h3 className="text-xs font-semibold text-zinc-900 line-clamp-2 mb-1.5 leading-snug">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-zinc-900">
                      {formatRupiah(product.price)}
                    </span>

                    <button
                      type="button"
                      disabled={isOutOfStock || isMaxInCart}
                      onClick={() => addToCart(product)}
                      className="px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer disabled:cursor-not-allowed bg-zinc-900 hover:bg-zinc-800 text-white disabled:bg-zinc-200 disabled:text-zinc-400"
                    >
                      {isOutOfStock
                        ? 'Habis'
                        : isMaxInCart
                        ? 'Maksimal'
                        : inCartQty > 0
                        ? `+ Tambah (${inCartQty})`
                        : '+ Keranjang'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="lg:col-span-5 xl:col-span-4 bg-white border border-zinc-200 rounded-lg p-5 sticky top-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">
              Keranjang Kasir
            </h2>
            <p className="text-[11px] text-zinc-500">
              {totalItemsCount} item dipilih
            </p>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 underline cursor-pointer"
            >
              Kosongkan
            </button>
          )}
        </div>

        {checkoutError && (
          <div className="mt-3 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {checkoutError}
          </div>
        )}

        <div className="mt-3 divide-y divide-zinc-100 max-h-80 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              Keranjang masih kosong.
              <br />
              Pilih produk di katalog untuk ditambahkan.
            </div>
          ) : (
            cart.map((item) => {
              const isAtMaxStock = item.qty >= item.product.stock

              return (
                <div key={item.product.id} className="py-3 flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-zinc-900 leading-snug">
                      {item.product.name}
                    </span>
                    <span className="text-xs font-semibold text-zinc-900 shrink-0">
                      {formatRupiah(item.product.price * item.qty)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="text-[11px]">
                      {formatRupiah(item.product.price)} / unit
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateQty(item.product.id, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 font-medium cursor-pointer"
                        title="Kurangi kuantitas"
                      >
                        -
                      </button>
                      <span className="w-7 text-center font-semibold text-zinc-900 text-xs">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        disabled={isAtMaxStock}
                        onClick={() => updateQty(item.product.id, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 text-zinc-700 font-medium cursor-pointer disabled:cursor-not-allowed"
                        title={isAtMaxStock ? 'Stok produk telah mencapai batas' : 'Tambah kuantitas'}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="ml-2 text-[11px] text-zinc-400 hover:text-rose-600 cursor-pointer"
                        title="Hapus dari keranjang"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-200 space-y-2">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Total Kuantitas:</span>
            <span className="font-medium text-zinc-800">{totalItemsCount} barang</span>
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
              Total Tagihan
            </span>
            <span className="text-base font-bold text-zinc-900">
              {formatRupiah(grandTotal)}
            </span>
          </div>

          <button
            type="button"
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleCheckout}
            className="w-full mt-4 py-2.5 px-4 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 rounded transition-colors cursor-pointer"
          >
            {isSubmitting ? 'Memproses Transaksi...' : 'Proses Pembayaran (Checkout)'}
          </button>
        </div>
      </section>

      {isReceiptOpen && completedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-2xs">
          <div className="bg-white border border-zinc-200 rounded-lg w-full max-w-sm p-6 shadow-md print:p-0 print:border-none print:shadow-none">
            <div className="text-center pb-4 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
                DR NICH BEAUTY CLINIC
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Bukti Pembayaran Kasir Resmi
              </p>
              <div className="mt-3 text-left text-[11px] text-zinc-600 space-y-0.5 bg-zinc-50 p-2.5 rounded border border-zinc-200">
                <div className="flex justify-between">
                  <span>No. Faktur:</span>
                  <span className="font-mono font-semibold text-zinc-900">
                    {completedTransaction.invoice_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span>{formatDateTime(completedTransaction.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-700">Lunas</span>
                </div>
              </div>
            </div>

            <div className="py-3 border-b border-zinc-200">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Rincian Transaksi
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {(completedTransaction.transaction_details || []).map((detail) => (
                  <div key={detail.id} className="text-xs">
                    <div className="font-medium text-zinc-900">
                      {detail.product?.name || `Produk #${detail.product_id}`}
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-500 mt-0.5">
                      <span>
                        {detail.qty} x {formatRupiah(detail.price)}
                      </span>
                      <span className="font-semibold text-zinc-800">
                        {formatRupiah(detail.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="py-3 border-b border-zinc-200 flex justify-between items-baseline">
              <span className="text-xs font-bold text-zinc-900 uppercase">
                Grand Total
              </span>
              <span className="text-sm font-bold text-zinc-900">
                {formatRupiah(completedTransaction.total_amount)}
              </span>
            </div>

            <p className="text-center text-[11px] text-zinc-400 mt-3 italic">
              Terima kasih atas kunjungan Anda di Dr Nich Clinic.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-3 py-1.5 text-xs font-medium text-zinc-800 bg-white border border-zinc-200 hover:bg-zinc-100 rounded cursor-pointer"
              >
                Cetak Struk
              </button>
              <button
                type="button"
                onClick={handleCloseReceipt}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded cursor-pointer"
              >
                Selesai / Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
