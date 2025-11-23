import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { scrapeAllPortals } from "@/lib/job-scraper"

export async function POST() {
  try {
    // Get sample jobs (or scrape if Firecrawl is configured)
    const scrapedJobs = await scrapeAllPortals()

    // Insert jobs into database
    let created = 0
    for (const job of scrapedJobs) {
      try {
        await db.job.create({
          data: {
            title: job.title,
            companyName: job.companyName,
            companyLogo: job.companyLogo,
            location: job.location,
            workType: job.workType,
            workMode: job.workMode,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryCurrency: job.salaryCurrency,
            description: job.description,
            requirements: job.requirements,
            requiredSkills: job.requiredSkills,
            experienceLevel: job.experienceLevel,
            educationRequirement: job.educationRequirement,
            industry: job.industry,
            benefits: job.benefits || [],
            postedDate: job.postedDate,
            applicationDeadline: job.applicationDeadline,
            sourceUrl: job.sourceUrl,
            sourcePortal: job.sourcePortal,
            isActive: true,
          },
        })
        created++
      } catch (e) {
        // Skip duplicates or errors
        console.log("Skipping job:", e)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${created} jobs successfully`,
      data: { created },
    })
  } catch (error) {
    console.error("Seed jobs error:", error)
    return NextResponse.json(
      { error: "Failed to seed jobs" },
      { status: 500 }
    )
  }
}
