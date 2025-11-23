# Product Requirements Document (PRD)
# AI Job Matcher - CV Parser & Job Recommendation System

**Version:** 1.0
**Date:** November 2024
**Author:** Development Team

---

## 1. Executive Summary

### 1.1 Product Overview
AI Job Matcher adalah platform web yang membantu pencari kerja menemukan pekerjaan yang paling sesuai dengan profil mereka. Sistem ini menggunakan AI untuk menganalisis CV pengguna, mengekstrak informasi penting, dan mencocokkannya dengan lowongan pekerjaan yang tersedia dari berbagai job portal.

### 1.2 Problem Statement
- Pencari kerja menghabiskan banyak waktu mencari lowongan yang sesuai secara manual
- Ketidakcocokan antara kualifikasi kandidat dengan persyaratan pekerjaan
- Recruiter hanya menghabiskan 6-8 detik untuk scan awal CV (sumber: [Resume Worded](https://resumeworded.com/what-employers-look-for-in-a-resume-key-advice))
- 75% resume ditolak oleh ATS sebelum dilihat manusia (sumber: [Jobseeker](https://www.jobseeker.com/en/resume/articles/hr-trends-hiring-statistics))

### 1.3 Solution
Platform AI yang secara otomatis:
1. Mengekstrak data penting dari CV pengguna
2. Melakukan scraping lowongan dari berbagai job portal
3. Mencocokkan profil pengguna dengan lowongan yang tersedia
4. Memberikan smart scoring untuk setiap rekomendasi pekerjaan

---

## 2. Goals & Objectives

### 2.1 Business Goals
- Menjadi platform job matching terdepan di Indonesia
- Meningkatkan efisiensi pencarian kerja hingga 70%
- Mencapai 10,000 pengguna aktif dalam 6 bulan pertama

### 2.2 User Goals
- Menemukan pekerjaan yang sesuai dengan kualifikasi dalam waktu singkat
- Memahami seberapa cocok profil mereka dengan lowongan tertentu
- Mendapatkan insight tentang skill gap yang perlu ditingkatkan

### 2.3 Success Metrics (KPIs)
| Metric | Target |
|--------|--------|
| CV Upload Success Rate | > 95% |
| Parsing Accuracy | > 90% |
| User Satisfaction Score | > 4.0/5.0 |
| Job Match Relevancy | > 80% |
| Average Time to Find Match | < 5 menit |

---

## 3. User Personas

### 3.1 Fresh Graduate - "Andi"
- **Usia:** 22-25 tahun
- **Background:** Baru lulus kuliah, minim pengalaman kerja
- **Pain Points:**
  - Tidak tahu pekerjaan apa yang cocok
  - CV belum terstruktur dengan baik
  - Bingung dengan banyaknya lowongan
- **Goals:** Menemukan entry-level job yang sesuai dengan jurusan dan skill

### 3.2 Professional - "Budi"
- **Usia:** 28-35 tahun
- **Background:** 5+ tahun pengalaman, ingin career switch/upgrade
- **Pain Points:**
  - Waktu terbatas untuk mencari kerja
  - Ingin posisi dengan gaji lebih tinggi
  - Perlu tahu market value skill-nya
- **Goals:** Menemukan posisi senior/lead yang sesuai dengan pengalaman

### 3.3 Career Changer - "Citra"
- **Usia:** 25-30 tahun
- **Background:** Ingin pindah industri/bidang
- **Pain Points:**
  - Tidak yakin transferable skills-nya
  - Khawatir dianggap tidak qualified
- **Goals:** Menemukan pekerjaan di bidang baru yang menghargai skill existing

---

## 4. Features & Requirements

### 4.1 Core Features

#### F1: CV Upload & Parsing
**Priority:** P0 (Critical)

**Description:**
Sistem menerima file CV dalam format PDF atau DOCX, kemudian mengekstrak informasi penting menggunakan AI.

**Data yang Diekstrak:**

| Field | Description | Priority |
|-------|-------------|----------|
| **Personal Information** | | |
| Full Name | Nama lengkap kandidat | P0 |
| Email | Alamat email | P0 |
| Phone Number | Nomor telepon | P0 |
| Location | Kota/provinsi domisili | P0 |
| LinkedIn URL | Profil LinkedIn (jika ada) | P1 |
| Portfolio URL | Website/portfolio pribadi | P2 |
| **Professional Summary** | | |
| Current Position | Jabatan/posisi saat ini | P0 |
| Years of Experience | Total tahun pengalaman | P0 |
| Career Objective | Ringkasan tujuan karir | P1 |
| **Work Experience** | | |
| Job Title | Nama posisi di setiap pekerjaan | P0 |
| Company Name | Nama perusahaan | P0 |
| Employment Period | Periode bekerja (start-end) | P0 |
| Job Description | Deskripsi pekerjaan & achievements | P0 |
| Industry | Industri perusahaan | P1 |
| **Education** | | |
| Degree | Jenjang pendidikan (S1, S2, dll) | P0 |
| Institution | Nama universitas/sekolah | P0 |
| Field of Study | Jurusan/program studi | P0 |
| Graduation Year | Tahun kelulusan | P0 |
| GPA | IPK (jika tersedia) | P2 |
| **Skills** | | |
| Technical Skills | Hard skills (programming, tools, dll) | P0 |
| Soft Skills | Kemampuan interpersonal | P1 |
| Languages | Bahasa yang dikuasai | P1 |
| Proficiency Level | Level kemahiran setiap skill | P1 |
| **Certifications** | | |
| Certification Name | Nama sertifikasi | P1 |
| Issuing Organization | Lembaga penerbit | P1 |
| Issue Date | Tanggal terbit | P2 |
| Expiry Date | Tanggal kadaluarsa | P2 |
| **Additional Info** | | |
| Projects | Proyek yang pernah dikerjakan | P1 |
| Achievements | Penghargaan & pencapaian | P1 |
| Publications | Publikasi (jika ada) | P2 |
| Volunteer Experience | Pengalaman volunteer | P2 |

**Acceptance Criteria:**
- [ ] Sistem menerima file PDF dan DOCX dengan ukuran maksimal 5MB
- [ ] Parsing berhasil dalam waktu < 30 detik
- [ ] Akurasi ekstraksi data > 90%
- [ ] User dapat mengedit hasil parsing jika ada kesalahan
- [ ] Sistem menampilkan preview hasil parsing sebelum disimpan

---

#### F2: Job Scraping Engine
**Priority:** P0 (Critical)

**Description:**
Sistem melakukan scraping lowongan pekerjaan dari berbagai job portal menggunakan Firecrawl API.

**Target Job Portals:**
1. **LinkedIn Jobs** - Portal profesional terbesar
2. **JobStreet** - Populer di Asia Tenggara
3. **Indeed Indonesia** - Job aggregator global
4. **Glints** - Fokus fresh graduate & startup
5. **Kalibrr** - Tech-focused job portal

**Data yang Di-scrape:**

| Field | Description |
|-------|-------------|
| Job Title | Nama posisi |
| Company Name | Nama perusahaan |
| Company Logo | URL logo perusahaan |
| Location | Lokasi pekerjaan |
| Work Type | Full-time/Part-time/Contract/Internship |
| Work Mode | Remote/Hybrid/On-site |
| Salary Range | Rentang gaji (jika tersedia) |
| Job Description | Deskripsi lengkap pekerjaan |
| Requirements | Persyaratan kandidat |
| Required Skills | Skill yang dibutuhkan |
| Experience Level | Entry/Mid/Senior/Lead |
| Education Requirement | Minimal pendidikan |
| Posted Date | Tanggal posting |
| Application Deadline | Batas waktu apply |
| Source URL | Link ke posting asli |
| Industry | Industri perusahaan |
| Company Size | Ukuran perusahaan |
| Benefits | Benefit yang ditawarkan |

**Acceptance Criteria:**
- [ ] Scraping berjalan secara scheduled (setiap 6 jam)
- [ ] Minimal 1000 lowongan aktif di database
- [ ] Data lowongan tidak lebih dari 7 hari
- [ ] Sistem mendeteksi dan menghapus duplikat
- [ ] Fallback mechanism jika satu portal gagal

---

#### F3: Smart Job Matching & Scoring
**Priority:** P0 (Critical)

**Description:**
AI menganalisis profil pengguna dan mencocokkannya dengan lowongan yang tersedia, menghasilkan skor kesesuaian.

**Scoring Algorithm Components:**

| Component | Weight | Description |
|-----------|--------|-------------|
| **Skill Match** | 30% | Kesesuaian technical & soft skills |
| **Experience Match** | 25% | Relevansi pengalaman kerja |
| **Education Match** | 15% | Kesesuaian pendidikan |
| **Location Match** | 10% | Proximity lokasi |
| **Seniority Match** | 10% | Kesesuaian level karir |
| **Industry Match** | 10% | Kesamaan industri |

**Scoring Scale:**
- **90-100%:** Perfect Match - Sangat direkomendasikan
- **75-89%:** Great Match - Peluang tinggi
- **60-74%:** Good Match - Layak dicoba
- **40-59%:** Partial Match - Perlu pertimbangan
- **< 40%:** Low Match - Kurang sesuai

**Match Details Display:**
```
┌─────────────────────────────────────────────┐
│ Software Engineer - PT Tech Indonesia       │
│ Match Score: 87%                            │
├─────────────────────────────────────────────┤
│ ✓ Skills: 90% (8/9 skills matched)          │
│ ✓ Experience: 85% (3-5 yrs required)        │
│ ✓ Education: 100% (S1 IT matched)           │
│ ✓ Location: 80% (Jakarta - Tangerang)       │
│ ✓ Level: 90% (Mid-level matched)            │
│ ─ Industry: 70% (Tech vs Fintech)           │
├─────────────────────────────────────────────┤
│ Missing Skills: Kubernetes, AWS             │
│ Recommendation: Consider upskilling in      │
│ cloud technologies                          │
└─────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Matching process selesai dalam < 10 detik
- [ ] Minimal 20 job recommendations per user
- [ ] Skor dapat dijelaskan (explainable AI)
- [ ] User dapat filter berdasarkan score range
- [ ] Sistem memberikan skill gap analysis

---

#### F4: User Dashboard
**Priority:** P0 (Critical)

**Description:**
Dashboard utama yang menampilkan profil user, rekomendasi pekerjaan, dan analytics.

**Dashboard Sections:**

1. **Profile Summary**
   - Extracted CV data visualization
   - Edit profile option
   - Profile completeness indicator

2. **Job Recommendations**
   - List of matched jobs dengan score
   - Filter & sort options
   - Save/bookmark job feature
   - Quick apply button

3. **Skill Analysis**
   - Top skills visualization
   - Market demand comparison
   - Skill gap identification
   - Learning recommendations

4. **Application Tracker**
   - Jobs applied
   - Application status
   - Interview schedules

**Acceptance Criteria:**
- [ ] Dashboard load time < 3 detik
- [ ] Responsive design (mobile-friendly)
- [ ] Real-time job recommendations update
- [ ] Export feature untuk saved jobs

---

### 4.2 Secondary Features

#### F5: Job Search & Filter
**Priority:** P1 (Important)

**Filters Available:**
- Job title / Keywords
- Location (city, province, remote)
- Salary range
- Experience level
- Work type (full-time, part-time, contract)
- Work mode (remote, hybrid, on-site)
- Industry
- Company size
- Posted date
- Match score range

---

#### F6: Skill Gap Analysis
**Priority:** P1 (Important)

**Features:**
- Identify missing skills for desired jobs
- Prioritize skills based on market demand
- Recommend learning resources (courses, certifications)
- Track skill improvement over time

---

#### F7: Notifications & Alerts
**Priority:** P1 (Important)

**Notification Types:**
- New job matches (daily/weekly digest)
- High-match job alerts (immediate)
- Application status updates
- Profile completion reminders
- Market insights

---

#### F8: Resume Improvement Suggestions
**Priority:** P2 (Nice to Have)

**Features:**
- ATS-friendliness score
- Keyword optimization suggestions
- Format improvement tips
- Achievement quantification suggestions

---

## 5. Technical Architecture

### 5.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (Next.js + TypeScript)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Upload  │  │Dashboard │  │  Search  │  │ Profile  │        │
│  │   Page   │  │   Page   │  │   Page   │  │   Page   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                    (Node.js + Express)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      API Gateway                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│       │              │              │              │            │
│       ▼              ▼              ▼              ▼            │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐        │
│  │   CV    │   │   Job   │   │ Matching│   │  User   │        │
│  │ Parser  │   │ Scraper │   │ Engine  │   │ Service │        │
│  │ Service │   │ Service │   │         │   │         │        │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘        │
└─────────────────────────────────────────────────────────────────┘
        │              │              │
        ▼              ▼              ▼
┌───────────┐   ┌───────────┐   ┌───────────┐
│   OpenAI  │   │ Firecrawl │   │ PostgreSQL│
│    API    │   │    API    │   │  Database │
└───────────┘   └───────────┘   └───────────┘
```

### 5.2 Tech Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | Next.js 14 + TypeScript | SSR, SEO-friendly, Type safety |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid development, consistent UI |
| **Backend** | Node.js + Express | JavaScript ecosystem, async handling |
| **Database** | PostgreSQL + Prisma | Relational data, type-safe ORM |
| **Cache** | Redis | Session, job cache |
| **AI/ML** | OpenAI GPT-4 | CV parsing, job matching |
| **Scraping** | Firecrawl API | Reliable, LLM-ready output |
| **File Storage** | AWS S3 / Cloudinary | CV file storage |
| **Auth** | NextAuth.js | OAuth, secure authentication |
| **Hosting** | Vercel + Railway | Easy deployment, scalable |

### 5.3 Database Schema (Simplified)

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Profiles Table (Parsed CV Data)
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    current_position VARCHAR(255),
    years_of_experience INTEGER,
    summary TEXT,
    raw_cv_url VARCHAR(500),
    parsed_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Skills Table
CREATE TABLE skills (
    id UUID PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id),
    name VARCHAR(100),
    category VARCHAR(50), -- technical, soft, language
    proficiency_level VARCHAR(50),
    years_of_experience INTEGER
);

-- Work Experience Table
CREATE TABLE work_experiences (
    id UUID PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id),
    job_title VARCHAR(255),
    company_name VARCHAR(255),
    location VARCHAR(255),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    industry VARCHAR(100)
);

-- Education Table
CREATE TABLE educations (
    id UUID PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id),
    degree VARCHAR(100),
    institution VARCHAR(255),
    field_of_study VARCHAR(255),
    graduation_year INTEGER,
    gpa DECIMAL(3,2)
);

-- Jobs Table (Scraped Jobs)
CREATE TABLE jobs (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    company_logo VARCHAR(500),
    location VARCHAR(255),
    work_type VARCHAR(50),
    work_mode VARCHAR(50),
    salary_min DECIMAL,
    salary_max DECIMAL,
    salary_currency VARCHAR(10),
    description TEXT,
    requirements TEXT,
    required_skills TEXT[],
    experience_level VARCHAR(50),
    education_requirement VARCHAR(100),
    industry VARCHAR(100),
    posted_date DATE,
    application_deadline DATE,
    source_url VARCHAR(500),
    source_portal VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Job Matches Table
CREATE TABLE job_matches (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    job_id UUID REFERENCES jobs(id),
    overall_score DECIMAL(5,2),
    skill_score DECIMAL(5,2),
    experience_score DECIMAL(5,2),
    education_score DECIMAL(5,2),
    location_score DECIMAL(5,2),
    seniority_score DECIMAL(5,2),
    industry_score DECIMAL(5,2),
    missing_skills TEXT[],
    match_details JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- Saved Jobs Table
CREATE TABLE saved_jobs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    job_id UUID REFERENCES jobs(id),
    saved_at TIMESTAMP DEFAULT NOW(),
    notes TEXT,
    UNIQUE(user_id, job_id)
);
```

### 5.4 API Endpoints

#### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - User login
POST   /api/auth/logout        - User logout
GET    /api/auth/me            - Get current user
```

#### Profile & CV
```
POST   /api/cv/upload          - Upload CV file
GET    /api/cv/parse-status    - Get parsing status
GET    /api/profile            - Get user profile
PUT    /api/profile            - Update profile
GET    /api/profile/skills     - Get user skills
PUT    /api/profile/skills     - Update skills
```

#### Jobs
```
GET    /api/jobs               - List jobs (with filters)
GET    /api/jobs/:id           - Get job details
GET    /api/jobs/search        - Search jobs
GET    /api/jobs/recommendations - Get matched jobs
POST   /api/jobs/:id/save      - Save job
DELETE /api/jobs/:id/save      - Unsave job
GET    /api/jobs/saved         - Get saved jobs
```

#### Matching
```
POST   /api/match/calculate    - Trigger matching calculation
GET    /api/match/results      - Get match results
GET    /api/match/analysis     - Get skill gap analysis
```

---

## 6. User Flows

### 6.1 Main User Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Landing   │────▶│   Sign Up   │────▶│   Upload    │
│    Page     │     │   / Login   │     │     CV      │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Apply    │◀────│    View     │◀────│   Review    │
│   to Job    │     │   Matches   │     │   Profile   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 6.2 CV Upload Flow

```
1. User clicks "Upload CV"
2. User selects PDF/DOCX file (max 5MB)
3. System validates file format
4. File uploaded to storage
5. AI parsing initiated
6. Loading screen with progress indicator
7. Parsing complete - show preview
8. User reviews & edits extracted data
9. User confirms & saves profile
10. Redirect to dashboard with matches
```

### 6.3 Job Matching Flow

```
1. User profile data retrieved
2. Active jobs fetched from database
3. For each job:
   a. Extract job requirements
   b. Compare with user profile
   c. Calculate component scores
   d. Calculate weighted overall score
   e. Identify skill gaps
4. Sort jobs by match score
5. Return top matches with details
6. Cache results for performance
```

---

## 7. UI/UX Design Guidelines

### 7.1 Design Principles
1. **Simplicity** - Minimal steps to get job matches
2. **Transparency** - Clear explanation of match scores
3. **Actionable** - Easy path from match to apply
4. **Mobile-first** - Responsive design priority

### 7.2 Color Palette
```
Primary:    #2563EB (Blue 600)   - CTAs, links
Secondary:  #10B981 (Green 500)  - Success, high scores
Warning:    #F59E0B (Amber 500)  - Medium scores
Danger:     #EF4444 (Red 500)    - Low scores, errors
Neutral:    #6B7280 (Gray 500)   - Text, borders
Background: #F9FAFB (Gray 50)    - Page background
```

### 7.3 Key Pages Wireframes

#### Landing Page
```
┌────────────────────────────────────────────────┐
│  Logo                    Login | Sign Up       │
├────────────────────────────────────────────────┤
│                                                │
│         Find Your Perfect Job Match            │
│         with AI-Powered CV Analysis            │
│                                                │
│     ┌──────────────────────────────────┐      │
│     │     📄 Upload Your CV            │      │
│     │     Drag & drop or click         │      │
│     └──────────────────────────────────┘      │
│                                                │
│   ✓ Smart CV Parsing    ✓ Job Matching        │
│   ✓ Skill Analysis      ✓ Career Insights     │
│                                                │
├────────────────────────────────────────────────┤
│              How It Works                      │
│   1. Upload  →  2. Analyze  →  3. Match       │
└────────────────────────────────────────────────┘
```

#### Dashboard
```
┌────────────────────────────────────────────────┐
│  Logo     Dashboard  Jobs  Profile    [Avatar] │
├────────────┬───────────────────────────────────┤
│            │                                   │
│  Profile   │   Your Top Job Matches            │
│  ────────  │   ───────────────────             │
│  📷 Photo  │   ┌─────────────────────────────┐│
│  John Doe  │   │ 🏢 Software Engineer  [95%] ││
│  Software  │   │    PT Tech Indo - Jakarta   ││
│  Engineer  │   │    💰 15-25jt  📍 Remote    ││
│            │   │    [View] [Save] [Apply]    ││
│  Skills:   │   └─────────────────────────────┘│
│  ▪ Python  │   ┌─────────────────────────────┐│
│  ▪ React   │   │ 🏢 Full Stack Dev    [88%] ││
│  ▪ Node.js │   │    Startup XYZ - Bandung    ││
│            │   └─────────────────────────────┘│
│  [Edit]    │                                   │
│            │   Skill Gap Analysis              │
│            │   ─────────────────               │
│            │   Missing: AWS, Docker            │
│            │   [View Courses →]                │
└────────────┴───────────────────────────────────┘
```

---

## 8. Security & Privacy

### 8.1 Data Protection
- CV files encrypted at rest (AES-256)
- All API communications over HTTPS
- Personal data compliant with Indonesian PP 71/2019
- User data deletion available on request

### 8.2 Authentication
- Password hashing with bcrypt (cost factor 12)
- JWT tokens with short expiry (1 hour)
- Refresh token rotation
- OAuth 2.0 support (Google, LinkedIn)

### 8.3 Rate Limiting
- API: 100 requests/minute per user
- CV Upload: 5 uploads/hour per user
- Job Scraping: Respect robots.txt & rate limits

---

## 9. Performance Requirements

| Metric | Target |
|--------|--------|
| Page Load Time | < 3 seconds |
| CV Upload | < 5 seconds |
| CV Parsing | < 30 seconds |
| Job Matching | < 10 seconds |
| Search Response | < 2 seconds |
| API Response (95th percentile) | < 500ms |
| Uptime | 99.5% |

---

## 10. MVP Scope

### Phase 1 - MVP (8 weeks)

**Included:**
- ✅ User authentication (email/password)
- ✅ CV upload (PDF only)
- ✅ Basic CV parsing (name, email, skills, experience)
- ✅ Job scraping from 2 portals (LinkedIn, JobStreet)
- ✅ Basic job matching with scoring
- ✅ Dashboard with job recommendations
- ✅ Job search with basic filters
- ✅ Save jobs functionality

**Not Included:**
- ❌ OAuth login
- ❌ DOCX support
- ❌ Advanced skill gap analysis
- ❌ Resume improvement suggestions
- ❌ Notification system
- ❌ Application tracking
- ❌ Mobile app

### Phase 2 - Enhanced (4 weeks post-MVP)
- OAuth login (Google)
- DOCX support
- More job portals (Indeed, Glints)
- Email notifications
- Skill gap analysis with course recommendations

### Phase 3 - Advanced (4 weeks post-Phase 2)
- Resume improvement suggestions
- Application tracking
- Company insights
- Salary insights
- Mobile-responsive improvements

---

## 11. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Job portal blocks scraping | High | Medium | Use Firecrawl with proxy rotation, respect rate limits |
| Low CV parsing accuracy | High | Medium | Use GPT-4, implement user correction feature |
| API costs exceed budget | Medium | Medium | Implement caching, batch processing |
| Poor job matching relevancy | High | Low | Iterative algorithm improvement based on feedback |
| Data privacy concerns | High | Low | Clear privacy policy, data encryption, user consent |

---

## 12. Dependencies

### External Services
1. **OpenAI API** - CV parsing & matching intelligence
2. **Firecrawl API** - Job portal scraping
3. **AWS S3 / Cloudinary** - File storage
4. **Vercel** - Frontend hosting
5. **Railway / Supabase** - Backend & database hosting

### API Keys Required
- `OPENAI_API_KEY`
- `FIRECRAWL_API_KEY`
- `AWS_ACCESS_KEY_ID` / `CLOUDINARY_API_KEY`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`

---

## 13. Glossary

| Term | Definition |
|------|------------|
| ATS | Applicant Tracking System - software used by companies to manage job applications |
| CV Parsing | Process of extracting structured data from CV/resume documents |
| Job Matching | Algorithm that compares candidate profile with job requirements |
| Smart Score | Weighted score indicating how well a candidate matches a job |
| Skill Gap | Difference between candidate's skills and job requirements |
| Firecrawl | Web scraping API that converts websites to LLM-ready data |

---

## 14. References

- [Resume Worded - What Employers Look For](https://resumeworded.com/what-employers-look-for-in-a-resume-key-advice)
- [Jobseeker - HR Trends & Statistics 2025](https://www.jobseeker.com/en/resume/articles/hr-trends-hiring-statistics)
- [Workable - How ATS Reads Resumes](https://resources.workable.com/stories-and-insights/how-ATS-reads-resumes)
- [Firecrawl Documentation](https://docs.firecrawl.dev/introduction)
- [Firecrawl - Scraping Job Boards](https://www.firecrawl.dev/blog/scrape-job-boards-firecrawl-openai)

---

## 15. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| Designer | | | |
| Stakeholder | | | |

---

*Document Version History:*
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 2024 | Dev Team | Initial PRD |
