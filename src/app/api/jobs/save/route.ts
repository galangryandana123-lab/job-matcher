import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { saveJobSchema, validateId } from "@/lib/validations"

export async function GET() {
  try {
    const session = await getAuthSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const savedJobs = await db.savedJob.findMany({
      where: { userId: session.user.id },
      include: { job: true },
      orderBy: { savedAt: "desc" },
      take: 100, // Limit results
    })

    return NextResponse.json({
      success: true,
      data: savedJobs,
    })
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Get saved jobs error:", error)
    }
    return NextResponse.json(
      { error: "Failed to fetch saved jobs" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse and validate body
    let body
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      )
    }

    const validationResult = saveJobSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { jobId, notes } = validationResult.data

    // Validate jobId format
    if (!validateId(jobId)) {
      return NextResponse.json(
        { error: "Invalid job ID format" },
        { status: 400 }
      )
    }

    // Check if job exists
    const job = await db.job.findUnique({
      where: { id: jobId },
      select: { id: true, isActive: true },
    })

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    if (!job.isActive) {
      return NextResponse.json(
        { error: "This job is no longer active" },
        { status: 400 }
      )
    }

    // Use upsert to handle race conditions
    // If already exists, just return success without error
    try {
      const savedJob = await db.savedJob.upsert({
        where: {
          userId_jobId: {
            userId: session.user.id,
            jobId,
          },
        },
        create: {
          userId: session.user.id,
          jobId,
          notes: notes?.trim().slice(0, 1000) || null,
        },
        update: {
          notes: notes?.trim().slice(0, 1000) || null,
        },
        include: { job: true },
      })

      return NextResponse.json({
        success: true,
        data: savedJob,
      })
    } catch (dbError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Save job DB error:", dbError)
      }
      return NextResponse.json(
        { error: "Failed to save job" },
        { status: 500 }
      )
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Save job error:", error)
    }
    return NextResponse.json(
      { error: "Failed to save job" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get("jobId")

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      )
    }

    // Validate jobId format
    if (!validateId(jobId)) {
      return NextResponse.json(
        { error: "Invalid job ID format" },
        { status: 400 }
      )
    }

    // Check if saved job exists first
    const existingSave = await db.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId,
        },
      },
    })

    if (!existingSave) {
      // Already unsaved, return success
      return NextResponse.json({
        success: true,
        message: "Job unsaved successfully",
      })
    }

    await db.savedJob.delete({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Job unsaved successfully",
    })
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Unsave job error:", error)
    }
    return NextResponse.json(
      { error: "Failed to unsave job" },
      { status: 500 }
    )
  }
}
