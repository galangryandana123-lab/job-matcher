import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { profileUpdateSchema } from "@/lib/validations"

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
    if (process.env.NODE_ENV === "development") {
      console.error("Get profile error:", error)
    }
    return NextResponse.json(
      { error: "Failed to fetch profile" },
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

    // Parse body
    let body
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      )
    }

    // Validate input
    const validationResult = profileUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Check if profile exists
    const existingProfile = await db.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Profile not found. Please upload your CV first." },
        { status: 404 }
      )
    }

    // Update only allowed fields
    const profile = await db.profile.update({
      where: { userId: session.user.id },
      data: {
        ...(validatedData.fullName && { fullName: validatedData.fullName.trim() }),
        ...(validatedData.email && { email: validatedData.email.toLowerCase().trim() }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone?.trim() || null }),
        ...(validatedData.location !== undefined && { location: validatedData.location?.trim() || null }),
        ...(validatedData.linkedinUrl !== undefined && { linkedinUrl: validatedData.linkedinUrl?.trim() || null }),
        ...(validatedData.portfolioUrl !== undefined && { portfolioUrl: validatedData.portfolioUrl?.trim() || null }),
        ...(validatedData.currentPosition !== undefined && { currentPosition: validatedData.currentPosition?.trim() || null }),
        ...(validatedData.yearsOfExperience !== undefined && { yearsOfExperience: validatedData.yearsOfExperience }),
        ...(validatedData.summary !== undefined && { summary: validatedData.summary?.trim() || null }),
        updatedAt: new Date(),
      },
      include: {
        skills: true,
        workExperiences: { orderBy: { startDate: "desc" } },
        educations: { orderBy: { graduationYear: "desc" } },
        certifications: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: profile,
    })
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Update profile error:", error)
    }
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
