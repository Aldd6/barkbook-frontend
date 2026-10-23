const currencyFormatter = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' })

export const formatCurrency = (amount) => currencyFormatter.format(Number(amount ?? 0))

export const formatDate = (value) => {
  if (!value) return ''
  const [year, month, day] = String(value).slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

export const nightsBetween = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0
  const toUTC = (value) => {
    const [year, month, day] = value.split('-').map(Number)
    return Date.UTC(year, month - 1, day)
  }
  return Math.max(0, Math.round((toUTC(checkOut) - toUTC(checkIn)) / 86400000))
}

export const formatAge = (birthday) => {
  if (!birthday) return ''
  const [year, month, day] = birthday.split('-').map(Number)
  const now = new Date()
  let months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month)
  if (now.getDate() < day) months -= 1
  if (months < 1) return 'Menos de 1 mes'
  if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`
  const years = Math.floor(months / 12)
  return `${years} ${years === 1 ? 'año' : 'años'}`
}

const dateTimeFormatter = new Intl.DateTimeFormat('es-GT', { dateStyle: 'short', timeStyle: 'short' })

export const formatDateTime = (value) => (value ? dateTimeFormatter.format(new Date(value)) : '')

export const yesNo =(value) => (value ? 'Sí' : 'No')

export const todayISO = () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
