export function formatPrice(
  amount: number,
  currency: string = "INR"
): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "₹0"
  const val = Math.round(amount)
  const formatted = val.toLocaleString("en-IN")
  return `₹${formatted}`
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  } catch {
    return dateString
  }
}
