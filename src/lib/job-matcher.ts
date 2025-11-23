import { Profile, Job, JobMatch, MatchDetails, Skill, WorkExperience, Education } from '@/types'

// Scoring weights as defined in PRD
const WEIGHTS = {
  skill: 0.30,
  experience: 0.25,
  education: 0.15,
  location: 0.10,
  seniority: 0.10,
  industry: 0.10
}

// Experience level mapping
const EXPERIENCE_LEVELS: Record<string, { min: number; max: number }> = {
  'entry': { min: 0, max: 2 },
  'mid': { min: 2, max: 5 },
  'senior': { min: 5, max: 8 },
  'lead': { min: 8, max: 12 },
  'executive': { min: 12, max: 99 }
}

// Education level hierarchy
const EDUCATION_HIERARCHY: Record<string, number> = {
  'sma': 1,
  'high school': 1,
  'd1': 2,
  'd2': 2,
  'd3': 3,
  'diploma': 3,
  's1': 4,
  'bachelor': 4,
  'sarjana': 4,
  's2': 5,
  'master': 5,
  'magister': 5,
  's3': 6,
  'phd': 6,
  'doctorate': 6,
  'doktor': 6
}

export function calculateJobMatch(
  profile: {
    skills: Skill[]
    workExperiences: WorkExperience[]
    educations: Education[]
    location?: string
    yearsOfExperience: number
    currentPosition?: string
  },
  job: Job
): Omit<JobMatch, 'id' | 'userId' | 'createdAt'> {
  const skillAnalysis = calculateSkillMatch(profile.skills, job.requiredSkills)
  const experienceAnalysis = calculateExperienceMatch(profile.yearsOfExperience, job.experienceLevel)
  const educationAnalysis = calculateEducationMatch(profile.educations, job.educationRequirement)
  const locationAnalysis = calculateLocationMatch(profile.location, job.location, job.workMode)
  const seniorityAnalysis = calculateSeniorityMatch(profile.currentPosition, profile.yearsOfExperience, job.experienceLevel)
  const industryAnalysis = calculateIndustryMatch(profile.workExperiences, job.industry)

  const overallScore =
    (skillAnalysis.percentage * WEIGHTS.skill) +
    (experienceAnalysis.percentage * WEIGHTS.experience) +
    (educationAnalysis.percentage * WEIGHTS.education) +
    (locationAnalysis.percentage * WEIGHTS.location) +
    (seniorityAnalysis.percentage * WEIGHTS.seniority) +
    (industryAnalysis.percentage * WEIGHTS.industry)

  const matchDetails: MatchDetails = {
    skillAnalysis: {
      matched: skillAnalysis.matched,
      missing: skillAnalysis.missing,
      percentage: skillAnalysis.percentage
    },
    experienceAnalysis: {
      required: `${EXPERIENCE_LEVELS[job.experienceLevel]?.min || 0}+ years`,
      userHas: `${profile.yearsOfExperience} years`,
      isMatch: experienceAnalysis.isMatch,
      percentage: experienceAnalysis.percentage
    },
    educationAnalysis: {
      required: job.educationRequirement || 'Not specified',
      userHas: profile.educations[0]?.degree || 'Not specified',
      isMatch: educationAnalysis.isMatch,
      percentage: educationAnalysis.percentage
    },
    locationAnalysis: {
      jobLocation: job.location,
      userLocation: profile.location || 'Not specified',
      percentage: locationAnalysis.percentage
    },
    recommendations: generateRecommendations(skillAnalysis, experienceAnalysis, educationAnalysis)
  }

  return {
    job,
    jobId: job.id,
    overallScore: Math.round(overallScore * 100) / 100,
    skillScore: Math.round(skillAnalysis.percentage * 100) / 100,
    experienceScore: Math.round(experienceAnalysis.percentage * 100) / 100,
    educationScore: Math.round(educationAnalysis.percentage * 100) / 100,
    locationScore: Math.round(locationAnalysis.percentage * 100) / 100,
    seniorityScore: Math.round(seniorityAnalysis.percentage * 100) / 100,
    industryScore: Math.round(industryAnalysis.percentage * 100) / 100,
    matchingSkills: skillAnalysis.matched,
    missingSkills: skillAnalysis.missing,
    matchDetails
  }
}

