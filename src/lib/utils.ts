import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatSalary(min?: number, max?: number, currency: string = 'IDR'): string {
  if (!min && !max) return 'Negotiable'

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })

  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`
  }
  if (min) return `From ${formatter.format(min)}`
  if (max) return `Up to ${formatter.format(max)}`
  return 'Negotiable'
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600 bg-green-100'
  if (score >= 75) return 'text-blue-600 bg-blue-100'
  if (score >= 60) return 'text-yellow-600 bg-yellow-100'
  if (score >= 40) return 'text-orange-600 bg-orange-100'
  return 'text-red-600 bg-red-100'
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Perfect Match'
  if (score >= 75) return 'Great Match'
  if (score >= 60) return 'Good Match'
  if (score >= 40) return 'Partial Match'
  return 'Low Match'
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function extractYearsOfExperience(text: string): number {
  const match = text.match(/(\d+)\+?\s*(?:years?|tahun|thn)/i)
  return match ? parseInt(match[1]) : 0
}
