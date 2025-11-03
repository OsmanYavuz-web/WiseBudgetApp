/**
 * Para birimi formatla
 */
export const formatCurrency = (amount, currency = 'TRY') => {
  const formatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return formatter.format(amount)
}

/**
 * Tarih formatla
 */
export const formatDate = (date, format = 'short') => {
  const d = new Date(date)
  
  if (format === 'short') {
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }
  
  if (format === 'datetime') {
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return d.toLocaleDateString('tr-TR')
}

/**
 * Sayıyı kısalt (1000 -> 1K)
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Yüzde formatla
 */
export const formatPercent = (value) => {
  return `${value.toFixed(1)}%`
}

/**
 * Hesap tipi etiketleri
 */
export const accountTypeLabels = {
  cash: 'Nakit',
  bank: 'Banka Hesabı',
  credit_card: 'Kredi Kartı',
  investment: 'Yatırım',
  open_account: 'Açık Hesap (KMH)',
  other: 'Diğer'
}

/**
 * İşlem tipi etiketleri
 */
export const transactionTypeLabels = {
  income: 'Gelir',
  expense: 'Gider',
  transfer: 'Transfer'
}

/**
 * Bütçe periyot etiketleri
 */
export const budgetPeriodLabels = {
  daily: 'Günlük',
  weekly: 'Haftalık',
  monthly: 'Aylık',
  quarterly: '3 Aylık',
  yearly: 'Yıllık'
}

/**
 * Renk paleti
 */
export const colorPalette = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#14B8A6', // teal
  '#6366F1', // indigo
]

/**
 * İkon seçenekleri
 */
export const iconOptions = [
  'wallet',
  'shopping-cart',
  'car',
  'home',
  'heart',
  'book',
  'film',
  'coffee',
  'gift',
  'smartphone',
  'dollar-sign',
  'briefcase',
  'trending-up',
  'credit-card',
  'tag',
  'more-horizontal'
]