function calculateSkillMatch(
  userSkills: Skill[],
  requiredSkills: string[]
): { matched: string[]; missing: string[]; percentage: number } {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { matched: [], missing: [], percentage: 100 }
  }

  const userSkillNames = userSkills.map(s => s.name.toLowerCase())
  const matched: string[] = []
  const missing: string[] = []

  for (const required of requiredSkills) {
    const requiredLower = required.toLowerCase()
    const isMatched = userSkillNames.some(userSkill =>
      userSkill.includes(requiredLower) ||
      requiredLower.includes(userSkill) ||
      getSimilarSkills(requiredLower).some(similar => userSkill.includes(similar))
    )

    if (isMatched) {
      matched.push(required)
    } else {
      missing.push(required)
    }
  }

  const percentage = (matched.length / requiredSkills.length) * 100
  return { matched, missing, percentage }
}

function getSimilarSkills(skill: string): string[] {
  const skillMappings: Record<string, string[]> = {
    'javascript': ['js', 'ecmascript', 'es6'],
    'typescript': ['ts'],
    'python': ['py'],
    'react': ['reactjs', 'react.js'],
    'vue': ['vuejs', 'vue.js'],
    'angular': ['angularjs', 'angular.js'],
    'node': ['nodejs', 'node.js'],
    'postgres': ['postgresql', 'psql'],
    'mongo': ['mongodb'],
    'aws': ['amazon web services'],
    'gcp': ['google cloud', 'google cloud platform'],
    'kubernetes': ['k8s'],
    'docker': ['containerization'],
    'ci/cd': ['cicd', 'continuous integration', 'continuous deployment'],
    'sql': ['mysql', 'postgresql', 'oracle', 'sql server']
  }

  return skillMappings[skill] || []
}

function calculateExperienceMatch(
  userYears: number,
  requiredLevel: string
): { isMatch: boolean; percentage: number } {
  const required = EXPERIENCE_LEVELS[requiredLevel] || { min: 0, max: 99 }

  if (userYears >= required.min && userYears <= required.max) {
    return { isMatch: true, percentage: 100 }
  }

  if (userYears > required.max) {
    // Overqualified but still good
    return { isMatch: true, percentage: 85 }
  }

  // Underqualified
  const gap = required.min - userYears
  const percentage = Math.max(0, 100 - (gap * 20))
  return { isMatch: false, percentage }
}

function calculateEducationMatch(
  userEducations: Education[],
  requiredEducation?: string
): { isMatch: boolean; percentage: number } {
  if (!requiredEducation) {
    return { isMatch: true, percentage: 100 }
  }

  const requiredLower = requiredEducation.toLowerCase()
  let requiredLevel = 0

  for (const [key, level] of Object.entries(EDUCATION_HIERARCHY)) {
    if (requiredLower.includes(key)) {
      requiredLevel = Math.max(requiredLevel, level)
    }
  }

  let userLevel = 0
  for (const edu of userEducations) {
    const degreeLower = edu.degree.toLowerCase()
    for (const [key, level] of Object.entries(EDUCATION_HIERARCHY)) {
      if (degreeLower.includes(key)) {
        userLevel = Math.max(userLevel, level)
      }
    }
  }

  if (userLevel >= requiredLevel) {
    return { isMatch: true, percentage: 100 }
  }

  const gap = requiredLevel - userLevel
  const percentage = Math.max(0, 100 - (gap * 25))
  return { isMatch: false, percentage }
}

function calculateLocationMatch(
  userLocation?: string,
  jobLocation?: string,
  workMode?: string
): { percentage: number } {
  // Remote jobs always match
  if (workMode === 'remote') {
    return { percentage: 100 }
  }

  if (!userLocation || !jobLocation) {
    return { percentage: 50 }
  }

  const userLoc = userLocation.toLowerCase()
  const jobLoc = jobLocation.toLowerCase()

  // Exact match
  if (userLoc === jobLoc || userLoc.includes(jobLoc) || jobLoc.includes(userLoc)) {
    return { percentage: 100 }
  }

  // Same province/region check (simplified)
  const indonesiaCities: Record<string, string[]> = {
    'jakarta': ['tangerang', 'bekasi', 'depok', 'bogor'],
    'bandung': ['cimahi'],
    'surabaya': ['sidoarjo', 'gresik'],
    'yogyakarta': ['sleman', 'bantul'],
  }

  for (const [city, nearby] of Object.entries(indonesiaCities)) {
    if ((userLoc.includes(city) || nearby.some(n => userLoc.includes(n))) &&
        (jobLoc.includes(city) || nearby.some(n => jobLoc.includes(n)))) {
      return { percentage: 80 }
    }
  }

  // Hybrid gets partial score
  if (workMode === 'hybrid') {
    return { percentage: 60 }
  }

  return { percentage: 30 }
}

