export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function formatScore(score: number): string {
  return score.toFixed(3)
}

export function truncateText(text: string, maxLength: number = 100): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading image:', error)
    throw new Error('Gagal menyimpan gambar')
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}
