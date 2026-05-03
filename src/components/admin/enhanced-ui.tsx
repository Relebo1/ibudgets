import { ReactNode } from 'react'
import { X, AlertCircle, CheckCircle, Loader, ChevronDown, ChevronUp } from 'lucide-react'
import { DESIGN_SYSTEM, cn } from '@/lib/design-system'

// ─────────────────────────────────────────────────────────────────
// SECTION HEADER COMPONENT
// ─────────────────────────────────────────────────────────────────

export function SectionHeader({ title, subtitle, count }: { title: string; subtitle?: string; count?: number }) {
  return (
    <div className="mb-4">
      <div className="flex items-baseline gap-2">
        <h3 className={DESIGN_SYSTEM.typography.sectionTitle}>{title}</h3>
        {count !== undefined && <span className="text-sm text-gray-500 dark:text-gray-400">({count})</span>}
      </div>
      {subtitle && <p className={cn(DESIGN_SYSTEM.typography.body, 'mt-1')}>{subtitle}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// FORM SECTION COMPONENT
// ─────────────────────────────────────────────────────────────────

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className={DESIGN_SYSTEM.typography.cardTitle}>{title}</h4>
        {description && <p className={cn(DESIGN_SYSTEM.typography.body, 'mt-1')}>{description}</p>}
      </div>
      <div className={cn(DESIGN_SYSTEM.layout.itemSpacing, 'pl-4 border-l-2 border-blue-200 dark:border-blue-900')}>
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// COLLAPSIBLE SECTION
// ─────────────────────────────────────────────────────────────────

export function CollapsibleSection({ title, count, isOpen, onToggle, children }: { title: string; count?: number; isOpen: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div className={cn(DESIGN_SYSTEM.card.base, 'p-4')}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
      >
        <div className="flex items-baseline gap-2">
          <h4 className={DESIGN_SYSTEM.typography.cardTitle}>{title}</h4>
          {count !== undefined && <span className="text-sm text-gray-500 dark:text-gray-400">({count})</span>}
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {isOpen && <div className={cn('mt-4 pt-4', DESIGN_SYSTEM.divider)}>{children}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// STICKY ACTION BAR (for modals/forms)
// ─────────────────────────────────────────────────────────────────

export function StickyActionBar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('sticky bottom-0 left-0 right-0 pt-4 mt-6', DESIGN_SYSTEM.divider, 'bg-white dark:bg-gray-900 flex gap-3', className)}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// AUTOSAVE INDICATOR
// ─────────────────────────────────────────────────────────────────

export function AutosaveIndicator({ status = 'saved' }: { status?: 'saved' | 'saving' | 'error' }) {
  const statusConfig = {
    saved: { icon: CheckCircle, text: 'Saved', color: 'text-green-600 dark:text-green-400' },
    saving: { icon: Loader, text: 'Saving...', color: 'text-blue-600 dark:text-blue-400' },
    error: { icon: AlertCircle, text: 'Error saving', color: 'text-red-600 dark:text-red-400' },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={cn('flex items-center gap-2 text-xs font-medium', config.color)}>
      <Icon className={cn('w-4 h-4', status === 'saving' && 'animate-spin')} />
      {config.text}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// PROGRESS INDICATOR
// ─────────────────────────────────────────────────────────────────

export function ProgressIndicator({ current, total, errors = 0 }: { current: number; total: number; errors?: number }) {
  const percentage = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          Progress: {current} / {total}
        </span>
        {errors > 0 && <span className="text-red-600 dark:text-red-400 font-medium">{errors} error{errors !== 1 ? 's' : ''}</span>}
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// OPTION GRID (for quiz options)
// ─────────────────────────────────────────────────────────────────

export function OptionGrid({ options, correctIndex, onChange, onCorrectChange }: { options: string[]; correctIndex: number; onChange: (index: number, value: string) => void; onCorrectChange: (index: number) => void }) {
  return (
    <div className="space-y-3">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onCorrectChange(i)}
            className={cn(
              'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
              correctIndex === i
                ? 'border-green-600 bg-green-50 dark:bg-green-900/30'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            )}
          >
            {correctIndex === i && <div className="w-2 h-2 bg-green-600 rounded-full" />}
          </button>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-6">{String.fromCharCode(65 + i)}.</span>
          <input
            type="text"
            value={opt}
            onChange={e => onChange(i, e.target.value)}
            placeholder={`Option ${String.fromCharCode(65 + i)}`}
            className={cn(DESIGN_SYSTEM.input.base, 'flex-1')}
          />
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// ENHANCED MODAL
// ─────────────────────────────────────────────────────────────────

export function EnhancedModal({ isOpen, onClose, title, subtitle, children, size = 'lg' }: { isOpen: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className={cn(DESIGN_SYSTEM.card.base, 'w-full', sizes[size], 'shadow-2xl max-h-[90vh] overflow-y-auto')}>
        <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className={DESIGN_SYSTEM.typography.sectionTitle}>{title}</h2>
            {subtitle && <p className={cn(DESIGN_SYSTEM.typography.body, 'mt-1')}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// ENHANCED EMPTY STATE
// ─────────────────────────────────────────────────────────────────

export function EnhancedEmptyState({ icon: Icon, title, description, action, size = 'md' }: { icon: any; title: string; description: string; action?: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  const sizeConfig = {
    sm: { icon: 'w-12 h-12', title: 'text-base', spacing: 'py-8' },
    md: { icon: 'w-16 h-16', title: 'text-lg', spacing: 'py-12' },
    lg: { icon: 'w-20 h-20', title: 'text-xl', spacing: 'py-16' },
  }

  const config = sizeConfig[size]

  return (
    <div className={cn(DESIGN_SYSTEM.card.base, 'p-6', config.spacing, 'text-center')}>
      <Icon className={cn(config.icon, 'text-gray-300 dark:text-gray-700 mx-auto mb-4')} />
      <h3 className={cn(DESIGN_SYSTEM.typography.sectionTitle, config.title, 'mb-2')}>{title}</h3>
      <p className={cn(DESIGN_SYSTEM.typography.body, 'mb-6')}>{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// STAT CARD WITH TREND
// ─────────────────────────────────────────────────────────────────

export function StatCardWithTrend({ label, value, icon: Icon, color = 'blue', trend, trendLabel }: { label: string; value: number | string; icon: any; color?: string; trend?: 'up' | 'down' | 'neutral'; trendLabel?: string }) {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600',
  }

  return (
    <div className={cn(DESIGN_SYSTEM.card.interactive, 'p-6')}>
      <div className="flex items-start justify-between">
        <div>
          <p className={DESIGN_SYSTEM.typography.caption}>{label}</p>
          <p className={cn(DESIGN_SYSTEM.typography.pageTitle, 'mt-2')}>{value}</p>
          {trend && trendLabel && (
            <p className={cn('text-xs font-medium mt-2', trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600')}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendLabel}
            </p>
          )}
        </div>
        <div className={cn(colorMap[color as keyof typeof colorMap], 'w-12 h-12 rounded-xl flex items-center justify-center')}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
