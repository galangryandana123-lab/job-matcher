export interface User {
  id: string
  email: string
  name?: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

export interface Profile {
  id: string
  userId: string
  fullName: string
  email: string
  phone?: string
  location?: string
  linkedinUrl?: string
  portfolioUrl?: string
  currentPosition?: string
  yearsOfExperience: number
  summary?: string
  rawCvUrl?: string
  skills: Skill[]
  workExperiences: WorkExperience[]
  educations: Education[]
  certifications: Certification[]
  createdAt: Date
  updatedAt: Date
}

export interface Skill {
  id: string
  name: string
  category: 'technical' | 'soft' | 'language'
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience?: number
}

export interface WorkExperience {
  id: string
  jobTitle: string
  companyName: string
  location?: string
  startDate: Date
  endDate?: Date
  isCurrent: boolean
  description?: string
  industry?: string
  achievements?: string[]
}

export interface Education {
  id: string
  degree: string
  institution: string
  fieldOfStudy: string
  graduationYear?: number
  gpa?: number
}

export interface Certification {
  id: string
  name: string
  issuingOrganization: string
  issueDate?: Date
  expiryDate?: Date
  credentialUrl?: string
}

export interface Job {
  id: string
  title: string
  companyName: string
  companyLogo?: string
  location: string
  workType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'
  workMode: 'remote' | 'hybrid' | 'on-site'
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  description: string
  requirements?: string
  requiredSkills: string[]
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  educationRequirement?: string
  industry?: string
  companySize?: string
  benefits?: string[]
  postedDate: Date
  applicationDeadline?: Date
  sourceUrl: string
  sourcePortal: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface JobMatch {
  id: string
  userId: string
  jobId: string
  job: Job
  overallScore: number
  skillScore: number
  experienceScore: number
  educationScore: number
  locationScore: number
  seniorityScore: number
  industryScore: number
  matchingSkills: string[]
  missingSkills: string[]
  matchDetails: MatchDetails
  createdAt: Date
}

export interface MatchDetails {
  skillAnalysis: {
    matched: string[]
    missing: string[]
    percentage: number
  }
  experienceAnalysis: {
    required: string
    userHas: string
    isMatch: boolean
    percentage: number
  }
  educationAnalysis: {
    required: string
    userHas: string
    isMatch: boolean
    percentage: number
  }
  locationAnalysis: {
    jobLocation: string
    userLocation: string
    distance?: number
    percentage: number
  }
  recommendations: string[]
}

export interface SavedJob {
  id: string
  userId: string
  jobId: string
  job: Job
  savedAt: Date
  notes?: string
}

export interface ParsedCV {
  fullName: string
  email: string
  phone?: string
  location?: string
  linkedinUrl?: string
  portfolioUrl?: string
  currentPosition?: string
  yearsOfExperience: number
  summary?: string
  skills: Omit<Skill, 'id'>[]
  workExperiences: Omit<WorkExperience, 'id'>[]
  educations: Omit<Education, 'id'>[]
  certifications: Omit<Certification, 'id'>[]
  rawText: string
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface JobFilters {
  search?: string
  location?: string
  workType?: string
  workMode?: string
  experienceLevel?: string
  industry?: string
  salaryMin?: number
  salaryMax?: number
  minScore?: number
  postedWithin?: number // days
}
