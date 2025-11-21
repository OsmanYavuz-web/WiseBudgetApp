import { useEffect, useState } from 'react'
import api from '../lib/axios'
import toast from 'react-hot-toast'
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign,
  FiArrowUpRight,
  FiArrowDownRight,
  FiPlus,
  FiUsers
} from 'react-icons/fi'
import { formatCurrency, formatDate } from '../utils/helpers'
import { useAuthStore } from '../store/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const userCurrency = user?.currency || 'TRY'
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [debtSummary, setDebtSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const [quickFormData, setQuickFormData] = useState({
    account_id: '',
    category_id: '',
    type: 'expense',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsRes, categoriesRes, transactionsRes, debtSummaryRes] = await Promise.all([
          api.get('/api/accounts'),
          api.get('/api/categories'),
          api.get('/api/transactions?limit=10'),
          api.get('/api/debts/summary')
        ])
        setAccounts(accountsRes.data.data)
        setCategories(categoriesRes.data.data)
        setRecentTransactions(transactionsRes.data.data)
        setDebtSummary(debtSummaryRes.data.data)
      } catch (error) {
        console.error('Veriler yüklenemedi:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    setValidationErrors({})
    
    try {
      await api.post('/api/transactions', quickFormData)
      toast.success('İşlem eklendi')
      setShowQuickAdd(false)
      setValidationErrors({})
      setQuickFormData({
        account_id: '',
        category_id: '',
        type: 'expense',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0]
      })
      
      // Verileri yeniden yükle
      const [accountsRes, transactionsRes] = await Promise.all([
        api.get('/api/accounts'),
        api.get('/api/transactions?limit=10')
      ])
      setAccounts(accountsRes.data.data)
      setRecentTransactions(transactionsRes.data.data)
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

  // Kategorileri filtrele (gelir/gider tipine göre)
  const filteredCategories = categories.filter(cat => cat.type === quickFormData.type)

  // Toplam bakiye hesaplama
  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0)

  // Bu ayki gelir/gider hesaplama
  const thisMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const thisMonthTransactions = recentTransactions.filter(t => 
    t.transaction_date?.startsWith(thisMonth)
  )
  const thisMonthIncome = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
  const thisMonthExpense = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

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
          <h1 className="text-3xl font-bold text-gray-900">Gösterge Paneli</h1>
          <p className="text-gray-600 mt-1">Finansal durumunuza genel bakış</p>
        </div>
        <button
          onClick={() => setShowQuickAdd(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus />
          Hızlı İşlem Ekle
        </button>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Toplam Bakiye */}
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-primary-100">Toplam Bakiye</span>
            <FiDollarSign className="text-primary-200" size={24} />
          </div>
          <p className="text-3xl font-bold mb-2">
            {formatCurrency(totalBalance, userCurrency)}
          </p>
          <p className="text-sm text-primary-100">
            {accounts.length} hesap
          </p>
        </div>

        {/* Bu Ayki Gelir */}
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">Bu Ayki Gelir</span>
            <FiArrowUpRight className="text-green-200" size={24} />
          </div>
          <p className="text-3xl font-bold mb-2">
            {formatCurrency(thisMonthIncome, userCurrency)}
          </p>
          <p className="text-sm text-green-100">
            {thisMonthTransactions.filter(t => t.type === 'income').length} işlem
          </p>
        </div>

        {/* Bu Ayki Gider */}
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-100">Bu Ayki Gider</span>
            <FiArrowDownRight className="text-red-200" size={24} />
          </div>
          <p className="text-3xl font-bold mb-2">
            {formatCurrency(thisMonthExpense, userCurrency)}
          </p>
          <p className="text-sm text-red-100">
            {thisMonthTransactions.filter(t => t.type === 'expense').length} işlem
          </p>
        </div>
      </div>

      {/* Borç Özeti Kartları */}
      {debtSummary && (debtSummary.receivables.total > 0 || debtSummary.payables.total > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alacaklar */}
          <div className="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-100">Alacaklarım (Bana Borçlu)</span>
              <FiUsers className="text-emerald-200" size={24} />
            </div>
            <p className="text-3xl font-bold mb-2">
              {formatCurrency(debtSummary.receivables.total, userCurrency)}
            </p>
            <div className="flex items-center gap-4 text-sm text-emerald-100">
              <span>{debtSummary.receivables.count} kişi</span>
              {debtSummary.receivables.overdue > 0 && (
                <span className="bg-red-500 px-2 py-1 rounded text-white">
                  {debtSummary.receivables.overdue} vadesi geçmiş
                </span>
              )}
            </div>
          </div>

          {/* Verecekler */}
          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-100">Vereceklerim (Ben Borçlu)</span>
              <FiUsers className="text-orange-200" size={24} />
            </div>
            <p className="text-3xl font-bold mb-2">
              {formatCurrency(debtSummary.payables.total, userCurrency)}
            </p>
            <div className="flex items-center gap-4 text-sm text-orange-100">
              <span>{debtSummary.payables.count} kişi</span>
              {debtSummary.payables.overdue > 0 && (
                <span className="bg-red-500 px-2 py-1 rounded text-white">
                  {debtSummary.payables.overdue} vadesi geçmiş
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Son İşlemler */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Son İşlemler</h2>
          <a href="/transactions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Tümünü Gör →
          </a>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-600' 
                      : transaction.type === 'expense'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {transaction.type === 'income' ? (
                      <FiTrendingUp size={20} />
                    ) : transaction.type === 'expense' ? (
                      <FiTrendingDown size={20} />
                    ) : (
                      <FiArrowUpRight size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description || 'İşlem'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {transaction.account?.name} • {formatDate(transaction.transaction_date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.type === 'income' 
                      ? 'text-green-600' 
                      : transaction.type === 'expense'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                    {formatCurrency(transaction.amount, transaction.account?.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Henüz işlem bulunmuyor</p>
          </div>
        )}
      </div>

      {/* Hızlı İşlem Ekleme Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hızlı İşlem Ekle</h2>
            
            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İşlem Tipi *
                </label>
                <select
                  value={quickFormData.type}
                  onChange={(e) => setQuickFormData({ ...quickFormData, type: e.target.value, category_id: '' })}
                  className="input"
                  required
                >
                  <option value="income">Gelir</option>
                  <option value="expense">Gider</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hesap *
                </label>
                <select
                  value={quickFormData.account_id}
                  onChange={(e) => setQuickFormData({ ...quickFormData, account_id: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  value={quickFormData.category_id}
                  onChange={(e) => setQuickFormData({ ...quickFormData, category_id: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tutar *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={quickFormData.amount}
                  onChange={(e) => setQuickFormData({ ...quickFormData, amount: e.target.value })}
                  className={`input ${validationErrors.amount ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                  required
                />
                {validationErrors.amount && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <input
                  type="text"
                  value={quickFormData.description}
                  onChange={(e) => setQuickFormData({ ...quickFormData, description: e.target.value })}
                  className="input"
                  placeholder="Örn: Market alışverişi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarih *
                </label>
                <input
                  type="date"
                  value={quickFormData.transaction_date}
                  onChange={(e) => setQuickFormData({ ...quickFormData, transaction_date: e.target.value })}
                  className={`input ${validationErrors.transaction_date ? 'border-red-500' : ''}`}
                  required
                />
                {validationErrors.transaction_date && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.transaction_date}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="btn btn-secondary flex-1"
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
