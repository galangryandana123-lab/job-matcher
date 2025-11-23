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

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        skills: true,
        workExperiences: {
          orderBy: { startDate: "desc" }
        },
        educations: {
          orderBy: { graduationYear: "desc" }
        },
        certifications: true,
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Please upload your CV first." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profile,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const profile = await db.profile.update({
      where: { userId: session.user.id },
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        location: body.location,
        linkedinUrl: body.linkedinUrl,
        portfolioUrl: body.portfolioUrl,
        currentPosition: body.currentPosition,
        yearsOfExperience: body.yearsOfExperience,
        summary: body.summary,
      },
      include: {
        skills: true,
        workExperiences: true,
        educations: true,
        certifications: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: profile,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