function calculateSeniorityMatch(
  currentPosition?: string,
  yearsOfExperience?: number,
  requiredLevel?: string
): { percentage: number } {
  const seniorityKeywords: Record<string, string[]> = {
    'entry': ['junior', 'entry', 'intern', 'trainee', 'fresh'],
    'mid': ['mid', 'middle', 'intermediate'],
    'senior': ['senior', 'sr', 'experienced'],
    'lead': ['lead', 'principal', 'staff', 'architect'],
    'executive': ['head', 'director', 'vp', 'cto', 'ceo', 'manager', 'chief']
  }

  if (!currentPosition && !yearsOfExperience) {
    return { percentage: 50 }
  }

  const positionLower = (currentPosition || '').toLowerCase()
  const years = yearsOfExperience || 0

  // Determine user's likely level
  let userLevel = 'entry'
  if (years >= 8 || seniorityKeywords['lead'].some(k => positionLower.includes(k))) {
    userLevel = 'lead'
  } else if (years >= 5 || seniorityKeywords['senior'].some(k => positionLower.includes(k))) {
    userLevel = 'senior'
  } else if (years >= 2 || seniorityKeywords['mid'].some(k => positionLower.includes(k))) {
    userLevel = 'mid'
  }

  const levels = ['entry', 'mid', 'senior', 'lead', 'executive']
  const userIndex = levels.indexOf(userLevel)
  const requiredIndex = levels.indexOf(requiredLevel || 'mid')

  if (userIndex === requiredIndex) {
    return { percentage: 100 }
  }

  if (userIndex > requiredIndex) {
    // Overqualified
    return { percentage: 80 }
  }

  // Underqualified
  const gap = requiredIndex - userIndex
  return { percentage: Math.max(0, 100 - (gap * 30)) }
}

function calculateIndustryMatch(
  workExperiences: WorkExperience[],
  jobIndustry?: string
): { percentage: number } {
  if (!jobIndustry) {
    return { percentage: 100 }
  }

  const jobIndustryLower = jobIndustry.toLowerCase()
  const userIndustries = workExperiences
    .filter(exp => exp.industry)
    .map(exp => exp.industry!.toLowerCase())

  // Direct match
  if (userIndustries.some(ind => ind.includes(jobIndustryLower) || jobIndustryLower.includes(ind))) {
    return { percentage: 100 }
  }

  // Related industries
  const relatedIndustries: Record<string, string[]> = {
    'technology': ['software', 'it', 'tech', 'saas', 'fintech', 'startup', 'digital'],
    'finance': ['banking', 'fintech', 'insurance', 'investment'],
    'ecommerce': ['retail', 'marketplace', 'digital'],
    'healthcare': ['medical', 'health', 'pharma', 'biotech'],
    'education': ['edtech', 'training', 'learning']
  }

  for (const [industry, related] of Object.entries(relatedIndustries)) {
    const jobMatches = jobIndustryLower.includes(industry) || related.some(r => jobIndustryLower.includes(r))
    const userMatches = userIndustries.some(ui => ui.includes(industry) || related.some(r => ui.includes(r)))

    if (jobMatches && userMatches) {
      return { percentage: 75 }
    }
  }

  // Some work experience is better than none
  if (workExperiences.length > 0) {
    return { percentage: 50 }
  }

  return { percentage: 30 }
}

function generateRecommendations(
  skillAnalysis: { matched: string[]; missing: string[]; percentage: number },
  experienceAnalysis: { isMatch: boolean; percentage: number },
  educationAnalysis: { isMatch: boolean; percentage: number }
): string[] {
  const recommendations: string[] = []

  if (skillAnalysis.missing.length > 0) {
    if (skillAnalysis.missing.length <= 3) {
      recommendations.push(`Consider learning: ${skillAnalysis.missing.join(', ')}`)
    } else {
      recommendations.push(`Key skills to develop: ${skillAnalysis.missing.slice(0, 3).join(', ')} and ${skillAnalysis.missing.length - 3} more`)
    }
  }

  if (!experienceAnalysis.isMatch && experienceAnalysis.percentage < 80) {
    recommendations.push('Gaining more experience in similar roles would strengthen your application')
  }

  if (!educationAnalysis.isMatch && educationAnalysis.percentage < 80) {
    recommendations.push('Consider relevant certifications to supplement your educational background')
  }

  if (skillAnalysis.percentage >= 90 && experienceAnalysis.isMatch) {
    recommendations.push('Strong match! Apply with confidence')
  }

  return recommendations
}

export function sortJobsByMatch(matches: JobMatch[]): JobMatch[] {
  return [...matches].sort((a, b) => b.overallScore - a.overallScore)
}
