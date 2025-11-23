import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { jobSearchSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Validate search parameters
    const validationResult = jobSearchSchema.safeParse({
      search: searchParams.get("search") || undefined,
      location: searchParams.get("location") || undefined,
      workType: searchParams.get("workType") || undefined,
      workMode: searchParams.get("workMode") || undefined,
      experienceLevel: searchParams.get("experienceLevel") || undefined,
      industry: searchParams.get("industry") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid search parameters" },
        { status: 400 }
      )
    }

    const {
      search,
      location,
      workType,
      workMode,
      experienceLevel,
      industry,
      page,
      limit,
    } = validationResult.data

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (search) {
      // Sanitize search input
      const sanitizedSearch = search.trim().slice(0, 100)
      where.OR = [
        { title: { contains: sanitizedSearch, mode: "insensitive" } },
        { companyName: { contains: sanitizedSearch, mode: "insensitive" } },
      ]
    }

    if (location) {
      where.location = { contains: location.trim().slice(0, 100), mode: "insensitive" }
    }

    if (workType) {
      where.workType = workType
    }

    if (workMode) {
      where.workMode = workMode
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel
    }

    if (industry) {
      where.industry = { contains: industry.trim().slice(0, 100), mode: "insensitive" }
    }

    // Execute queries
    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        orderBy: { postedDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          companyName: true,
          companyLogo: true,
          location: true,
          workType: true,
          workMode: true,
          salaryMin: true,
          salaryMax: true,
          salaryCurrency: true,
          description: true,
          requiredSkills: true,
          experienceLevel: true,
          industry: true,
          postedDate: true,
          sourceUrl: true,
          sourcePortal: true,
        },
      }),
      db.job.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Get jobs error:", error)
    }
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}
