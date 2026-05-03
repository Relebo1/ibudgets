// Design System - Single source of truth for all UI patterns
// Use these throughout the app for consistency

export const DESIGN_SYSTEM = {
  // ─────────────────────────────────────────────────────────────────
  // SPACING SCALE (4px base)
  // ─────────────────────────────────────────────────────────────────
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
  },

  // ─────────────────────────────────────────────────────────────────
  // TYPOGRAPHY SCALE
  // ─────────────────────────────────────────────────────────────────
  typography: {
    pageTitle: 'text-3xl font-bold text-gray-900 dark:text-gray-100',
    sectionTitle: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
    cardTitle: 'text-base font-semibold text-gray-900 dark:text-gray-100',
    label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
    body: 'text-sm text-gray-600 dark:text-gray-400',
    caption: 'text-xs text-gray-500 dark:text-gray-500',
    hint: 'text-xs text-gray-500 dark:text-gray-500',
  },

  // ─────────────────────────────────────────────────────────────────
  // CARD STYLES
  // ─────────────────────────────────────────────────────────────────
  card: {
    base: 'bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm',
    hover: 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
    interactive: 'bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
  },

  // ─────────────────────────────────────────────────────────────────
  // BUTTON STYLES
  // ─────────────────────────────────────────────────────────────────
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 font-medium px-4 py-2.5 rounded-xl transition-all duration-150 active:scale-95',
    danger: 'bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2.5 rounded-xl transition-all duration-150 active:scale-95',
    ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 font-medium px-4 py-2.5 rounded-xl transition-all duration-150',
  },

  // ─────────────────────────────────────────────────────────────────
  // INPUT STYLES
  // ─────────────────────────────────────────────────────────────────
  input: {
    base: 'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-150 text-sm text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500',
    error: 'border-red-300 focus:ring-red-400 dark:border-red-600',
  },

  // ─────────────────────────────────────────────────────────────────
  // SECTION DIVIDERS
  // ─────────────────────────────────────────────────────────────────
  divider: 'border-t border-gray-200 dark:border-gray-700',

  // ─────────────────────────────────────────────────────────────────
  // COLORS
  // ─────────────────────────────────────────────────────────────────
  colors: {
    primary: '#2563eb',      // blue-600
    success: '#16a34a',      // green-600
    warning: '#ea580c',      // orange-600
    error: '#dc2626',        // red-600
    info: '#0284c7',         // sky-600
  },

  // ─────────────────────────────────────────────────────────────────
  // LAYOUT PATTERNS
  // ─────────────────────────────────────────────────────────────────
  layout: {
    pageContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    pageSpacing: 'space-y-8',
    sectionSpacing: 'space-y-6',
    itemSpacing: 'space-y-4',
    gridGap: 'gap-6',
  },

  // ─────────────────────────────────────────────────────────────────
  // SHADOWS
  // ─────────────────────────────────────────────────────────────────
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
}

// ─────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getButtonClass(variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary', size: 'sm' | 'md' | 'lg' = 'md'): string {
  const baseClass = DESIGN_SYSTEM.button[variant]
  const sizeClass = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }[size]
  return cn(baseClass, sizeClass)
}

export function getInputClass(error?: boolean): string {
  return cn(DESIGN_SYSTEM.input.base, error && DESIGN_SYSTEM.input.error)
}
