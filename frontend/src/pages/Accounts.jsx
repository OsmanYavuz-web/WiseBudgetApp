import { useEffect, useState } from 'react'
import api from '../lib/axios'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiCreditCard } from 'react-icons/fi'
import { formatCurrency, accountTypeLabels } from '../utils/helpers'
import CurrencyInput from '../components/CurrencyInput'
import { useAuthStore } from '../store/authStore'

export default function Accounts() {
  const { user } = useAuthStore()
  const userCurrency = user?.currency || 'TRY'
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    type: 'cash',
    balance: 0,
    currency: 'TRY',
    color: '#3B82F6',
    description: '',
    owner_name: '',
    credit_limit: '',
    billing_day: '',
    payment_day: ''
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/api/accounts')
      setAccounts(response.data.data)
    } catch (error) {
      toast.error('Hesaplar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Kredi kartı ve KMH için özel kontroller
      const submitData = { ...formData }
      
      // Sayısal değerleri düzgün formata çevir
      submitData.balance = parseFloat(submitData.balance) || 0
      if (submitData.credit_limit) {
        submitData.credit_limit = parseFloat(submitData.credit_limit)
      }
      if (submitData.billing_day) {
        submitData.billing_day = parseInt(submitData.billing_day)
      }
      if (submitData.payment_day) {
        submitData.payment_day = parseInt(submitData.payment_day)
      }
      
      if (submitData.type === 'credit_card' || submitData.type === 'open_account') {
        // Kredi kartı ve KMH için bakiye 0 olmalı
        submitData.balance = 0
        
        if (!submitData.credit_limit || submitData.credit_limit <= 0) {
          toast.error(submitData.type === 'credit_card' ? 'Kredi kartı limiti gerekli' : 'KMH limiti gerekli')
          return
        }
      } else {
        // Normal hesap için kredi kartı/KMH alanlarını temizle
        delete submitData.credit_limit
        delete submitData.billing_day
        delete submitData.payment_day
      }

      if (editingAccount) {
        await api.put(`/api/accounts/${editingAccount.id}`, submitData)
        toast.success('Hesap güncellendi')
      } else {
        await api.post('/api/accounts', submitData)
        toast.success('Hesap oluşturuldu')
      }
      setShowModal(false)
      resetForm()
      fetchAccounts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu hesabı silmek istediğinizden emin misiniz?')) return
    
    try {
      await api.delete(`/api/accounts/${id}`)
      toast.success('Hesap silindi')
      fetchAccounts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Silme başarısız')
    }
  }

  const openEditModal = (account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      color: account.color,
      description: account.description || '',
      owner_name: account.owner_name || '',
      credit_limit: account.credit_limit || '',
      billing_day: account.billing_day || '',
      payment_day: account.payment_day || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingAccount(null)
    setFormData({
      name: '',
      type: 'cash',
      balance: 0,
      currency: 'TRY',
      color: '#3B82F6',
      description: '',
      owner_name: '',
      credit_limit: '',
      billing_day: '',
      payment_day: ''
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
          <h1 className="text-3xl font-bold text-gray-900">Hesaplar</h1>
          <p className="text-gray-600 mt-1">Banka hesapları, kredi kartları ve nakit</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus />
          Yeni Hesap
        </button>
      </div>

      {/* Accounts Grid */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const isCreditCard = account.type === 'credit_card';
            const isOpenAccount = account.type === 'open_account';
            const hasLimit = isCreditCard || isOpenAccount;
            const balance = parseFloat(account.balance);
            const isDebt = balance < 0;
            
            return (
              <div
                key={account.id}
                className="card hover:shadow-md transition-shadow"
                style={{ borderLeft: `4px solid ${account.color}` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${account.color}20` }}
                    >
                      <FiCreditCard style={{ color: account.color }} size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-500">
                        {accountTypeLabels[account.type]}
                        {account.owner_name && ` • ${account.owner_name}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kredi Kartı ve KMH İçin Özel Gösterim */}
                {hasLimit && account.credit_limit ? (
                  <div className="mb-4 space-y-3">
                    {/* Borç Durumu */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {isCreditCard ? 'Borç' : 'Kullanılan'}
                      </p>
                      <p className={`text-2xl font-bold ${isDebt ? 'text-red-600' : 'text-green-600'}`}>
                        {isDebt ? formatCurrency(Math.abs(balance), account.currency) : formatCurrency(0, account.currency)}
                      </p>
                    </div>

                    {/* Kullanım Çubuğu */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Kullanım</span>
                        <span>{account.usage_percentage?.toFixed(0) || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            (account.usage_percentage || 0) > 80 ? 'bg-red-500' :
                            (account.usage_percentage || 0) > 50 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(account.usage_percentage || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Limit Bilgisi */}
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-gray-500">Kullanılabilir</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(account.available_credit || account.credit_limit, account.currency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500">Limit</p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(account.credit_limit, account.currency)}
                        </p>
                      </div>
                    </div>

                    {/* Ödeme Günleri */}
                    {(account.billing_day || account.payment_day) && (
                      <div className="pt-2 border-t text-xs text-gray-500">
                        {account.billing_day && (
                          <p>Hesap Kesim: Her ayın {account.billing_day}&apos;i</p>
                        )}
                        {account.payment_day && (
                          <p>Son Ödeme: Her ayın {account.payment_day}&apos;si</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Normal Hesap Gösterimi */
                  <div className="mb-4">
                    <p className={`text-2xl font-bold ${balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatCurrency(balance, account.currency)}
                    </p>
                  </div>
                )}

                {account.description && (
                  <p className="text-sm text-gray-600 mb-4">{account.description}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(account)}
                    className="flex-1 btn btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                  >
                    <FiEdit2 size={16} />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Henüz hesap eklenmemiş</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <FiPlus />
            İlk Hesabınızı Ekleyin
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingAccount ? 'Hesap Düzenle' : 'Yeni Hesap'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hesap Adı
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Örn: Ziraat Bankası"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hesap Tipi
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input"
                >
                  {Object.entries(accountTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hesap/Kart Sahibi (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  className="input"
                  placeholder="Örn: Osman Yavuz, Babam, Annem"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hesabın kime ait olduğunu belirtebilirsiniz
                </p>
              </div>

              {formData.type === 'credit_card' || formData.type === 'open_account' ? (
                /* Kredi Kartı ve KMH İçin Özel Alanlar */
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      {formData.type === 'credit_card' 
                        ? `💳 Kredi kartı için başlangıç bakiyesi ${formatCurrency(0, userCurrency)} olmalıdır. Harcama yaptıkça borç olarak görünecektir.`
                        : `📋 Açık hesap (KMH) için başlangıç bakiyesi ${formatCurrency(0, userCurrency)} olmalıdır. Alım yaptıkça borç olarak görünecektir.`}
                    </p>
                  </div>

                  <CurrencyInput
                    label={formData.type === 'credit_card' ? 'Kredi Kartı Limiti' : 'KMH Limiti'}
                    name="credit_limit"
                    value={formData.credit_limit || ''}
                    onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                    placeholder="10.000,00"
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hesap Kesim Günü
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={formData.billing_day || ''}
                        onChange={(e) => setFormData({ ...formData, billing_day: e.target.value })}
                        className="input"
                        placeholder="15"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ödeme Günü
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={formData.payment_day || ''}
                        onChange={(e) => setFormData({ ...formData, payment_day: e.target.value })}
                        className="input"
                        placeholder="20"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Normal Hesap İçin Bakiye */
                !editingAccount && (
                  <div>
                    <CurrencyInput
                      label="Başlangıç Bakiyesi"
                      name="balance"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                      placeholder="0,00"
                    />
                    <p className="text-xs text-gray-500 -mt-3">
                      💡 Bakiye sonradan sadece işlemlerle değiştirilebilir
                    </p>
                  </div>
                )
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renk
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-12 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Hesap hakkında notlar..."
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
                  {editingAccount ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
