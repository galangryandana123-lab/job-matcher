import { NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { parseCV, extractTextFromPDF, extractTextFromDOCX } from "@/lib/cv-parser"
import { db } from "@/lib/db"
import { parsedCVSchema } from "@/lib/validations"

// Magic bytes for file type validation
const FILE_SIGNATURES = {
  PDF: [0x25, 0x50, 0x44, 0x46], // %PDF
  DOCX: [0x50, 0x4b, 0x03, 0x04], // PK.. (ZIP format)
}

function validateFileSignature(buffer: Buffer): "pdf" | "docx" | null {
  if (buffer.length < 4) return null

  const isPDF = FILE_SIGNATURES.PDF.every((byte, i) => buffer[i] === byte)
  if (isPDF) return "pdf"

  const isDOCX = FILE_SIGNATURES.DOCX.every((byte, i) => buffer[i] === byte)
  if (isDOCX) return "docx"

  return null
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

    let formData
    try {
      formData = await req.formData()
    } catch {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      )
    }

    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      )
    }

    if (file.size < 100) {
      return NextResponse.json(
        { error: "File is too small to be a valid CV" },
        { status: 400 }
      )
    }

    // Get buffer and validate magic bytes
    const buffer = Buffer.from(await file.arrayBuffer())
    const detectedType = validateFileSignature(buffer)

    if (!detectedType) {
      return NextResponse.json(
        { error: "Invalid file format. Please upload a valid PDF or DOCX file." },
        { status: 400 }
      )
    }

    // Extract text based on detected type
    let cvText: string
    try {
      if (detectedType === "pdf") {
        cvText = await extractTextFromPDF(buffer)
      } else {
        cvText = await extractTextFromDOCX(buffer)
      }
    } catch (extractError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Text extraction error:", extractError)
      }
      return NextResponse.json(
        { error: "Could not read the file. Please ensure it's not corrupted." },
        { status: 400 }
      )
    }

    // Validate extracted text
    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract sufficient text from CV. Please ensure the file contains readable text." },
        { status: 400 }
      )
    }

    // Limit text length to prevent excessive API costs
    const MAX_TEXT_LENGTH = 50000
    const truncatedText = cvText.slice(0, MAX_TEXT_LENGTH)

    // Parse CV using OpenAI
    let parsedCV
    try {
      parsedCV = await parseCV(truncatedText)
    } catch (parseError) {
      if (process.env.NODE_ENV === "development") {
        console.error("CV parsing error:", parseError)
      }
      return NextResponse.json(
        { error: "Failed to analyze CV. Please try again." },
        { status: 500 }
      )
    }

    // Validate parsed data
    const validationResult = parsedCVSchema.safeParse(parsedCV)
    if (!validationResult.success) {
      if (process.env.NODE_ENV === "development") {
        console.error("Parsed CV validation error:", validationResult.error)
      }
      // Continue with partial data rather than failing completely
    }

    // Use transaction to ensure data consistency
    const completeProfile = await db.$transaction(async (tx: typeof db) => {
      // Upsert profile
      const profile = await tx.profile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          fullName: String(parsedCV.fullName || "").trim().slice(0, 255),
          email: String(parsedCV.email || "").trim().toLowerCase().slice(0, 255),
          phone: parsedCV.phone ? String(parsedCV.phone).trim().slice(0, 20) : null,
          location: parsedCV.location ? String(parsedCV.location).trim().slice(0, 255) : null,
          linkedinUrl: parsedCV.linkedinUrl ? String(parsedCV.linkedinUrl).trim().slice(0, 500) : null,
          portfolioUrl: parsedCV.portfolioUrl ? String(parsedCV.portfolioUrl).trim().slice(0, 500) : null,
          currentPosition: parsedCV.currentPosition ? String(parsedCV.currentPosition).trim().slice(0, 255) : null,
          yearsOfExperience: Math.max(0, Math.min(70, Number(parsedCV.yearsOfExperience) || 0)),
          summary: parsedCV.summary ? String(parsedCV.summary).trim().slice(0, 5000) : null,
          parsedData: parsedCV as unknown as Record<string, unknown>,
        },
        update: {
          fullName: String(parsedCV.fullName || "").trim().slice(0, 255),
          email: String(parsedCV.email || "").trim().toLowerCase().slice(0, 255),
          phone: parsedCV.phone ? String(parsedCV.phone).trim().slice(0, 20) : null,
          location: parsedCV.location ? String(parsedCV.location).trim().slice(0, 255) : null,
          linkedinUrl: parsedCV.linkedinUrl ? String(parsedCV.linkedinUrl).trim().slice(0, 500) : null,
          portfolioUrl: parsedCV.portfolioUrl ? String(parsedCV.portfolioUrl).trim().slice(0, 500) : null,
          currentPosition: parsedCV.currentPosition ? String(parsedCV.currentPosition).trim().slice(0, 255) : null,
          yearsOfExperience: Math.max(0, Math.min(70, Number(parsedCV.yearsOfExperience) || 0)),
          summary: parsedCV.summary ? String(parsedCV.summary).trim().slice(0, 5000) : null,
          parsedData: parsedCV as unknown as Record<string, unknown>,
          updatedAt: new Date(),
        },
      })

      // Delete existing related data
      await tx.skill.deleteMany({ where: { profileId: profile.id } })
      await tx.workExperience.deleteMany({ where: { profileId: profile.id } })
      await tx.education.deleteMany({ where: { profileId: profile.id } })
      await tx.certification.deleteMany({ where: { profileId: profile.id } })

      // Create skills (limit to 50)
      const skills = (parsedCV.skills || []).slice(0, 50)
      if (skills.length > 0) {
        await tx.skill.createMany({
          data: skills.map((skill) => ({
            profileId: profile.id,
            name: String(skill.name || "").trim().slice(0, 100),
            category: ["technical", "soft", "language"].includes(skill.category) ? skill.category : "technical",
            proficiencyLevel: skill.proficiencyLevel || null,
          })),
        })
      }

      // Create work experiences (limit to 20)
      const workExperiences = (parsedCV.workExperiences || []).slice(0, 20)
      if (workExperiences.length > 0) {
        await tx.workExperience.createMany({
          data: workExperiences.map((exp) => ({
            profileId: profile.id,
            jobTitle: String(exp.jobTitle || "").trim().slice(0, 255),
            companyName: String(exp.companyName || "").trim().slice(0, 255),
            location: exp.location ? String(exp.location).trim().slice(0, 255) : null,
            startDate: exp.startDate instanceof Date ? exp.startDate : new Date(exp.startDate || Date.now()),
            endDate: exp.endDate ? (exp.endDate instanceof Date ? exp.endDate : new Date(exp.endDate)) : null,
            isCurrent: Boolean(exp.isCurrent),
            description: exp.description ? String(exp.description).trim().slice(0, 5000) : null,
            industry: exp.industry ? String(exp.industry).trim().slice(0, 100) : null,
          })),
        })
      }

      // Create educations (limit to 10)
      const educations = (parsedCV.educations || []).slice(0, 10)
      if (educations.length > 0) {
        await tx.education.createMany({
          data: educations.map((edu) => ({
            profileId: profile.id,
            degree: String(edu.degree || "").trim().slice(0, 100),
            institution: String(edu.institution || "").trim().slice(0, 255),
            fieldOfStudy: String(edu.fieldOfStudy || "").trim().slice(0, 255),
            graduationYear: edu.graduationYear ? Math.max(1950, Math.min(2100, Number(edu.graduationYear))) : null,
            gpa: edu.gpa ? Math.max(0, Math.min(4, Number(edu.gpa))) : null,
          })),
        })
      }

      // Create certifications (limit to 20)
      const certifications = (parsedCV.certifications || []).slice(0, 20)
      if (certifications.length > 0) {
        await tx.certification.createMany({
          data: certifications.map((cert) => ({
            profileId: profile.id,
            name: String(cert.name || "").trim().slice(0, 255),
            issuingOrganization: String(cert.issuingOrganization || "").trim().slice(0, 255),
            issueDate: cert.issueDate ? (cert.issueDate instanceof Date ? cert.issueDate : new Date(cert.issueDate)) : null,
            expiryDate: cert.expiryDate ? (cert.expiryDate instanceof Date ? cert.expiryDate : new Date(cert.expiryDate)) : null,
          })),
        })
      }

      // Return complete profile
      return await tx.profile.findUnique({
        where: { id: profile.id },
        include: {
          skills: true,
          workExperiences: { orderBy: { startDate: "desc" } },
          educations: { orderBy: { graduationYear: "desc" } },
          certifications: true,
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: "CV parsed successfully",
      data: completeProfile,
    })
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("CV upload error:", error)
    }
    return NextResponse.json(
      { error: "Failed to process CV. Please try again." },
      { status: 500 }
    )
  }
}
