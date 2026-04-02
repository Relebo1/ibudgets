export const CURRENCY_SYMBOL = 'M'
export const CURRENCY_CODE = 'LSL'

export function fmt(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-LS', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function fmtFixed(amount: number, decimals = 2): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(decimals)}`
}
