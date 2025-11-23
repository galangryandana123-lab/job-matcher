import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { calculateJobMatch } from "@/lib/job-matcher"
import { Job, Skill, WorkExperience, Education } from "@/types"

export async function GET() {
  try {
    const session = await getAuthSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check for existing matches
    const existingMatches = await db.jobMatch.findMany({
      where: { userId: session.user.id },
      include: { job: true },
      orderBy: { overallScore: "desc" },
      take: 50,
    })

    if (existingMatches.length > 0) {
      return NextResponse.json({
        success: true,
        data: existingMatches,
      })
    }

    return NextResponse.json({
      success: true,
      data: [],
      message: "No matches found. Please calculate matches first.",
    })
  } catch (error) {
    console.error("Get matches error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const session = await getAuthSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user profile
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        skills: true,
        workExperiences: true,
        educations: true,
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Please upload your CV first." },
        { status: 404 }
      )
    }

    // Get active jobs
    const jobs = await db.job.findMany({
      where: { isActive: true },
      orderBy: { postedDate: "desc" },
      take: 100,
    })

    if (jobs.length === 0) {
      return NextResponse.json(
        { error: "No jobs available. Please try again later." },
        { status: 404 }
      )
    }

    // Delete existing matches for this user
    await db.jobMatch.deleteMany({
      where: { userId: session.user.id },
    })

    // Calculate matches for each job
    const matches = []
    for (const job of jobs) {
      const match = calculateJobMatch(
        {
          skills: profile.skills as unknown as Skill[],
          workExperiences: profile.workExperiences as unknown as WorkExperience[],
          educations: profile.educations as unknown as Education[],
          location: profile.location || undefined,
          yearsOfExperience: profile.yearsOfExperience,
          currentPosition: profile.currentPosition || undefined,
        },
        job as unknown as Job
      )

      // Only save matches with score >= 30
      if (match.overallScore >= 30) {
        const savedMatch = await db.jobMatch.create({
          data: {
            userId: session.user.id,
            jobId: job.id,
            overallScore: match.overallScore,
            skillScore: match.skillScore,
            experienceScore: match.experienceScore,
            educationScore: match.educationScore,
            locationScore: match.locationScore,
            seniorityScore: match.seniorityScore,
            industryScore: match.industryScore,
            matchingSkills: match.matchingSkills,
            missingSkills: match.missingSkills,
            matchDetails: match.matchDetails as unknown as Record<string, unknown>,
          },
          include: { job: true },
        })
        matches.push(savedMatch)
      }
    }

    // Sort by score
    matches.sort((a, b) => b.overallScore - a.overallScore)

    return NextResponse.json({
      success: true,
      message: `Found ${matches.length} matching jobs`,
      data: matches,
    })
  } catch (error) {
    console.error("Calculate matches error:", error)
    return NextResponse.json(
      { error: "Failed to calculate matches" },
      { status: 500 }
    )
  }
}
