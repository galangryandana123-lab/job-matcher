"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CVUploader } from "@/components/cv/cv-uploader"
import { JobCard } from "@/components/jobs/job-card"
import {
  User,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Profile {
  id: string
  fullName: string
  email: string
  phone?: string
  location?: string
  currentPosition?: string
  yearsOfExperience: number
  summary?: string
  skills: { id: string; name: string; category: string }[]
  workExperiences: {
    id: string
    jobTitle: string
    companyName: string
    isCurrent: boolean
  }[]
  educations: {
    id: string
    degree: string
    institution: string
    fieldOfStudy: string
  }[]
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
  job: {
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
    postedDate: string
    sourceUrl: string
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [matches, setMatches] = useState<JobMatchData[]>([])
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [matchingLoading, setMatchingLoading] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
      fetchMatches()
      fetchSavedJobs()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile")
      if (res.ok) {
        const data = await res.json()
        setProfile(data.data)
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/match")
      if (res.ok) {
        const data = await res.json()
        setMatches(data.data || [])
      }
    } catch (err) {
      console.error("Error fetching matches:", err)
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

  const handleCalculateMatches = async () => {
    setMatchingLoading(true)
    setError(null)

    try {
      // First seed jobs if needed
      await fetch("/api/jobs/seed", { method: "POST" })

      // Then calculate matches
      const res = await fetch("/api/match", { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to calculate matches")
      }

      setMatches(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setMatchingLoading(false)
    }
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

  const handleUploadComplete = (data: unknown) => {
    setProfile(data as Profile)
    setShowUploader(false)
    handleCalculateMatches()
  }

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

  // Show uploader if no profile
  if (!profile || showUploader) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {profile ? "Update Your CV" : "Upload Your CV"}
          </h1>
          <p className="mt-2 text-gray-600">
            {profile
              ? "Upload a new CV to update your profile and refresh job matches"
              : "Let our AI analyze your CV and find the best job matches for you"}
          </p>
        </div>

        <CVUploader
          onUploadComplete={handleUploadComplete}
          onError={(err) => setError(err)}
        />

        {profile && (
          <div className="mt-4 text-center">
            <Button variant="ghost" onClick={() => setShowUploader(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    )
  }

  const technicalSkills = profile.skills.filter(s => s.category === "technical")
  const softSkills = profile.skills.filter(s => s.category === "soft")

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                    <User className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{profile.fullName}</CardTitle>
                    <p className="text-sm text-gray-500">{profile.currentPosition || "Job Seeker"}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                {profile.email}
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {profile.phone}
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="h-4 w-4" />
                {profile.yearsOfExperience} years experience
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => setShowUploader(true)}
              >
                Update CV
              </Button>
            </CardContent>
          </Card>

          {/* Skills Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Technical Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {technicalSkills.slice(0, 12).map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
                {technicalSkills.length > 12 && (
                  <Badge variant="outline">+{technicalSkills.length - 12} more</Badge>
                )}
              </div>

              {softSkills.length > 0 && (
                <>
                  <h4 className="mt-4 mb-2 text-sm font-medium text-gray-700">Soft Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {softSkills.slice(0, 6).map((skill) => (
                      <Badge key={skill.id} variant="outline">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Education Card */}
          {profile.educations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.educations.map((edu) => (
                  <div key={edu.id}>
                    <p className="font-medium text-gray-900">{edu.degree}</p>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                    <p className="text-xs text-gray-500">{edu.fieldOfStudy}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
                  <p className="text-xs text-gray-500">Job Matches</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {matches.filter(m => m.overallScore >= 75).length}
                  </p>
                  <p className="text-xs text-gray-500">Great Matches</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {matches.length > 0 ? Math.round(matches[0]?.overallScore || 0) : 0}%
                  </p>
                  <p className="text-xs text-gray-500">Top Score</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Job Matches */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Job Matches</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCalculateMatches}
                disabled={matchingLoading}
                className="gap-2"
              >
                {matchingLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh Matches
              </Button>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {matchingLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="mt-4 text-gray-600">Calculating job matches...</p>
                  <p className="text-sm text-gray-500">This may take a moment</p>
                </div>
              ) : matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.slice(0, 10).map((match) => (
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

                  {matches.length > 10 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" onClick={() => router.push("/jobs")}>
                        View All {matches.length} Matches
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Briefcase className="h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-gray-600">No job matches yet</p>
                  <p className="text-sm text-gray-500">Click refresh to find matching jobs</p>
                  <Button className="mt-4" onClick={handleCalculateMatches}>
                    Find Matches
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
