import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { parseCV, extractTextFromPDF, extractTextFromDOCX } from "@/lib/cv-parser"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword"
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or DOCX file." },
        { status: 400 }
      )
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      )
    }

    // Extract text from file
    const buffer = Buffer.from(await file.arrayBuffer())
    let cvText: string

    if (file.type === "application/pdf") {
      cvText = await extractTextFromPDF(buffer)
    } else {
      cvText = await extractTextFromDOCX(buffer)
    }

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from CV. Please ensure the file contains readable text." },
        { status: 400 }
      )
    }

    // Parse CV using OpenAI
    const parsedCV = await parseCV(cvText)

    // Save or update profile
    const profile = await db.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        fullName: parsedCV.fullName,
        email: parsedCV.email,
        phone: parsedCV.phone,
        location: parsedCV.location,
        linkedinUrl: parsedCV.linkedinUrl,
        portfolioUrl: parsedCV.portfolioUrl,
        currentPosition: parsedCV.currentPosition,
        yearsOfExperience: parsedCV.yearsOfExperience,
        summary: parsedCV.summary,
        parsedData: parsedCV as unknown as Record<string, unknown>,
      },
      update: {
        fullName: parsedCV.fullName,
        email: parsedCV.email,
        phone: parsedCV.phone,
        location: parsedCV.location,
        linkedinUrl: parsedCV.linkedinUrl,
        portfolioUrl: parsedCV.portfolioUrl,
        currentPosition: parsedCV.currentPosition,
        yearsOfExperience: parsedCV.yearsOfExperience,
        summary: parsedCV.summary,
        parsedData: parsedCV as unknown as Record<string, unknown>,
      },
    })

    // Delete existing related data
    await db.skill.deleteMany({ where: { profileId: profile.id } })
    await db.workExperience.deleteMany({ where: { profileId: profile.id } })
    await db.education.deleteMany({ where: { profileId: profile.id } })
    await db.certification.deleteMany({ where: { profileId: profile.id } })

    // Create skills
    if (parsedCV.skills.length > 0) {
      await db.skill.createMany({
        data: parsedCV.skills.map((skill) => ({
          profileId: profile.id,
          name: skill.name,
          category: skill.category,
          proficiencyLevel: skill.proficiencyLevel,
        })),
      })
    }

    // Create work experiences
    if (parsedCV.workExperiences.length > 0) {
      await db.workExperience.createMany({
        data: parsedCV.workExperiences.map((exp) => ({
          profileId: profile.id,
          jobTitle: exp.jobTitle,
          companyName: exp.companyName,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          isCurrent: exp.isCurrent,
          description: exp.description,
          industry: exp.industry,
        })),
      })
    }

    // Create educations
    if (parsedCV.educations.length > 0) {
      await db.education.createMany({
        data: parsedCV.educations.map((edu) => ({
          profileId: profile.id,
          degree: edu.degree,
          institution: edu.institution,
          fieldOfStudy: edu.fieldOfStudy,
          graduationYear: edu.graduationYear,
          gpa: edu.gpa,
        })),
      })
    }

    // Create certifications
    if (parsedCV.certifications.length > 0) {
      await db.certification.createMany({
        data: parsedCV.certifications.map((cert) => ({
          profileId: profile.id,
          name: cert.name,
          issuingOrganization: cert.issuingOrganization,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
        })),
      })
    }

    // Fetch the complete profile
    const completeProfile = await db.profile.findUnique({
      where: { id: profile.id },
      include: {
        skills: true,
        workExperiences: true,
        educations: true,
        certifications: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "CV parsed successfully",
      data: completeProfile,
    })
  } catch (error) {
    console.error("CV upload error:", error)
    return NextResponse.json(
      { error: "Failed to process CV. Please try again." },
      { status: 500 }
    )
  }
}
