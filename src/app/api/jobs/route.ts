import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const search = searchParams.get("search")
    const location = searchParams.get("location")
    const workType = searchParams.get("workType")
    const workMode = searchParams.get("workMode")
    const experienceLevel = searchParams.get("experienceLevel")
    const industry = searchParams.get("industry")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" }
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
      where.industry = { contains: industry, mode: "insensitive" }
    }

    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        orderBy: { postedDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
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
    console.error("Get jobs error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
