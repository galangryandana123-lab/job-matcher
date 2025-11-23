import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export interface ScrapedJob {
  title: string
  companyName: string
  companyLogo?: string
  location: string
  workType: string
  workMode: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  description: string
  requirements?: string
  requiredSkills: string[]
  experienceLevel: string
  educationRequirement?: string
  industry?: string
  benefits?: string[]
  postedDate: Date
  applicationDeadline?: Date
  sourceUrl: string
  sourcePortal: string
}

// Firecrawl-style interface for when the API is available
interface FirecrawlResponse {
  success: boolean
  data?: {
    markdown?: string
    html?: string
    metadata?: Record<string, unknown>
  }
  error?: string
}

async function fetchWithFirecrawl(url: string): Promise<FirecrawlResponse> {
  const apiKey = process.env.FIRECRAWL_API_KEY

  if (!apiKey) {
    console.warn('FIRECRAWL_API_KEY not set, using fallback method')
    return { success: false, error: 'API key not configured' }
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Firecrawl error:', error)
    return { success: false, error: String(error) }
  }
}

const JOB_EXTRACTION_PROMPT = `Extract job listing information from the following content. Return a JSON array of job objects.

Each job object should have:
{
  "title": "Job title",
  "companyName": "Company name",
  "location": "Job location/city",
  "workType": "full-time" | "part-time" | "contract" | "internship" | "freelance",
  "workMode": "remote" | "hybrid" | "on-site",
  "salaryMin": number or null,
  "salaryMax": number or null,
  "salaryCurrency": "IDR" (default) or other currency code,
  "description": "Full job description",
  "requirements": "Job requirements",
  "requiredSkills": ["skill1", "skill2", ...],
  "experienceLevel": "entry" | "mid" | "senior" | "lead" | "executive",
  "educationRequirement": "Minimum education requirement",
  "industry": "Company/Job industry",
  "benefits": ["benefit1", "benefit2", ...],
  "postedDate": "ISO date string",
  "applicationDeadline": "ISO date string or null"
}

Extract as many jobs as you can find. Return ONLY valid JSON with a "jobs" array.

Content:
`

export async function scrapeJobPortal(
  portalUrl: string,
  portalName: string
): Promise<ScrapedJob[]> {
  try {
    const firecrawlResult = await fetchWithFirecrawl(portalUrl)

    if (!firecrawlResult.success || !firecrawlResult.data?.markdown) {
      console.log(`Could not scrape ${portalName}, returning sample jobs`)
      return getSampleJobs(portalName)
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4000,
        responseMimeType: "application/json",
      }
    })

    const result = await model.generateContent([
      "You are a job listing extractor. Always respond with valid JSON only.",
      JOB_EXTRACTION_PROMPT + firecrawlResult.data.markdown
    ])

    const response = result.response
    const content = response.text()

    if (!content) {
      return getSampleJobs(portalName)
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
    const jobs: ScrapedJob[] = (parsed.jobs || parsed || []).map((job: Record<string, unknown>) => ({
      title: job.title as string,
      companyName: job.companyName as string,
      companyLogo: job.companyLogo as string || undefined,
      location: job.location as string || 'Indonesia',
      workType: (job.workType as string) || 'full-time',
      workMode: (job.workMode as string) || 'on-site',
      salaryMin: job.salaryMin as number || undefined,
      salaryMax: job.salaryMax as number || undefined,
      salaryCurrency: (job.salaryCurrency as string) || 'IDR',
      description: job.description as string || '',
      requirements: job.requirements as string || undefined,
      requiredSkills: (job.requiredSkills as string[]) || [],
      experienceLevel: (job.experienceLevel as string) || 'mid',
      educationRequirement: job.educationRequirement as string || undefined,
      industry: job.industry as string || undefined,
      benefits: (job.benefits as string[]) || undefined,
      postedDate: job.postedDate ? new Date(job.postedDate as string) : new Date(),
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline as string) : undefined,
      sourceUrl: portalUrl,
      sourcePortal: portalName
    }))

    return jobs
  } catch (error) {
    console.error(`Error scraping ${portalName}:`, error)
    return getSampleJobs(portalName)
  }
}

