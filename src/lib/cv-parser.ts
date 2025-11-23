import { GoogleGenerativeAI } from '@google/generative-ai'
import { ParsedCV } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

const CV_PARSING_PROMPT = `You are an expert CV/Resume parser. Analyze the following CV text and extract structured information.

Extract the following information in JSON format:
{
  "fullName": "Full name of the candidate",
  "email": "Email address",
  "phone": "Phone number (if available)",
  "location": "City/Location (if available)",
  "linkedinUrl": "LinkedIn URL (if available)",
  "portfolioUrl": "Portfolio/Website URL (if available)",
  "currentPosition": "Current job title/position",
  "yearsOfExperience": number (total years of professional experience),
  "summary": "Professional summary or career objective",
  "skills": [
    {
      "name": "Skill name",
      "category": "technical" | "soft" | "language",
      "proficiencyLevel": "beginner" | "intermediate" | "advanced" | "expert" (estimate based on context)
    }
  ],
  "workExperiences": [
    {
      "jobTitle": "Job title",
      "companyName": "Company name",
      "location": "Work location",
      "startDate": "YYYY-MM-DD format",
      "endDate": "YYYY-MM-DD format or null if current",
      "isCurrent": boolean,
      "description": "Job description and responsibilities",
      "industry": "Industry of the company"
    }
  ],
  "educations": [
    {
      "degree": "Degree type (S1/Bachelor, S2/Master, etc)",
      "institution": "University/School name",
      "fieldOfStudy": "Major/Field of study",
      "graduationYear": number or null,
      "gpa": number or null
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuingOrganization": "Issuing organization",
      "issueDate": "YYYY-MM-DD format or null",
      "expiryDate": "YYYY-MM-DD format or null"
    }
  ]
}

Important:
- Extract ALL skills mentioned (programming languages, frameworks, tools, soft skills, languages)
- For dates, use ISO format (YYYY-MM-DD). If only year/month available, use first day of that period
- Estimate years of experience from work history if not explicitly stated
- Categorize skills appropriately (technical for hard skills, soft for interpersonal, language for spoken languages)
- Return ONLY valid JSON, no markdown or explanations

CV Text:
`

export async function parseCV(cvText: string): Promise<ParsedCV> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4000,
        responseMimeType: "application/json",
      }
    })

    const result = await model.generateContent([
      "You are a professional CV parser. Always respond with valid JSON only.",
      CV_PARSING_PROMPT + cvText
    ])

    const response = result.response
    const content = response.text()

    if (!content) {
      throw new Error("No response from Gemini")
    }

    // Clean the response in case it has markdown code blocks
    let jsonContent = content.trim()
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.slice(7)
    }
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.slice(3)
    }
    if (jsonContent.endsWith('```')) {
      jsonContent = jsonContent.slice(0, -3)
    }
    jsonContent = jsonContent.trim()

    const parsed = JSON.parse(jsonContent)

    return {
      fullName: parsed.fullName || "",
      email: parsed.email || "",
      phone: parsed.phone || null,
      location: parsed.location || null,
      linkedinUrl: parsed.linkedinUrl || null,
      portfolioUrl: parsed.portfolioUrl || null,
      currentPosition: parsed.currentPosition || null,
      yearsOfExperience: parsed.yearsOfExperience || 0,
      summary: parsed.summary || null,
      skills: (parsed.skills || []).map((skill: Record<string, unknown>) => ({
        name: skill.name as string,
        category: (skill.category as string) || "technical",
        proficiencyLevel: skill.proficiencyLevel as string || null,
        yearsOfExperience: skill.yearsOfExperience as number || null
      })),
      workExperiences: (parsed.workExperiences || []).map((exp: Record<string, unknown>) => ({
        jobTitle: exp.jobTitle as string,
        companyName: exp.companyName as string,
        location: exp.location as string || null,
        startDate: exp.startDate ? new Date(exp.startDate as string) : new Date(),
        endDate: exp.endDate ? new Date(exp.endDate as string) : null,
        isCurrent: exp.isCurrent as boolean || false,
        description: exp.description as string || null,
        industry: exp.industry as string || null
      })),
      educations: (parsed.educations || []).map((edu: Record<string, unknown>) => ({
        degree: edu.degree as string,
        institution: edu.institution as string,
        fieldOfStudy: edu.fieldOfStudy as string,
        graduationYear: edu.graduationYear as number || null,
        gpa: edu.gpa as number || null
      })),
      certifications: (parsed.certifications || []).map((cert: Record<string, unknown>) => ({
        name: cert.name as string,
        issuingOrganization: cert.issuingOrganization as string,
        issueDate: cert.issueDate ? new Date(cert.issueDate as string) : null,
        expiryDate: cert.expiryDate ? new Date(cert.expiryDate as string) : null
      })),
      rawText: cvText
    }
  } catch (error) {
    console.error("CV parsing error:", error)
    throw new Error("Failed to parse CV. Please try again.")
  }
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse')
  const data = await pdfParse(buffer)
  return data.text
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}
