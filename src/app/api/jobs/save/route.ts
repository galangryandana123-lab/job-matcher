import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"

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
    })

    return NextResponse.json({
      success: true,
      data: savedJobs,
    })
  } catch (error) {
    console.error("Get saved jobs error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
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

    const { jobId, notes } = await req.json()

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      )
    }

    // Check if job exists
    const job = await db.job.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    // Check if already saved
    const existing = await db.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Job already saved" },
        { status: 400 }
      )
    }

    const savedJob = await db.savedJob.create({
      data: {
        userId: session.user.id,
        jobId,
        notes,
      },
      include: { job: true },
    })

    return NextResponse.json({
      success: true,
      data: savedJob,
    })
  } catch (error) {
    console.error("Save job error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
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
    console.error("Unsave job error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
