import { z } from "zod"

// === AUTH VALIDATIONS ===
export const registerSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens and apostrophes"),
  email: z.string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
})

// === PROFILE VALIDATIONS ===
export const profileUpdateSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  linkedinUrl: z.string().url().max(500).optional().nullable()
    .refine(
      (url) => !url || url.includes("linkedin.com"),
      "Must be a valid LinkedIn URL"
    ),
  portfolioUrl: z.string().url().max(500).optional().nullable(),
  currentPosition: z.string().max(255).optional().nullable(),
  yearsOfExperience: z.number().int().min(0).max(70).optional(),
  summary: z.string().max(5000).optional().nullable(),
})

// === JOB SEARCH VALIDATIONS ===
export const jobSearchSchema = z.object({
  search: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  workType: z.enum(["full-time", "part-time", "contract", "internship", "freelance"]).optional(),
  workMode: z.enum(["remote", "hybrid", "on-site"]).optional(),
  experienceLevel: z.enum(["entry", "mid", "senior", "lead", "executive"]).optional(),
  industry: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// === SAVE JOB VALIDATIONS ===
export const saveJobSchema = z.object({
  jobId: z.string().min(1).max(50),
  notes: z.string().max(1000).optional(),
})

// === CV PARSED DATA VALIDATION ===
export const skillSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(["technical", "soft", "language"]).default("technical"),
  proficiencyLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional().nullable(),
  yearsOfExperience: z.number().int().min(0).max(50).optional().nullable(),
})

export const workExperienceSchema = z.object({
  jobTitle: z.string().min(1).max(255),
  companyName: z.string().min(1).max(255),
  location: z.string().max(255).optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string().max(5000).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
})

export const educationSchema = z.object({
  degree: z.string().min(1).max(100),
  institution: z.string().min(1).max(255),
  fieldOfStudy: z.string().min(1).max(255),
  graduationYear: z.number().int().min(1950).max(2100).optional().nullable(),
  gpa: z.number().min(0).max(4).optional().nullable(),
})

export const certificationSchema = z.object({
  name: z.string().min(1).max(255),
  issuingOrganization: z.string().min(1).max(255),
  issueDate: z.coerce.date().optional().nullable(),
  expiryDate: z.coerce.date().optional().nullable(),
})

export const parsedCVSchema = z.object({
  fullName: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  linkedinUrl: z.string().url().max(500).optional().nullable(),
  portfolioUrl: z.string().url().max(500).optional().nullable(),
  currentPosition: z.string().max(255).optional().nullable(),
  yearsOfExperience: z.number().int().min(0).max(70).default(0),
  summary: z.string().max(5000).optional().nullable(),
  skills: z.array(skillSchema).default([]),
  workExperiences: z.array(workExperienceSchema).default([]),
  educations: z.array(educationSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
})

// === JOB DATA VALIDATION ===
export const jobDataSchema = z.object({
  title: z.string().min(1).max(255),
  companyName: z.string().min(1).max(255),
  companyLogo: z.string().url().max(500).optional().nullable(),
  location: z.string().min(1).max(255),
  workType: z.enum(["full-time", "part-time", "contract", "internship", "freelance"]).default("full-time"),
  workMode: z.enum(["remote", "hybrid", "on-site"]).default("on-site"),
  salaryMin: z.number().min(0).optional().nullable(),
  salaryMax: z.number().min(0).optional().nullable(),
  salaryCurrency: z.string().max(10).default("IDR"),
  description: z.string().min(1).max(50000),
  requirements: z.string().max(50000).optional().nullable(),
  requiredSkills: z.array(z.string().max(100)).default([]),
  experienceLevel: z.enum(["entry", "mid", "senior", "lead", "executive"]).default("mid"),
  educationRequirement: z.string().max(255).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  companySize: z.string().max(50).optional().nullable(),
  benefits: z.array(z.string().max(255)).default([]),
  postedDate: z.coerce.date().default(() => new Date()),
  applicationDeadline: z.coerce.date().optional().nullable(),
  sourceUrl: z.string().url().max(1000),
  sourcePortal: z.string().max(50),
})

// === UTILITY FUNCTIONS ===
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Basic XSS prevention
    .slice(0, 10000) // Max length
}

export function validateId(id: string | null): id is string {
  if (!id) return false
  // CUID format validation
  return /^c[a-z0-9]{24}$/.test(id) || /^[a-zA-Z0-9-_]{1,50}$/.test(id)
}
