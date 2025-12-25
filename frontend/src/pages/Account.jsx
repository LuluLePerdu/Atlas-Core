import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useTranslation } from '../stores/languageStore'
import { User, Mail, Lock, Save } from 'lucide-react'

export default function Account() {
  const { t } = useTranslation()
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Validate passwords
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError(t('passwordsDontMatch'))
      setLoading(false)
      return
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError(t('passwordTooShort'))
      setLoading(false)
      return
    }

    try {
      const updates = {
        username: formData.username,
        email: formData.email
      }

      if (formData.newPassword) {
        updates.currentPassword = formData.currentPassword
        updates.newPassword = formData.newPassword
      }

      await updateUser(updates)
      setSuccess(true)
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.error || t('updateFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-display text-olympus-navy mb-2">{t('myAccount')}</h1>
        <p className="text-gray-600">{t('manageAccountSettings')}</p>
      </div>

      <div className="olympus-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Information */}
          <div>
            <h2 className="text-xl font-semibold text-olympus-navy mb-4 flex items-center gap-2">
              <User size={24} />
              {t('profileInformation')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('username')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail size={18} />
                  {t('email')}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-olympus-navy mb-4 flex items-center gap-2">
              <Lock size={24} />
              {t('changePassword')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('currentPassword')}
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
                  placeholder={t('leaveBlankToKeep')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('newPassword')}
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
                  placeholder={t('minSixCharacters')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('confirmPassword')}
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {t('profileUpdated')}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? t('loading') : t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
