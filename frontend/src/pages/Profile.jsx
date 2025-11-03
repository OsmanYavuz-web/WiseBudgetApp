import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { FiUser, FiLock, FiSave } from 'react-icons/fi'

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuthStore()
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    currency: user?.currency || 'TRY',
    language: user?.language || 'tr'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    await updateProfile(profileData)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: 'Şifreler eşleşmiyor' })
      return
    }

    const success = await changePassword(passwordData.currentPassword, passwordData.newPassword)
    if (success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setErrors({})
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
        <p className="text-gray-600 mt-1">Hesap ayarlarınızı yönetin</p>
      </div>

      {/* Profile Info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <FiUser className="text-primary-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Profil Bilgileri</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ad Soyad
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta
            </label>
            <input
              type="email"
              value={user?.email}
              className="input bg-gray-100"
              disabled
            />
            <p className="text-sm text-gray-500 mt-1">E-posta adresi değiştirilemez</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Para Birimi
            </label>
            <select
              value={profileData.currency}
              onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
              className="input"
            >
              <option value="TRY">TRY - Türk Lirası</option>
              <option value="USD">USD - Amerikan Doları</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - İngiliz Sterlini</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary flex items-center gap-2">
            <FiSave />
            Kaydet
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <FiLock className="text-primary-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Şifre Değiştir</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mevcut Şifre
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="input"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre Tekrar
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => {
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                setErrors({})
              }}
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
              required
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button type="submit" className="btn btn-primary flex items-center gap-2">
            <FiLock />
            Şifreyi Değiştir
          </button>
        </form>
      </div>
    </div>
  )
}