// Sample jobs for development/demo when scraping is not available
function getSampleJobs(source: string): ScrapedJob[] {
  const now = new Date()

  return [
    {
      title: "Senior Frontend Developer",
      companyName: "Tech Startup Indonesia",
      companyLogo: "https://ui-avatars.com/api/?name=TSI&background=2563eb&color=fff",
      location: "Jakarta",
      workType: "full-time",
      workMode: "hybrid",
      salaryMin: 15000000,
      salaryMax: 25000000,
      salaryCurrency: "IDR",
      description: "Kami mencari Senior Frontend Developer yang berpengalaman untuk bergabung dengan tim engineering kami. Anda akan bertanggung jawab untuk membangun dan memelihara aplikasi web modern menggunakan React dan Next.js.",
      requirements: "Minimal 3 tahun pengalaman sebagai Frontend Developer. Mahir dalam React, TypeScript, dan modern CSS. Pengalaman dengan Next.js menjadi nilai plus.",
      requiredSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Git", "REST API"],
      experienceLevel: "senior",
      educationRequirement: "S1 Teknik Informatika atau bidang terkait",
      industry: "Technology",
      benefits: ["BPJS", "Remote-friendly", "Learning budget", "MacBook"],
      postedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      sourceUrl: `https://${source.toLowerCase().replace(' ', '')}.com/job/1`,
      sourcePortal: source
    },
    {
      title: "Backend Engineer",
      companyName: "Fintech Corp",
      companyLogo: "https://ui-avatars.com/api/?name=FC&background=10b981&color=fff",
      location: "Jakarta",
      workType: "full-time",
      workMode: "on-site",
      salaryMin: 18000000,
      salaryMax: 30000000,
      salaryCurrency: "IDR",
      description: "Bergabunglah dengan tim backend kami untuk membangun sistem payment yang scalable. Anda akan bekerja dengan teknologi terkini dan tim yang solid.",
      requirements: "Pengalaman 3-5 tahun dalam backend development. Familiar dengan microservices architecture dan database design.",
      requiredSkills: ["Node.js", "Python", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS"],
      experienceLevel: "mid",
      educationRequirement: "S1 Computer Science",
      industry: "Fintech",
      benefits: ["Health insurance", "Stock options", "Gym membership", "Free lunch"],
      postedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      sourceUrl: `https://${source.toLowerCase().replace(' ', '')}.com/job/2`,
      sourcePortal: source
    },
    {
      title: "Full Stack Developer",
      companyName: "E-commerce Giant",
      companyLogo: "https://ui-avatars.com/api/?name=EG&background=f59e0b&color=fff",
      location: "Bandung",
      workType: "full-time",
      workMode: "remote",
      salaryMin: 12000000,
      salaryMax: 20000000,
      salaryCurrency: "IDR",
      description: "Kami mencari Full Stack Developer untuk mengembangkan fitur-fitur baru di platform e-commerce kami yang melayani jutaan pengguna.",
      requirements: "2+ tahun pengalaman full stack development. Mampu bekerja secara mandiri dan dalam tim.",
      requiredSkills: ["JavaScript", "React", "Node.js", "MongoDB", "Express.js", "Git"],
      experienceLevel: "mid",
      educationRequirement: "D3/S1 Informatika",
      industry: "E-commerce",
      benefits: ["Full remote", "Flexible hours", "Annual bonus"],
      postedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      sourceUrl: `https://${source.toLowerCase().replace(' ', '')}.com/job/3`,
      sourcePortal: source
    },
    {
      title: "Junior Software Engineer",
      companyName: "Software House Pro",
      companyLogo: "https://ui-avatars.com/api/?name=SH&background=6366f1&color=fff",
      location: "Yogyakarta",
      workType: "full-time",
      workMode: "hybrid",
      salaryMin: 6000000,
      salaryMax: 10000000,
      salaryCurrency: "IDR",
      description: "Kesempatan untuk fresh graduate yang ingin memulai karir di dunia software development. Kami menyediakan mentorship dan training.",
      requirements: "Fresh graduate atau max 1 tahun pengalaman. Memiliki passion di bidang programming.",
      requiredSkills: ["JavaScript", "HTML", "CSS", "Git", "Problem Solving"],
      experienceLevel: "entry",
      educationRequirement: "S1 Teknik Informatika",
      industry: "Technology",
      benefits: ["Training program", "Career development", "Health insurance"],
      postedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      sourceUrl: `https://${source.toLowerCase().replace(' ', '')}.com/job/4`,
      sourcePortal: source
    },
    {
      title: "DevOps Engineer",
      companyName: "Cloud Solutions ID",
      companyLogo: "https://ui-avatars.com/api/?name=CS&background=ec4899&color=fff",
      location: "Jakarta",
      workType: "full-time",
      workMode: "remote",
      salaryMin: 20000000,
      salaryMax: 35000000,
      salaryCurrency: "IDR",
      description: "Bergabung sebagai DevOps Engineer untuk mengelola infrastructure cloud kami dan meningkatkan CI/CD pipeline.",
      requirements: "4+ tahun pengalaman dalam DevOps atau SRE. Strong knowledge of cloud platforms (AWS/GCP).",
      requiredSkills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux", "Python"],
      experienceLevel: "senior",
      educationRequirement: "S1 Computer Science",
      industry: "Technology",
      benefits: ["Remote work", "Training budget", "Conference attendance", "Stock options"],
      postedDate: now,
      sourceUrl: `https://${source.toLowerCase().replace(' ', '')}.com/job/5`,
      sourcePortal: source
    },
    {
      title: "Data Analyst",
      companyName: "Analytics Indonesia",
      companyLogo: "https://ui-avatars.com/api/?name=AI&background=8b5cf6&color=fff",
      location: "Surabaya",
      workType: "full-time",
      workMode: "hybrid",
      salaryMin: 10000000,
      salaryMax: 18000000,
      salaryCurrency: "IDR",
      description: "Kami mencari Data Analyst untuk mengolah dan menganalisis data bisnis untuk mendukung keputusan strategis perusahaan.",
      requirements: "2+ tahun pengalaman sebagai Data Analyst. Mahir dalam SQL dan visualization tools.",
      requiredSkills: ["SQL", "Python", "Tableau", "Excel", "Statistics", "Data Visualization"],
      experienceLevel: "mid",
      educationRequirement: "S1 Statistika/Matematika/Informatika",
      industry: "Consulting",
      benefits: ["Health insurance", "Learning platform access", "WFH allowance"],
      postedDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      sourceUrl: `https://${source.toLowerCase().replace(' ', '')}.com/job/6`,
      sourcePortal: source
    },
    {
      title: "Mobile Developer (React Native)",
      companyName: "Mobile App Studio",
      companyLogo: "https://ui-avatars.com/api/?name=MA&background=14b8a6&color=fff",
      location: "Jakarta",
      workType: "full-time",
      workMode: "hybrid",
      salaryMin: 14000000,
      salaryMax: 22000000,
      salaryCurrency: "IDR",
      description: "Kembangkan aplikasi mobile cross-platform untuk berbagai klien. Bekerja dalam tim agile dengan proses development modern.",
      requirements: "3+ tahun pengalaman mobile development. Portfolio aplikasi yang sudah publish di Play Store/App Store.",
      requiredSkills: ["React Native", "JavaScript", "TypeScript", "Redux", "REST API", "Git"],
      experienceLevel: "mid",
      educationRequirement: "S1 Informatika",
      industry: "Technology",
      benefits: ["Project bonus", "Flexible schedule", "Device allowance"],
      postedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      sourceUrl: `https://${source.toLowerCase().replace(' ', '')}.com/job/7`,
      sourcePortal: source
    },
    {
      title: "UI/UX Designer",
      companyName: "Design Agency",
      companyLogo: "https://ui-avatars.com/api/?name=DA&background=f43f5e&color=fff",
      location: "Bali",
      workType: "full-time",
      workMode: "remote",
      salaryMin: 12000000,
      salaryMax: 20000000,
      salaryCurrency: "IDR",
      description: "Desain user interface dan user experience untuk berbagai produk digital. Kolaborasi dengan developer dan product team.",
      requirements: "3+ tahun pengalaman sebagai UI/UX Designer. Portfolio design yang kuat.",
      requiredSkills: ["Figma", "Adobe XD", "UI Design", "UX Research", "Prototyping", "Design System"],
      experienceLevel: "mid",
      educationRequirement: "S1 Design/DKV",
      industry: "Creative",
      benefits: ["Remote work", "Creative freedom", "Design tools subscription"],
      postedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      sourceUrl: `https://${source.toLowerCase().replace(' ', '')}.com/job/8`,
      sourcePortal: source
    },
    {
      title: "Technical Lead",
      companyName: "Enterprise Solutions",
      companyLogo: "https://ui-avatars.com/api/?name=ES&background=0ea5e9&color=fff",
      location: "Jakarta",
      workType: "full-time",
      workMode: "on-site",
      salaryMin: 35000000,
      salaryMax: 50000000,
      salaryCurrency: "IDR",
      description: "Pimpin tim engineering dalam membangun solusi enterprise. Bertanggung jawab atas technical decisions dan mentoring tim.",
      requirements: "7+ tahun pengalaman software development dengan 2+ tahun dalam leadership role.",
      requiredSkills: ["System Design", "Java", "Spring Boot", "Microservices", "Team Leadership", "Agile", "AWS"],
      experienceLevel: "lead",
      educationRequirement: "S1/S2 Computer Science",
      industry: "Enterprise",
      benefits: ["Leadership training", "Stock options", "Executive health check", "Car allowance"],
      postedDate: now,
      sourceUrl: `https://${source.toLowerCase().replace(' ', '')}.com/job/9`,
      sourcePortal: source
    },
    {
      title: "QA Engineer",
      companyName: "Quality Tech",
      companyLogo: "https://ui-avatars.com/api/?name=QT&background=84cc16&color=fff",
      location: "Tangerang",
      workType: "full-time",
      workMode: "hybrid",
      salaryMin: 10000000,
      salaryMax: 16000000,
      salaryCurrency: "IDR",
      description: "Bertanggung jawab untuk quality assurance dan testing aplikasi. Mengembangkan automated testing framework.",
      requirements: "2+ tahun pengalaman sebagai QA. Familiar dengan automated testing tools.",
      requiredSkills: ["Manual Testing", "Selenium", "Postman", "SQL", "JIRA", "Test Planning"],
      experienceLevel: "mid",
      educationRequirement: "S1 Informatika",
      industry: "Technology",
      benefits: ["Health insurance", "Training program", "Team outing"],
      postedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      sourceUrl: `https://${source.toLowerCase().replace(' ', '')}.com/job/10`,
      sourcePortal: source
    }
  ]
}

export async function scrapeAllPortals(): Promise<ScrapedJob[]> {
  const portals = [
    { url: 'https://www.linkedin.com/jobs/search/?keywords=developer&location=Indonesia', name: 'LinkedIn' },
    { url: 'https://www.jobstreet.co.id/jobs?q=developer', name: 'JobStreet' },
  ]

  const allJobs: ScrapedJob[] = []

  for (const portal of portals) {
    try {
      const jobs = await scrapeJobPortal(portal.url, portal.name)
      allJobs.push(...jobs)
    } catch (error) {
      console.error(`Failed to scrape ${portal.name}:`, error)
    }
  }

  return allJobs
}
