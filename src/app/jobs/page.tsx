"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { JobCard } from "@/components/jobs/job-card"
import { Search, Filter, Loader2, Briefcase, X } from "lucide-react"

interface Job {
  id: string
  title: string
  companyName: string
  companyLogo?: string
  location: string
  workType: string
  workMode: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  description: string
  requiredSkills: string[]
  experienceLevel: string
  industry?: string
  postedDate: string
  sourceUrl: string
}

interface JobMatchData {
  id: string
  overallScore: number
  skillScore: number
  experienceScore: number
  educationScore: number
  locationScore: number
  seniorityScore: number
  industryScore: number
  matchingSkills: string[]
  missingSkills: string[]
  job: Job
}

export default function JobsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [matches, setMatches] = useState<JobMatchData[]>([])
  const [filteredMatches, setFilteredMatches] = useState<JobMatchData[]>([])
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [workModeFilter, setWorkModeFilter] = useState("")
  const [experienceFilter, setExperienceFilter] = useState("")
  const [minScore, setMinScore] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchMatches()
      fetchSavedJobs()
    }
  }, [session])

  useEffect(() => {
    applyFilters()
  }, [matches, search, locationFilter, workModeFilter, experienceFilter, minScore])

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/match")
      if (res.ok) {
        const data = await res.json()
        setMatches(data.data || [])
      }
    } catch (err) {
      console.error("Error fetching matches:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedJobs = async () => {
    try {
      const res = await fetch("/api/jobs/save")
      if (res.ok) {
        const data = await res.json()
        const ids = new Set(data.data?.map((s: { jobId: string }) => s.jobId) || [])
        setSavedJobIds(ids as Set<string>)
      }
    } catch (err) {
      console.error("Error fetching saved jobs:", err)
    }
  }

  const applyFilters = () => {
    let filtered = [...matches]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        m =>
          m.job.title.toLowerCase().includes(searchLower) ||
          m.job.companyName.toLowerCase().includes(searchLower) ||
          m.job.requiredSkills.some(s => s.toLowerCase().includes(searchLower))
      )
    }

    if (locationFilter) {
      filtered = filtered.filter(m =>
        m.job.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    if (workModeFilter) {
      filtered = filtered.filter(m => m.job.workMode === workModeFilter)
    }

    if (experienceFilter) {
      filtered = filtered.filter(m => m.job.experienceLevel === experienceFilter)
    }

    if (minScore) {
      filtered = filtered.filter(m => m.overallScore >= parseInt(minScore))
    }

    setFilteredMatches(filtered)
  }

  const clearFilters = () => {
    setSearch("")
    setLocationFilter("")
    setWorkModeFilter("")
    setExperienceFilter("")
    setMinScore("")
  }

  const handleSaveJob = async (jobId: string) => {
    try {
      await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })
      setSavedJobIds(prev => new Set([...prev, jobId]))
    } catch (err) {
      console.error("Error saving job:", err)
    }
  }

  const handleUnsaveJob = async (jobId: string) => {
    try {
      await fetch(`/api/jobs/save?jobId=${jobId}`, { method: "DELETE" })
      setSavedJobIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(jobId)
        return newSet
      })
    } catch (err) {
      console.error("Error unsaving job:", err)
    }
  }

  const hasActiveFilters = search || locationFilter || workModeFilter || experienceFilter || minScore

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="mt-2 text-gray-600">
          {filteredMatches.length} jobs match your profile
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search jobs, companies, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  !
                </span>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 grid gap-4 border-t pt-4 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Location
                </label>
                <Input
                  placeholder="e.g. Jakarta"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Work Mode
                </label>
                <Select
                  value={workModeFilter}
                  onChange={(e) => setWorkModeFilter(e.target.value)}
                  options={[
                    { value: "", label: "All" },
                    { value: "remote", label: "Remote" },
                    { value: "hybrid", label: "Hybrid" },
                    { value: "on-site", label: "On-site" },
                  ]}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Experience Level
                </label>
                <Select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  options={[
                    { value: "", label: "All" },
                    { value: "entry", label: "Entry Level" },
                    { value: "mid", label: "Mid Level" },
                    { value: "senior", label: "Senior" },
                    { value: "lead", label: "Lead" },
                  ]}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Min Match Score
                </label>
                <Select
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                  options={[
                    { value: "", label: "All" },
                    { value: "90", label: "90%+ (Perfect)" },
                    { value: "75", label: "75%+ (Great)" },
                    { value: "60", label: "60%+ (Good)" },
                    { value: "40", label: "40%+ (Partial)" },
                  ]}
                />
              </div>

              {hasActiveFilters && (
                <div className="md:col-span-4">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job List */}
      {filteredMatches.length > 0 ? (
        <div className="space-y-4">
          {filteredMatches.map((match) => (
            <JobCard
              key={match.id}
              job={match.job as any}
              match={{
                overallScore: match.overallScore,
                skillScore: match.skillScore,
                experienceScore: match.experienceScore,
                educationScore: match.educationScore,
                locationScore: match.locationScore,
                matchingSkills: match.matchingSkills,
                missingSkills: match.missingSkills,
              }}
              isSaved={savedJobIds.has(match.job.id)}
              onSave={handleSaveJob}
              onUnsave={handleUnsaveJob}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="h-16 w-16 text-gray-300" />
            <p className="mt-4 text-lg font-medium text-gray-900">No jobs found</p>
            <p className="mt-2 text-gray-500">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "Upload your CV first to see matching jobs"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            {!hasActiveFilters && matches.length === 0 && (
              <Button className="mt-4" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
