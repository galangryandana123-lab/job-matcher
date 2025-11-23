"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  FileText,
  Search,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Briefcase,
  Target,
  Zap
} from "lucide-react"

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()

  if (session) {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find Your Perfect Job
              <span className="block text-blue-200">with AI-Powered Matching</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
              Upload your CV and let our AI analyze your skills, experience, and preferences
              to find the best job matches with smart scoring.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Three simple steps to find your dream job
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">1. Upload Your CV</h3>
              <p className="mt-3 text-gray-600">
                Simply upload your CV in PDF or DOCX format. Our AI will extract all relevant information automatically.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">2. AI Analyzes & Matches</h3>
              <p className="mt-3 text-gray-600">
                Our AI analyzes your skills, experience, and education to find the most suitable job openings.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">3. Get Smart Scoring</h3>
              <p className="mt-3 text-gray-600">
                See detailed match scores for each job with insights on why you&apos;re a good fit and areas to improve.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Why Use AI Job Matcher?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Traditional job searching is time-consuming. Let AI do the heavy lifting.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Save Time</h3>
                    <p className="mt-1 text-gray-600">
                      No more scrolling through hundreds of irrelevant job postings.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-600">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Better Matches</h3>
                    <p className="mt-1 text-gray-600">
                      AI considers multiple factors to find truly relevant opportunities.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-600">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Career Insights</h3>
                    <p className="mt-1 text-gray-600">
                      Understand skill gaps and get recommendations for improvement.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Software Engineer</span>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      95% Match
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Skills</span>
                      <span className="font-medium">90%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div className="h-2 w-[90%] rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Experience</span>
                      <span className="font-medium">100%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div className="h-2 w-full rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Education</span>
                      <span className="font-medium">100%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div className="h-2 w-full rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">React</span>
                    <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">TypeScript</span>
                    <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">Node.js</span>
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">+3 more</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to Find Your Dream Job?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of job seekers who found their perfect match with AI.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 gap-2">
                Start Free Today
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
