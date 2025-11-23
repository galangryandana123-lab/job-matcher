// Helper to get the app URL for NextAuth and other purposes
export function getBaseUrl(): string {
  // Browser should use relative url
  if (typeof window !== 'undefined') {
    return ''
  }

  // Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Explicit NEXTAUTH_URL
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }

  // Fallback for local development
  return 'http://localhost:3000'
}
