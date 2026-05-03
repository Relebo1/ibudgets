import { ReactNode } from 'react'
import { X, AlertCircle, CheckCircle, Loader } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────
// LAYOUT COMPONENTS
// ─────────────────────────────────────────────────────────────────

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        {description && <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

export function Section({ title, description, children, className = '' }: { title?: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div>
          {title && <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>}
          {description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// CARD COMPONENTS
// ─────────────────────────────────────────────────────────────────

export function Card({ children, className = '', hover = false }: { children: ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`card p-6 ${hover ? 'card-hover' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, color = 'blue' }: { label: string; value: number | string; icon: any; color?: string }) {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600',
  }
  const bgColor = colorMap[color as keyof typeof colorMap] || colorMap.blue

  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────
// FORM COMPONENTS
// ─────────────────────────────────────────────────────────────────

export function FormGroup({ label, required = false, error, children }: { label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export function Input({ error, ...props }: any) {
  return (
    <input
      {...props}
      className={`input ${error ? 'border-red-300 focus:ring-red-400 dark:border-red-600' : ''}`}
    />
  )
}

export function Textarea({ error, ...props }: any) {
  return (
    <textarea
      {...props}
      className={`input resize-none ${error ? 'border-red-300 focus:ring-red-400 dark:border-red-600' : ''}`}
    />
  )
}

export function Select({ error, options, ...props }: any) {
  return (
    <select
      {...props}
      className={`input ${error ? 'border-red-300 focus:ring-red-400 dark:border-red-600' : ''}`}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// ─────────────────────────────────────────────────────────────────
// BUTTON COMPONENTS
// ─────────────────────────────────────────────────────────────────

export function Button({ children, variant = 'primary', size = 'md', icon: Icon, ...props }: { children: ReactNode; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; size?: 'sm' | 'md' | 'lg'; icon?: any; [key: string]: any }) {
  const variants: Record<string, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-150 active:scale-95',
    ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 font-medium rounded-xl transition-all duration-150',
  }

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button className={`${variants[variant]} ${sizes[size]} flex items-center gap-2`} {...props}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  )
}

export function IconButton({ icon: Icon, variant = 'ghost', ...props }: { icon: any; variant?: 'ghost' | 'danger'; [key: string]: any }) {
  const variants: Record<string, string> = {
    ghost: 'p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors',
    danger: 'p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors',
  }

  return (
    <button className={variants[variant]} {...props}>
      <Icon className={`w-4 h-4 ${variant === 'danger' ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`} />
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────
// MODAL COMPONENTS
// ─────────────────────────────────────────────────────────────────

export function Modal({ isOpen, onClose, title, children, size = 'lg' }: { isOpen: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <Card className={`w-full ${sizes[size]} shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {children}
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// STATE COMPONENTS
// ─────────────────────────────────────────────────────────────────

export function EmptyState({ icon: Icon, title, description, action }: { icon: any; title: string; description: string; action?: ReactNode }) {
  return (
    <Card className="p-12 text-center">
      <Icon className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </Card>
  )
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader className="w-8 h-8 text-gray-400 animate-spin" />
    </div>
  )
}

export function Alert({ type = 'info', title, message, onClose }: { type?: 'info' | 'success' | 'error' | 'warning'; title?: string; message: string; onClose?: () => void }) {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
  }

  const icons = {
    info: AlertCircle,
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
  }

  const Icon = icons[type]

  return (
    <div className={`p-4 rounded-lg border ${styles[type]} flex items-start gap-3`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-medium mb-1">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 ml-2">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// LIST COMPONENTS
// ─────────────────────────────────────────────────────────────────

export function ListItem({ title, subtitle, meta, actions, expanded = false, onExpand }: { title: string; subtitle?: string; meta?: ReactNode; actions?: ReactNode; expanded?: boolean; onExpand?: () => void }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{title}</p>
          {subtitle && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{subtitle}</p>}
          {meta && <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">{meta}</div>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
          {onExpand && (
            <button onClick={onExpand} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
              {expanded ? '▼' : '▶'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// BADGE COMPONENTS
// ─────────────────────────────────────────────────────────────────

export function Badge({ children, variant = 'default', size = 'sm' }: { children: ReactNode; variant?: 'default' | 'success' | 'warning' | 'error'; size?: 'sm' | 'md' }) {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  }

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}
