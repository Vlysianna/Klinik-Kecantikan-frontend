import { useState, useEffect, useMemo } from 'react'
import { productApi } from '../api/products'
import { formatRupiah } from '../utils/formatters'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [currentProduct, setCurrentProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
  })
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await productApi.getAll()
      const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []
      setProducts(list)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data produk.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean))
    return ['ALL', ...Array.from(cats)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory
      return matchSearch && matchCategory
    })
  }, [products, searchTerm, selectedCategory])

  const handleOpenCreate = () => {
    setModalMode('create')
    setCurrentProduct(null)
    setFormData({
      name: '',
      category: 'Skincare',
      price: '',
      stock: '',
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product) => {
    setModalMode('edit')
    setCurrentProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentProduct(null)
    setFormError(null)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.name.trim()) {
      setFormError('Nama produk wajib diisi.')
      return
    }
    if (!formData.category.trim()) {
      setFormError('Kategori produk wajib diisi.')
      return
    }
    if (formData.price === '' || Number(formData.price) < 0) {
      setFormError('Harga harus berupa angka dan minimal 0.')
      return
    }
    if (formData.stock === '' || Number(formData.stock) < 0) {
      setFormError('Stok harus berupa bilangan bulat dan minimal 0.')
      return
    }

    setIsSubmitting(true)
    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
    }

    try {
      if (modalMode === 'create') {
        const res = await productApi.create(payload)
        const newProduct = res.data || res
        setProducts((prev) => [newProduct, ...prev])
      } else {
        const res = await productApi.update(currentProduct.id, payload)
        const updatedProduct = res.data || res
        setProducts((prev) =>
          prev.map((item) => (item.id === currentProduct.id ? updatedProduct : item))
        )
      }
      handleCloseModal()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan perubahan produk.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await productApi.delete(deleteTarget.id)
      setProducts((prev) => prev.filter((item) => item.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus produk.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
            Katalog & Inventaris Produk
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Total {products.length} item terdaftar dalam sistem klinik
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-3.5 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded transition-colors self-start md:self-auto cursor-pointer"
        >
          + Tambah Produk Baru
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau kategori..."
            className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${selectedCategory === cat
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={fetchProducts}
            className="text-xs font-medium underline cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            Memuat daftar produk...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            {searchTerm || selectedCategory !== 'ALL'
              ? 'Tidak ada produk yang cocok dengan pencarian.'
              : 'Belum ada produk yang ditambahkan.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-medium">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Produk / Layanan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-right">Harga Satuan</th>
                  <th className="py-3 px-4 text-center">Sisa Stok</th>
                  <th className="py-3 px-4 text-right w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {filteredProducts.map((item, index) => {
                  const isOutOfStock = Number(item.stock) === 0
                  const isLowStock = Number(item.stock) > 0 && Number(item.stock) <= 5

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-zinc-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-900">
                        {item.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-zinc-100 border border-zinc-200 text-zinc-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatRupiah(item.price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${isOutOfStock
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isLowStock
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                        >
                          {isOutOfStock ? 'Habis (0)' : item.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded transition-colors cursor-pointer"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        >
                          Hapus
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-2xs">
          <div className="bg-white border border-zinc-200 rounded-lg w-full max-w-md p-6 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
              <h3 className="text-sm font-semibold text-zinc-900">
                {modalMode === 'create' ? 'Tambah Produk Baru' : 'Perbarui Data Produk'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-zinc-400 hover:text-zinc-700 text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Nama Produk / Layanan
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Contoh: Acne Clarifying Serum"
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Kategori
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="Contoh: Skincare / Treatment"
                    className="flex-1 px-3 py-2 text-xs bg-white border border-zinc-200 rounded text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                  />
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setFormData({ ...formData, category: e.target.value })
                      }
                    }}
                    value=""
                    className="px-2 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded text-zinc-600 focus:outline-none"
                  >
                    <option value="" disabled>Pilihan Cepat</option>
                    <option value="Skincare">Skincare</option>
                    <option value="Treatment">Treatment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Harga Satuan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="Contoh: 125000"
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Jumlah Stok
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  placeholder="Contoh: 50"
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 rounded transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-2xs">
          <div className="bg-white border border-zinc-200 rounded-lg w-full max-w-sm p-6 shadow-md">
            <h3 className="text-sm font-semibold text-zinc-900 mb-2">
              Konfirmasi Hapus Produk
            </h3>
            <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus produk{' '}
              <strong className="text-zinc-900 font-semibold">
                "{deleteTarget.name}"
              </strong>
              ? Data yang dihapus tidak dapat dipulihkan.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 rounded cursor-pointer"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
