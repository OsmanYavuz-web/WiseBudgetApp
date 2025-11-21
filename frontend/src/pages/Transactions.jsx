import { useEffect, useState } from 'react'
import api from '../lib/axios'
import toast from 'react-hot-toast'
import { FiPlus, FiFilter, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { formatCurrency, formatDate, transactionTypeLabels } from '../utils/helpers'
import CurrencyInput from '../components/CurrencyInput'
import { useAuthStore } from '../store/authStore'

export default function Transactions() {
  const { user } = useAuthStore()
  const userCurrency = user?.currency || 'TRY'
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  const [formData, setFormData] = useState({
    account_id: '',
    category_id: '',
    type: 'expense',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  })

  const [filters, setFilters] = useState({
    type: '',
    account_id: '',
    category_id: '',
    start_date: '',
    end_date: '',
    min_amount: '',
    max_amount: '',
    search: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [transactions, filters])

  const fetchData = async () => {
    try {
      const [transRes, accRes, catRes] = await Promise.all([
        api.get('/api/transactions'),
        api.get('/api/accounts'),
        api.get('/api/categories')
      ])
      setTransactions(transRes.data.data)
      setAccounts(accRes.data.data)
      setCategories(catRes.data.data)
    } catch (error) {
      toast.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Tip filtresi
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type)
    }

    // Hesap filtresi
    if (filters.account_id) {
      filtered = filtered.filter(t => t.account_id === parseInt(filters.account_id))
    }

    // Kategori filtresi
    if (filters.category_id) {
      filtered = filtered.filter(t => t.category_id === parseInt(filters.category_id))
    }

    // Tarih aralığı filtresi
    if (filters.start_date) {
      filtered = filtered.filter(t => t.transaction_date >= filters.start_date)
    }
    if (filters.end_date) {
      filtered = filtered.filter(t => t.transaction_date <= filters.end_date)
    }

    // Tutar aralığı filtresi
    if (filters.min_amount) {
      filtered = filtered.filter(t => parseFloat(t.amount) >= parseFloat(filters.min_amount))
    }
    if (filters.max_amount) {
      filtered = filtered.filter(t => parseFloat(t.amount) <= parseFloat(filters.max_amount))
    }

    // Arama filtresi (açıklama)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(searchLower) ||
        t.category?.name?.toLowerCase().includes(searchLower) ||
        t.account?.name?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredTransactions(filtered)
  }

  const resetFilters = () => {
    setFilters({
      type: '',
      account_id: '',
      category_id: '',
      start_date: '',
      end_date: '',
      min_amount: '',
      max_amount: '',
      search: ''
    })
    setShowFilterModal(false)
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(v => v !== '').length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationErrors({}) // Hataları temizle
    
    try {
      if (editingTransaction) {
        await api.put(`/api/transactions/${editingTransaction.id}`, formData)
        toast.success('İşlem güncellendi')
      } else {
        await api.post('/api/transactions', formData)
        toast.success('İşlem eklendi')
      }
      setShowModal(false)
      resetForm()
      fetchData()
    } catch (error) {
      // Validation hatalarını yakala
      if (error.response?.data?.errors) {
        const errors = {}
        error.response.data.errors.forEach(err => {
          errors[err.field] = err.message
        })
        setValidationErrors(errors)
        toast.error('Lütfen formu kontrol edin')
      } else {
        toast.error(error.response?.data?.message || 'İşlem başarısız')
      }
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu işlemi silmek istediğinizden emin misiniz?')) return
    
    try {
      await api.delete(`/api/transactions/${id}`)
      toast.success('İşlem silindi')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Silme başarısız')
    }
  }

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      account_id: transaction.account_id,
      category_id: transaction.category_id,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description || '',
      transaction_date: transaction.transaction_date.split('T')[0]
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingTransaction(null)
    setValidationErrors({})
    setFormData({
      account_id: '',
      category_id: '',
      type: 'expense',
      amount: '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0]
    })
  }

  const filteredCategories = categories.filter(cat => cat.type === formData.type)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">İşlemler</h1>
          <p className="text-gray-600 mt-1">Gelir ve gider işlemleriniz</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowFilterModal(true)}
            className="btn btn-secondary flex items-center gap-2 relative"
          >
            <FiFilter />
            Filtrele
            {getActiveFilterCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getActiveFilterCount()}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiPlus />
            Yeni İşlem
          </button>
        </div>
      </div>

      {/* Filter Summary */}
      {getActiveFilterCount() > 0 && (
        <div className="card bg-primary-50 border border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiFilter className="text-primary-600" />
              <span className="text-sm text-primary-900">
                <strong>{filteredTransactions.length}</strong> işlem gösteriliyor 
                ({transactions.length} toplam)
              </span>
            </div>
            <button 
              onClick={resetFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      )}

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategori</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Hesap</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Açıklama</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tip</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Tutar</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(transaction.transaction_date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                          style={{ backgroundColor: `${transaction.category?.color}20`, color: transaction.category?.color }}
                        >
                          {transaction.category?.name?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{transaction.category?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.account?.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.description || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        transaction.type === 'income' ? 'badge-income' :
                        transaction.type === 'expense' ? 'badge-expense' :
                        'badge-transfer'
                      }`}>
                        {transactionTypeLabels[transaction.type]}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${
                      transaction.type === 'income' ? 'text-green-600' :
                      transaction.type === 'expense' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, transaction.account?.currency || userCurrency)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(transaction)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          {transactions.length === 0 ? (
            <>
              <p className="text-gray-500 mb-4">Henüz işlem eklenmemiş</p>
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <FiPlus />
                İlk İşleminizi Ekleyin
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-4">Filtrelere uygun işlem bulunamadı</p>
              <button
                onClick={resetFilters}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                Filtreleri Temizle
              </button>
            </>
          )}
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gelişmiş Filtreleme</h2>

            <div className="space-y-4">
              {/* Arama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arama (Açıklama, Kategori, Hesap)
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="input"
                  placeholder="Ara..."
                />
              </div>

              {/* İşlem Tipi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İşlem Tipi
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="input"
                >
                  <option value="">Tümü</option>
                  <option value="income">Gelir</option>
                  <option value="expense">Gider</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              {/* Hesap ve Kategori */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hesap
                  </label>
                  <select
                    value={filters.account_id}
                    onChange={(e) => setFilters({ ...filters, account_id: e.target.value })}
                    className="input"
                  >
                    <option value="">Tüm Hesaplar</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={filters.category_id}
                    onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                    className="input"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tarih Aralığı */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              {/* Tutar Aralığı */}
              <div className="grid grid-cols-2 gap-3">
                <CurrencyInput
                  label="Min Tutar"
                  name="min_amount"
                  value={filters.min_amount}
                  onChange={(e) => setFilters({ ...filters, min_amount: e.target.value })}
                  placeholder="0,00"
                  className="mb-0"
                />

                <CurrencyInput
                  label="Max Tutar"
                  name="max_amount"
                  value={filters.max_amount}
                  onChange={(e) => setFilters({ ...filters, max_amount: e.target.value })}
                  placeholder="0,00"
                  className="mb-0"
                />
              </div>

              {/* Hızlı Tarih Filtreleri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hızlı Tarih Seçimi
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0]
                      setFilters({ ...filters, start_date: today, end_date: today })
                    }}
                    className="btn btn-secondary text-sm"
                  >
                    Bugün
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date()
                      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                      setFilters({ 
                        ...filters, 
                        start_date: weekAgo.toISOString().split('T')[0],
                        end_date: today.toISOString().split('T')[0]
                      })
                    }}
                    className="btn btn-secondary text-sm"
                  >
                    Son 7 Gün
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date()
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
                      setFilters({ 
                        ...filters, 
                        start_date: firstDay.toISOString().split('T')[0],
                        end_date: today.toISOString().split('T')[0]
                      })
                    }}
                    className="btn btn-secondary text-sm"
                  >
                    Bu Ay
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date()
                      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
                      setFilters({ 
                        ...filters, 
                        start_date: lastMonth.toISOString().split('T')[0],
                        end_date: lastMonthEnd.toISOString().split('T')[0]
                      })
                    }}
                    className="btn btn-secondary text-sm"
                  >
                    Geçen Ay
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 btn btn-secondary"
              >
                Temizle
              </button>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="flex-1 btn btn-primary"
              >
                Uygula ({filteredTransactions.length} sonuç)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingTransaction ? 'İşlem Düzenle' : 'Yeni İşlem'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İşlem Tipi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income', category_id: '' })}
                    className={`py-3 rounded-lg font-medium transition-colors ${
                      formData.type === 'income'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Gelir
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', category_id: '' })}
                    className={`py-3 rounded-lg font-medium transition-colors ${
                      formData.type === 'expense'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Gider
                  </button>
                </div>
              </div>

              {/* Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hesap *
                </label>
                <select
                  value={formData.account_id}
                  onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                  className={`input ${validationErrors.account_id ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">Hesap Seçin</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
                {validationErrors.account_id && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.account_id}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className={`input ${validationErrors.category_id ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">Kategori Seçin</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {validationErrors.category_id && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.category_id}</p>
                )}
              </div>

              {/* Amount */}
              <CurrencyInput
                label="Tutar"
                name="amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                error={validationErrors.amount}
                required
                placeholder="0,00"
              />

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarih *
                </label>
                <input
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  className={`input ${validationErrors.transaction_date ? 'border-red-500' : ''}`}
                  required
                />
                {validationErrors.transaction_date && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.transaction_date}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="İşlem detayları..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  İptal
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  {editingTransaction ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

