"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  MapPin,
  Building2,
  Clock,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { formatSalary, formatDate, getScoreColor, getScoreLabel, cn } from "@/lib/utils"
import { Job, JobMatch } from "@/types"
import { useState } from "react"

interface JobMatchPartial {
  overallScore: number
  skillScore: number
  experienceScore: number
  educationScore: number
  locationScore: number
  matchingSkills?: string[]
  missingSkills?: string[]
}

interface JobCardProps {
  job: Job
  match?: JobMatchPartial
  isSaved?: boolean
  onSave?: (jobId: string) => void
  onUnsave?: (jobId: string) => void
  showMatchDetails?: boolean
}

export function JobCard({
  job,
  match,
  isSaved = false,
  onSave,
  onUnsave,
  showMatchDetails = true
}: JobCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSaveToggle = async () => {
    setSaving(true)
    try {
      if (isSaved) {
        await onUnsave?.(job.id)
      } else {
        await onSave?.(job.id)
      }
    } finally {
      setSaving(false)
    }
  }

  const workModeColors = {
    remote: "bg-green-100 text-green-800",
    hybrid: "bg-blue-100 text-blue-800",
    "on-site": "bg-gray-100 text-gray-800"
  }

  const experienceLevelLabels = {
    entry: "Entry Level",
    mid: "Mid Level",
    senior: "Senior",
    lead: "Lead",
    executive: "Executive"
  }

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              {/* Company Logo */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                {job.companyLogo ? (
                  <img
                    src={job.companyLogo}
                    alt={job.companyName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-6 w-6 text-gray-400" />
                )}
              </div>

              {/* Job Info */}
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-600">{job.companyName}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {job.workType}
                  </span>
                </div>
              </div>
            </div>

            {/* Match Score */}
            {match && (
              <div className={cn(
                "flex flex-col items-center rounded-lg px-3 py-2",
                getScoreColor(match.overallScore)
              )}>
                <span className="text-2xl font-bold">{Math.round(match.overallScore)}%</span>
                <span className="text-xs">{getScoreLabel(match.overallScore)}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className={workModeColors[job.workMode as keyof typeof workModeColors]}>
              {job.workMode}
            </Badge>
            <Badge variant="secondary">
              {experienceLevelLabels[job.experienceLevel as keyof typeof experienceLevelLabels]}
            </Badge>
            {job.industry && (
              <Badge variant="outline">{job.industry}</Badge>
            )}
          </div>

          {/* Salary */}
          {(job.salaryMin || job.salaryMax) && (
            <p className="mt-3 text-sm font-medium text-gray-900">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
              <span className="font-normal text-gray-500"> / month</span>
            </p>
          )}

          {/* Skills */}
          {job.requiredSkills.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1.5">
                {job.requiredSkills.slice(0, 5).map((skill, index) => (
                  <span
                    key={index}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs",
                      match?.matchingSkills?.includes(skill)
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {skill}
                  </span>
                ))}
                {job.requiredSkills.length > 5 && (
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    +{job.requiredSkills.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Match Details */}
          {match && showMatchDetails && expanded && (
            <div className="mt-4 space-y-3 rounded-lg bg-gray-50 p-4">
              <h4 className="text-sm font-medium text-gray-700">Match Breakdown</h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Skills</span>
                  <span className="font-medium">{Math.round(match.skillScore)}%</span>
                </div>
                <Progress value={match.skillScore} color={match.skillScore >= 70 ? 'green' : match.skillScore >= 50 ? 'yellow' : 'red'} />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-medium">{Math.round(match.experienceScore)}%</span>
                </div>
                <Progress value={match.experienceScore} color={match.experienceScore >= 70 ? 'green' : match.experienceScore >= 50 ? 'yellow' : 'red'} />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Education</span>
                  <span className="font-medium">{Math.round(match.educationScore)}%</span>
                </div>
                <Progress value={match.educationScore} color={match.educationScore >= 70 ? 'green' : match.educationScore >= 50 ? 'yellow' : 'red'} />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium">{Math.round(match.locationScore)}%</span>
                </div>
                <Progress value={match.locationScore} color={match.locationScore >= 70 ? 'green' : match.locationScore >= 50 ? 'yellow' : 'red'} />
              </div>

              {match.missingSkills && match.missingSkills.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Skills to develop: </span>
                    {match.missingSkills.join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              Posted {formatDate(job.postedDate)}
            </div>

            <div className="flex items-center gap-2">
              {match && showMatchDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="gap-1 text-xs"
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      Details
                    </>
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveToggle}
                disabled={saving}
                className={cn(
                  "gap-1",
                  isSaved && "text-blue-600"
                )}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>

              <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="gap-1">
                  Apply
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
