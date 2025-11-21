import { useEffect, useState } from 'react'
import api from '../lib/axios'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import { formatCurrency, formatDate } from '../utils/helpers'
import CurrencyInput from '../components/CurrencyInput'
import { useAuthStore } from '../store/authStore'

export default function Debts() {
  const { user } = useAuthStore()
  const userCurrency = user?.currency || 'TRY'
  const [debts, setDebts] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [editingDebt, setEditingDebt] = useState(null)
  const [payingDebt, setPayingDebt] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [validationErrors, setValidationErrors] = useState({})

  const [formData, setFormData] = useState({
    person_name: '',
    phone: '',
    type: 'payable',
    amount: '',
    paid_amount: '',
    description: '',
    debt_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: ''
  })

  const [paymentAmount, setPaymentAmount] = useState('')

  useEffect(() => {
    fetchData()
  }, [filterType])

  const fetchData = async () => {
    try {
      const params = filterType !== 'all' ? `?type=${filterType}` : ''
      const [debtsRes, summaryRes] = await Promise.all([
        api.get(`/api/debts${params}`),
        api.get('/api/debts/summary')
      ])
      setDebts(debtsRes.data.data)
      setSummary(summaryRes.data.data)
    } catch (error) {
      toast.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationErrors({})

    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        paid_amount: formData.paid_amount ? parseFloat(formData.paid_amount) : 0,
        phone: formData.phone || null,
        due_date: formData.due_date || null
      }

      if (editingDebt) {
        await api.put(`/api/debts/${editingDebt.id}`, submitData)
        toast.success('Borç güncellendi')
      } else {
        await api.post('/api/debts', submitData)
        toast.success('Borç kaydı oluşturuldu')
      }
      setShowModal(false)
      resetForm()
      fetchData()
    } catch (error) {
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

  const handlePayment = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/api/debts/${payingDebt.id}/payment`, {
        payment_amount: parseFloat(paymentAmount)
      })
      toast.success(payingDebt.type === 'payable' ? 'Ödeme yapıldı' : 'Tahsilat yapıldı')
      setShowPaymentModal(false)
      setPayingDebt(null)
      setPaymentAmount('')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu borç kaydını silmek istediğinizden emin misiniz?')) return

    try {
      await api.delete(`/api/debts/${id}`)
      toast.success('Borç silindi')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Silme başarısız')
    }
  }

  const openEditModal = (debt) => {
    setEditingDebt(debt)
    setFormData({
      person_name: debt.person_name,
      phone: debt.phone || '',
      type: debt.type,
      amount: debt.amount,
      paid_amount: debt.paid_amount || 0,
      description: debt.description || '',
      debt_date: debt.debt_date.split('T')[0],
      due_date: debt.due_date ? debt.due_date.split('T')[0] : '',
      notes: debt.notes || ''
    })
    setShowModal(true)
  }

  const openPaymentModal = (debt) => {
    setPayingDebt(debt)
    setPaymentAmount('')
    setShowPaymentModal(true)
  }

  const resetForm = () => {
    setEditingDebt(null)
    setValidationErrors({})
    setFormData({
      person_name: '',
      phone: '',
      type: 'payable',
      amount: '',
      paid_amount: '',
      description: '',
      debt_date: new Date().toISOString().split('T')[0],
      due_date: '',
      notes: ''
    })
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Alacak / Verecek</h1>
          <p className="text-gray-600 mt-1">Borç takip sistemi</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus />
          Yeni Borç Kaydı
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Alacaklar */}
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100">Alacaklarım</span>
              <FiDollarSign className="text-green-200" size={24} />
            </div>
            <p className="text-3xl font-bold mb-2">
              {formatCurrency(summary.receivables.total, userCurrency)}
            </p>
            <div className="flex items-center gap-4 text-sm text-green-100">
              <span>{summary.receivables.count} kişi</span>
              {summary.receivables.overdue > 0 && (
                <span className="bg-red-500 px-2 py-1 rounded text-white">
                  {summary.receivables.overdue} vadesi geçmiş
                </span>
              )}
            </div>
          </div>

          {/* Verecekler */}
          <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-100">Vereceklerim</span>
              <FiDollarSign className="text-red-200" size={24} />
            </div>
            <p className="text-3xl font-bold mb-2">
              {formatCurrency(summary.payables.total, userCurrency)}
            </p>
            <div className="flex items-center gap-4 text-sm text-red-100">
              <span>{summary.payables.count} kişi</span>
              {summary.payables.overdue > 0 && (
                <span className="bg-yellow-500 px-2 py-1 rounded text-white">
                  {summary.payables.overdue} vadesi geçmiş
                </span>
              )}
            </div>
          </div>

          {/* Net Bakiye */}
          <div className={`card bg-gradient-to-br ${summary.net_balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white opacity-90">Net Bakiye</span>
              <FiDollarSign className="text-white opacity-75" size={24} />
            </div>
            <p className="text-3xl font-bold mb-2">
              {formatCurrency(Math.abs(summary.net_balance), userCurrency)}
            </p>
            <p className="text-sm opacity-90">
              {summary.net_balance >= 0 ? 'Alacak fazlası' : 'Verecek fazlası'}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tümü ({debts.length})
        </button>
        <button
          onClick={() => setFilterType('receivable')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === 'receivable'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Alacaklar
        </button>
        <button
          onClick={() => setFilterType('payable')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === 'payable'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Verecekler
        </button>
      </div>

      {/* Debts List */}
      {debts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {debts.map((debt) => (
            <div
              key={debt.id}
              className={`card hover:shadow-md transition-shadow border-l-4 ${
                debt.type === 'receivable' ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{debt.person_name}</h3>
                    {debt.phone && (
                      <span className="text-sm text-gray-600">{debt.phone}</span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      debt.type === 'receivable'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {debt.type === 'receivable' ? 'Alacak' : 'Verecek'}
                    </span>
                    {debt.status === 'paid' && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        <FiCheckCircle size={12} />
                        Ödendi
                      </span>
                    )}
                    {debt.is_overdue && debt.status !== 'paid' && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                        <FiAlertCircle size={12} />
                        Vadesi Geçmiş
                      </span>
                    )}
                  </div>

                  {debt.description && (
                    <p className="text-sm text-gray-600 mb-2">{debt.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Toplam Tutar</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(debt.amount, userCurrency)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ödenen</p>
                      <p className="font-semibold text-green-600">{formatCurrency(debt.paid_amount, userCurrency)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Kalan</p>
                      <p className="font-semibold text-red-600">{formatCurrency(debt.remaining_amount, userCurrency)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Vade Tarihi</p>
                      <p className="font-semibold text-gray-900">
                        {debt.due_date ? formatDate(debt.due_date) : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {debt.payment_percentage > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Ödeme Durumu</span>
                        <span>{debt.payment_percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(debt.payment_percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {debt.status !== 'paid' && (
                    <button
                      onClick={() => openPaymentModal(debt)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      {debt.type === 'payable' ? 'Öde' : 'Tahsil Et'}
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(debt)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(debt.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Henüz borç kaydı eklenmemiş</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <FiPlus />
            İlk Borç Kaydını Ekleyin
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingDebt ? 'Borç Düzenle' : 'Yeni Borç Kaydı'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Borç Tipi *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'receivable' })}
                    className={`py-3 rounded-lg font-medium transition-colors ${
                      formData.type === 'receivable'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Alacak (Bana Borçlu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'payable' })}
                    className={`py-3 rounded-lg font-medium transition-colors ${
                      formData.type === 'payable'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Verecek (Ben Borçlu)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kişi/Firma Adı *
                </label>
                <input
                  type="text"
                  value={formData.person_name}
                  onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                  className={`input ${validationErrors.person_name ? 'border-red-500' : ''}`}
                  placeholder="Örn: Ahmet Yılmaz"
                  required
                />
                {validationErrors.person_name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.person_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  placeholder="05XX XXX XX XX"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CurrencyInput
                  label="Toplam Tutar"
                  name="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  error={validationErrors.amount}
                  placeholder="0,00"
                  required
                  className="mb-0"
                />

                <div>
                  <CurrencyInput
                    label="Ödenen Tutar"
                    name="paid_amount"
                    value={formData.paid_amount}
                    onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                    placeholder="0,00"
                    className="mb-0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Kalan: {formatCurrency((parseFloat(formData.amount) || 0) - (parseFloat(formData.paid_amount) || 0), userCurrency)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Borç Tarihi *
                  </label>
                  <input
                    type="date"
                    value={formData.debt_date}
                    onChange={(e) => setFormData({ ...formData, debt_date: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vade Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows="2"
                  placeholder="Borç açıklaması..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notlar
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input"
                  rows="2"
                  placeholder="Ek notlar..."
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
                  {editingDebt ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && payingDebt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {payingDebt.type === 'payable' ? 'Ödeme Yap' : 'Tahsilat Yap'}
            </h2>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Kişi</p>
              <p className="font-semibold text-gray-900">{payingDebt.person_name}</p>
              <p className="text-sm text-gray-600 mt-2">Kalan Borç</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(payingDebt.remaining_amount, userCurrency)}
              </p>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <CurrencyInput
                label={payingDebt.type === 'payable' ? 'Ödeme Tutarı' : 'Tahsilat Tutarı'}
                name="paymentAmount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0,00"
                required
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false)
                    setPayingDebt(null)
                    setPaymentAmount('')
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  İptal
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  {payingDebt.type === 'payable' ? 'Öde' : 'Tahsil Et'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

