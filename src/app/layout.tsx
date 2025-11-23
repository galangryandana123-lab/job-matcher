import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"
import { Navbar } from "@/components/layout/navbar"

export const metadata: Metadata = {
  title: "AI Job Matcher - Find Your Perfect Job",
  description: "Upload your CV and let AI find the best job matches for you. Smart matching with detailed scoring.",
  keywords: ["job search", "CV parser", "job matching", "AI", "career"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-gray-200 bg-white py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-gray-500">
                  &copy; {new Date().getFullYear()} AI Job Matcher. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
