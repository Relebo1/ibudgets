'use client'
import { useState } from 'react'
import { Bell, Globe, Moon, Sun, Monitor, Shield, Trash2, CheckCircle } from 'lucide-react'
import { useTheme } from '@/lib/ThemeProvider'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    budgetAlerts: true, weeklyReport: true, moduleReminders: false, quizReminders: true,
  })
  const [privacy, setPrivacy] = useState({ shareProgress: false, publicProfile: false })
  const [currency, setCurrency] = useState('LSL')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )

  const themeOptions = [
    { value: 'light', label: 'Light', Icon: Sun },
    { value: 'dark', label: 'Dark', Icon: Moon },
    { value: 'system', label: 'System', Icon: Monitor },
  ] as const

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {saved && (
        <div className="bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Settings saved successfully
        </div>
      )}

      {/* Notifications */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: 'budgetAlerts', label: 'Budget Alerts', desc: 'Get notified when approaching budget limits' },
            { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive a weekly financial summary' },
            { key: 'moduleReminders', label: 'Module Reminders', desc: 'Reminders to continue learning modules' },
            { key: 'quizReminders', label: 'Quiz Reminders', desc: 'Notifications for new quizzes' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <Toggle
                checked={notifications[item.key as keyof typeof notifications]}
                onChange={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key as keyof typeof notifications] }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Preferences</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Currency</label>
            <select className="input" value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="LSL">LSL — Lesotho Loti</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="ZAR">ZAR — South African Rand</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Theme</label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {themeOptions.map(t => (
                <button key={t.value} onClick={() => setTheme(t.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-1.5
                    ${theme === t.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400 dark:border-brand-600'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  <t.Icon className="w-4 h-4" /> {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Privacy</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: 'shareProgress', label: 'Share Learning Progress', desc: 'Allow others to see your module progress' },
            { key: 'publicProfile', label: 'Public Profile', desc: 'Make your profile visible to other students' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <Toggle
                checked={privacy[item.key as keyof typeof privacy]}
                onChange={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key as keyof typeof privacy] }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-red-100 dark:border-red-900/40">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-4 h-4 text-red-500" />
          <h3 className="font-semibold text-red-600">Danger Zone</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Reset All Data</p>
              <p className="text-xs text-gray-400">Clear all budgets, expenses, and savings</p>
            </div>
            <button className="px-4 py-2 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors">Reset</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Delete Account</p>
              <p className="text-xs text-gray-400">Permanently delete your account and data</p>
            </div>
            <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors">Delete</button>
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary w-full">Save Settings</button>
    </div>
  )
}
