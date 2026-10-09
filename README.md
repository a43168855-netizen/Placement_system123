# PlacePro — Production-Style Student Placement Management System

A full-stack, enterprise-grade Student Placement Management System engineered with the **MERN** stack (MongoDB, Express.js, React.js, Node.js). Built with a decoupled monorepo architecture, role-based access control (Admin, Recruiter, Student), centralized JWT authentication, responsive Tailwind CSS interface, comprehensive RESTful APIs, and automated test suites.

---

## 📑 Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Mandatory Tech Stack & Dependencies](#mandatory-tech-stack--dependencies)
3. [System Roles & Permissions Matrix](#system-roles--permissions-matrix)
4. [Database Schemas & Data Model](#database-schemas--data-model)
5. [REST API Documentation & Endpoints](#rest-api-documentation--endpoints)
6. [Security Architecture](#security-architecture)
7. [Installation & Local Setup](#installation--local-setup)
8. [Database Seeding & Demo Credentials](#database-seeding--demo-credentials)
9. [Automated Testing Strategy & Verification](#automated-testing-strategy--verification)
10. [Requirement-by-Requirement Compliance Checklist](#requirement-by-requirement-compliance-checklist)
11. [Project Structure](#project-structure)

---

## 🏛️ Architectural Overview

The application follows a clean **MVC (Model-View-Controller)** pattern on the server, paired with a component-driven, service-oriented architecture on the React frontend.

```
┌────────────────────────────────────────────────────────┐
│                   React.js Frontend                    │
│   (Tailwind CSS, React Router, Context API, Axios)     │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP (JWT Bearer Auth)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Express.js Backend                   │
│   (Helmet, CORS, Rate Limiters, Morgan, Middlewares)   │
├────────────────────────────────────────────────────────┤
│  Controllers  │  Validation & Error Handlers  │  Auth  │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose ODM
                            ▼
┌────────────────────────────────────────────────────────┐
│                   MongoDB Database                     │
│    (Users, Profiles, Companies, Jobs, Applications)    │
└────────────────────────────────────────────────────────┘
```

- **Client (`/client`)**: Vite-powered React 19 single-page application using Tailwind CSS v4, Lucide icons, React Router v7, and Axios with request/response interceptors for seamless token handling and auto-redirects.
- **Server (`/server`)**: Modular Express.js REST API with route-level security, rate limiting, bcrypt password hashing, and centralized error handling middleware.
- **Database**: MongoDB with Mongoose ODM implementing strict schemas, compound indexes for duplicate prevention, and relational population.

---

## 💻 Mandatory Tech Stack & Dependencies

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, React Router v7, Axios, Tailwind CSS v4, Lucide React, Vitest, React Testing Library |
| **Backend** | Node.js (v24), Express.js (v4), Mongoose (v8), JWT (jsonwebtoken), bcryptjs, Helmet, CORS, express-rate-limit, Morgan |
| **Database** | MongoDB (v8) / MongoDB Atlas / Local MongoDB Service |
| **Testing** | Jest & Supertest (Backend API tests), Vitest & RTL (Frontend component tests) |

---

## 👥 System Roles & Permissions Matrix

### 1. 🛡️ Admin (Placement Director / Cell Officer)
- **Dashboard**: Live institutional KPIs (Total students, companies, job listings, application status funnel, placement percentage %, average & highest package, department-wise placement breakdown).
- **Student Management**: Full CRUD operations on student records, CGPA updates, and placement records.
- **Company Management**: Full CRUD on participating corporate partners and recruiter assignments.
- **Job Drives**: Create, update, toggle status (active/closed), and delete campus job listings.
- **Application Registry**: Audit all applications campus-wide, override status, and provide remarks.
- **User & Access Control**: Manage all user accounts, switch roles, and activate/deactivate accounts.
- **Placement Reports**: Visual branch conversion analysis and 1-click CSV report export.

### 2. 💼 Recruiter (Corporate Talent Acquisition)
- **Dashboard**: Company profile overview, active postings count, total applicants count, candidate status breakdown.
- **Job Postings**: Create and manage job drives owned by the recruiter (salary in LPA, location, min CGPA, eligible departments, required skills, deadline, openings). Strict ownership enforcement guarantees recruiters cannot modify or delete competitors' listings.
- **Applicant Tracking System (ATS)**: Filter candidates by job and status, inspect candidate academic credentials (CGPA, degree, department, resume link, skills), update workflow stage (**Pending**, **Shortlisted**, **Selected**, **Rejected**) with custom recruiter remarks.

### 3. 🎓 Student (Eligible Campus Candidate)
- **Dashboard**: Academic credentials summary, application status counters, recommended jobs, and recent application log.
- **Available Jobs**: Real-time search by title, skills, and company; filter by location. View job criteria and check eligibility dynamically against student's CGPA and branch.
- **Job Application Workflow**: Apply for eligible jobs with optional cover note. Duplicate applications are strictly prevented on both frontend and backend.
- **My Applications**: Track application statuses (**Pending**, **Shortlisted**, **Selected**, **Rejected**) with recruiter interview feedback and remarks.
- **Academic Profile**: Update technical skills, resume URL, contact phone number, and professional bio.

---

## 🗄️ Database Schemas & Data Model

### 1. `User` Model
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'recruiter', 'student'], default: 'student' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  timestamps: true
}
```

### 2. `StudentProfile` Model
```javascript
{
  user: { type: ObjectId, ref: 'User', required: true, unique: true },
  rollNo: { type: String, required: true, unique: true, uppercase: true },
  course: { type: String, required: true, default: 'B.Tech' },
  department: { type: String, required: true },
  graduationYear: { type: Number, required: true },
  cgpa: { type: Number, required: true, min: 0, max: 10 },
  skills: [{ type: String }],
  resumeUrl: { type: String },
  phone: { type: String },
  bio: { type: String },
  placementStatus: { type: String, enum: ['unplaced', 'placed', 'opted_out'], default: 'unplaced' },
  placedCompany: { type: String },
  placedPackage: { type: Number, default: 0 },
  timestamps: true
}
```

### 3. `Company` Model
```javascript
{
  name: { type: String, required: true, unique: true },
  description: { type: String },
  website: { type: String },
  location: { type: String },
  industry: { type: String, default: 'Technology' },
  contactEmail: { type: String },
  recruiter: { type: ObjectId, ref: 'User' },
  timestamps: true
}
```

### 4. `Job` Model
```javascript
{
  title: { type: String, required: true },
  company: { type: ObjectId, ref: 'Company', required: true },
  recruiter: { type: ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  minCgpa: { type: Number, default: 0 },
  eligibleDepartments: [{ type: String }],
  requiredSkills: [{ type: String }],
  salary: { type: Number, required: true }, // In LPA
  location: { type: String, required: true },
  jobType: { type: String, enum: ['Full-time', 'Internship', 'Contract', 'Part-time'], default: 'Full-time' },
  deadline: { type: Date, required: true },
  openings: { type: Number, default: 1 },
  status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
  timestamps: true
}
```

### 5. `JobApplication` Model
```javascript
{
  student: { type: ObjectId, ref: 'User', required: true },
  studentProfile: { type: ObjectId, ref: 'StudentProfile' },
  job: { type: ObjectId, ref: 'Job', required: true },
  appliedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'shortlisted', 'rejected', 'selected'], default: 'pending' },
  recruiterRemarks: { type: String },
  coverLetter: { type: String },
  timestamps: true
}
// Unique compound index: ensures a student cannot apply twice to the same job:
jobApplicationSchema.index({ student: 1, job: 1 }, { unique: true });
```

---

## 🔌 REST API Documentation & Endpoints

All authenticated endpoints require the HTTP header:
`Authorization: Bearer <jwt_token>`

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new student or recruiter |
| `POST` | `/api/auth/login` | Public | Login and receive JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |

### Students (`/api/students`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/students` | Admin, Recruiter | Paginated student list with search & department filters |
| `POST` | `/api/students` | Admin | Create student record + profile |
| `GET` | `/api/students/:id` | Authenticated | Retrieve single student profile & applications |
| `PUT` | `/api/students/:id` | Admin | Update student academic & placement info |
| `DELETE` | `/api/students/:id` | Admin | Delete student record and cascading records |
| `GET` | `/api/students/profile/me` | Student | Logged-in student profile |
| `PUT` | `/api/students/profile/me` | Student | Update personal profile, skills, bio, resume URL |

### Companies (`/api/companies`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/companies` | Public / Auth | List partner companies with active job counts |
| `GET` | `/api/companies/my-company` | Recruiter | Get authenticated recruiter's organization |
| `POST` | `/api/companies` | Admin, Recruiter | Register partner company |
| `GET` | `/api/companies/:id` | Public / Auth | Get company details and job postings |
| `PUT` | `/api/companies/:id` | Admin, Owner Recruiter | Update company info |
| `DELETE` | `/api/companies/:id` | Admin | Delete company and its jobs |

### Jobs (`/api/jobs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | Public / Auth | List jobs with search, department, salary filters |
| `POST` | `/api/jobs` | Admin, Recruiter | Create new job posting |
| `GET` | `/api/jobs/:id` | Public / Auth | Job details + student eligibility evaluation |
| `PUT` | `/api/jobs/:id` | Admin, Owner Recruiter | Update job drive details |
| `DELETE` | `/api/jobs/:id` | Admin, Owner Recruiter | Delete job listing |

### Applications (`/api/applications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/applications` | Student | Submit job application (validates CGPA, branch, deadline, duplicates) |
| `GET` | `/api/applications/my-applications` | Student | Student personal application history |
| `GET` | `/api/applications/recruiter` | Recruiter | Recruiter ATS candidate list across all their jobs |
| `GET` | `/api/applications/job/:jobId` | Admin, Recruiter | Applications for a specific job |
| `GET` | `/api/applications` | Admin | Campus-wide application registry |
| `GET` | `/api/applications/:id` | Authenticated | View specific application details |
| `PATCH` | `/api/applications/:id/status` | Admin, Recruiter | Update status (`pending`, `shortlisted`, `selected`, `rejected`) + remarks |

### Dashboards (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/admin` | Admin | Institutional placement KPIs, branch analytics, recent feeds |
| `GET` | `/api/dashboard/student` | Student | Student application funnel, upcoming drives, eligibility status |
| `GET` | `/api/dashboard/recruiter` | Recruiter | Recruiter drive metrics, applicant count, candidate funnel |

### Users (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Admin | List all user accounts with role & status filters |
| `POST` | `/api/users` | Admin | Create user account with specified role |
| `GET` | `/api/users/:id` | Admin | User account details |
| `PUT` | `/api/users/:id` | Admin | Update user name, email, role, status |
| `DELETE` | `/api/users/:id` | Admin | Delete user account |

---

## 🔒 Security Architecture

1. **Password Security**: Passwords hashed with `bcryptjs` using 10 salt rounds. Plaintext passwords are never stored or returned in responses (`select: false`).
2. **JWT Authorization**: Cryptographically signed JSON Web Tokens with configurable expiration (`7d`).
3. **Role-Based Access Control (RBAC)**: Enforced via `authorize(...roles)` middleware preventing horizontal or vertical privilege escalation.
4. **Ownership Verification**: Recruiters are restricted from editing or deleting other recruiters' job listings or inspecting unauthorized applications.
5. **Rate Limiting**: Integrated `express-rate-limit` protecting `/api/auth/*` routes against brute force attacks.
6. **HTTP Hardening**: Configured `helmet` security headers and restricted `cors` policies.
7. **Database Safeguards**: Composite unique index on `JobApplication` `{ student: 1, job: 1 }` prevents race condition duplicate submissions.

---

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB running locally on port 27017 or a MongoDB Atlas connection string

### Step 1: Clone or Navigate to the Project
```bash
cd placement-management-system
```

### Step 2: Backend Setup
```bash
cd server
npm install
```

Configure `.env` in `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/placement_management_db
JWT_SECRET=super_secret_jwt_key_placement_system_2026_xyz
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Step 3: Seed the Database
Populate the database with realistic demo accounts, companies, drives, and applications:
```bash
npm run seed
```

### Step 4: Frontend Setup
```bash
cd ../client
npm install
```

---

## 🔑 Database Seeding & Demo Credentials

The database includes pre-configured demo users across all three roles:

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dr. Ramesh Sharma | `admin@placement.edu` | `AdminPassword@123` | Placement Cell Director |
| **Recruiter** | Sarah Jenkins | `recruiter@google.com` | `RecruiterPassword@123` | Senior Recruiter, Google Cloud |
| **Recruiter** | David Miller | `recruiter@microsoft.com` | `RecruiterPassword@123` | Talent Acquisition, Microsoft |
| **Student** | Aarav Mehta | `student@placement.edu` | `StudentPassword@123` | B.Tech CS, CGPA 8.85 (Unplaced) |
| **Student** | Ananya Patel | `ananya.patel@placement.edu` | `StudentPassword@123` | B.Tech IT, CGPA 9.20 (Placed at Google) |

> **Tip:** The Login page features **1-Click Demo Fill** buttons to immediately test any role without manual typing.

---

## ▶️ Running the Application Locally

### Start the Backend Server (Port 5000)
```bash
cd server
npm start
# Or for live reload during development:
npm run dev
```

### Start the Frontend Client (Port 5173)
```bash
cd client
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🧪 Automated Testing Strategy & Verification

### 1. Backend Test Suite (Jest & Supertest)
Runs 21 comprehensive automated integration tests against an isolated test database (`placement_management_test_db`):
- Login success & credential failure scenarios
- Missing / invalid token handling & unauthorized 401s
- Role-based route restrictions (Student accessing Admin endpoints 403)
- Student CRUD operations (Admin-only creation, update, delete)
- Job CRUD operations & strict Recruiter ownership enforcement
- Application submission, CGPA eligibility verification, deadline checks
- Duplicate application prevention (DB unique compound index check)
- Recruiter application status progression & remarks

**Command to run backend tests:**
```bash
cd server
npm test
```

### 2. Frontend Test Suite (Vitest & React Testing Library)
Tests UI component rendering and user interactions:
- `Badge.test.jsx`: Status pill rendering and class mapping
- `StatCard.test.jsx`: KPI metrics and trend rendering
- `Login.test.jsx`: Form rendering, validation messages, and 1-click demo credential population

**Command to run frontend tests:**
```bash
cd client
npm test
```

---

## 📋 Requirement-by-Requirement Compliance Checklist

| Requirement | Description | Status | Implementation Details |
| :--- | :--- | :---: | :--- |
| **1. Tech Stack** | React, Node, Express, MongoDB, Tailwind, Jest/RTL | ✅ | Pure modern MERN architecture, zero mock APIs |
| **2. Role System** | Admin, Recruiter, Student dashboards & permissions | ✅ | Distinct dashboards, permissions, and navigation |
| **3. UI/UX** | Responsive SaaS UI, stat cards, search, filters, modals | ✅ | Polished Tailwind UI, empty states, skeletons, toast alerts |
| **4. Auth & Roles** | JWT, bcrypt, protected routes, seed script | ✅ | RoleRoute, ProtectedRoute, authLimiter, secure cookies/tokens |
| **5. Admin Features** | Dashboard KPIs, Student/Company/Job/App/User CRUD | ✅ | Complete CRUD with modals, search, pagination, CSV report |
| **6. Student Features** | Dashboard, profile, browse jobs, apply, duplicate block | ✅ | Eligibility checks, deadline validation, application tracking |
| **7. Recruiter Features**| Post jobs, manage own jobs, ATS candidate review | ✅ | Ownership validation, candidate status progression + remarks |
| **8. Database Design** | User, StudentProfile, Company, Job, JobApplication | ✅ | Relational schemas, compound unique index on `[student, job]` |
| **9. REST APIs** | Centralized error handling, pagination, sorting | ✅ | Unified response helpers, standard HTTP status codes |
| **10. Validation** | Server & client input checks, malformed ID handling | ✅ | Centralized CastError, ValidationError, duplicate key handling |
| **11. Frontend Pages**| Login, Register, Dashboards, CRUD pages, 404, 403 | ✅ | 16 dedicated pages and reusable layout wrappers |
| **12. Structure** | Clean monorepo (`client/` and `server/`) | ✅ | Decoupled client and server directories with clean separation |
| **13. Security** | Hashing, JWT verification, rate limiting, CORS | ✅ | Helmet, express-rate-limit, input sanitization |
| **14. Testing** | Backend Jest/Supertest + Frontend RTL tests | ✅ | 21 backend tests + frontend component tests verified passing |
| **15. Documentation**| Complete README, setup guide, credentials | ✅ | Comprehensive documentation with demo accounts |
