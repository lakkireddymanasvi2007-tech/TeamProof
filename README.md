# TeamProof

**Your Team's Work, Indisputably Proven.**

TeamProof is a contribution-aware collaboration and career-proof platform for college project teams, hackathons, coding bootcamps, and small teams. It combines project execution, evidence-backed contributions, early blocker detection, and a shareable contribution report.

> **Core promise:** Help teams finish projects, make individual work visible, and turn completed work into credible career evidence.

---

## 🎬 Project Video Walkthrough

[![Watch TeamProof Demo Walkthrough](https://img.shields.io/badge/▶_Watch_Demo_Video-Google_Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)](https://drive.google.com/file/d/186gTtVTOYG3kaiuALaP-vOF7thoDqV26/view?usp=drivesdk)

> 🎥 **[Click here to watch the full TeamProof Walkthrough Video](https://drive.google.com/file/d/186gTtVTOYG3kaiuALaP-vOF7thoDqV26/view?usp=drivesdk)**
> 
> *Live Deployed Web App:* **[https://teamproof-web-54b5.onrender.com](https://teamproof-web-54b5.onrender.com)**  
> *Backend API Service:* **[https://teamproof-api-r7f3.onrender.com](https://teamproof-api-r7f3.onrender.com)**

---

## Table of Contents

- [Product Overview](#product-overview)
- [Target Users & Problem](#target-users--problem)
- [Key Features](#key-features)
- [Demo Workflow](#demo-workflow)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [MongoDB Setup](#mongodb-setup)
- [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [Testing Instructions](#testing-instructions)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Startup Thinking](#startup-thinking)
- [Limitations & Future Work](#limitations--future-work)

---

## Product Overview

In group projects, work is often distributed unfairly, blockers are noticed too late, and students struggle to demonstrate exactly what they contributed when applying for internships. TeamProof solves this by:

1. **Making individual contributions visible** — evidence links (GitHub PRs, deployed demos, docs) are attached to completed tasks
2. **Detecting blockers early** — team members flag blockers instantly with descriptions
3. **Generating proof** — a printable contribution report shows per-member stats and attached evidence
4. **Keeping teams healthy** — a real-time dashboard shows project health, overdue tasks, and open blockers

---

## Target Users & Problem

| Audience | Problem |
|---|---|
| **College students** | Can't prove individual contributions in group projects when professors grade collectively |
| **Hackathon teams** | Work happens fast; no time to document who built what |
| **Bootcamp students** | Need portfolio evidence of real team collaboration for job applications |
| **Small remote teams** | Async work makes contribution visibility difficult |

---

## Key Features

### Workflow A — Authentication & Teams
- Register, login, logout with bcrypt password hashing and JWT HttpOnly cookies
- Create teams with auto-generated invite codes
- Join teams via invite code
- Owner and member roles

### Workflow B — Projects & Task Execution
- Create projects with name, description, start/end dates, deadline
- Kanban board with 4 statuses: **Todo**, **In Progress**, **Blocked**, **Done**
- Task assignment to team members with server-side membership verification
- Priority levels: Low, Medium, High, Urgent
- Overdue detection with visual highlights

### Workflow C — Proof of Contribution (Signature Feature)
- Attach evidence URLs (GitHub commits, PRs, deployed demos, documents) to tasks
- URL validation (must be valid HTTP/HTTPS)
- Completion summary when marking tasks as Done
- Activity history for all meaningful actions
- Flag and resolve blockers with descriptions and timestamps
- Visual distinction between evidence-backed and unverified completions

### Workflow D — Team Health & Contribution Report
- Real-time dashboard with: total projects/tasks, completion %, overdue count, open blockers, upcoming deadlines
- Per-member stats: assigned, completed, evidence-backed, overdue
- Project health indicator (Healthy / At Risk / Critical) with explained reasons
- Printable contribution report via browser print
- Audit disclaimer on all reports

---

## Demo Workflow (3–5 minutes)

1. **Register** two users (Alice and Bob)
2. Alice **creates a team** → gets invite code
3. Bob **joins the team** using the invite code
4. Alice **creates a project** "Final Year Project" with a deadline
5. Alice **creates tasks** on the Kanban board, assigns one to Bob
6. Bob **moves his task** to "In Progress", then marks it **Done** with a completion summary
7. Bob **attaches evidence** (a GitHub PR URL) to his completed task
8. Alice **flags a blocker** on her task → task auto-moves to Blocked
9. Alice **resolves the blocker** → task returns to Todo
10. Visit the **Team Dashboard** → see live stats, health status, member contribution table
11. Visit **Contribution Report** → print the per-member audit dossier

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6, React Router v6, Tailwind CSS v4 |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose 7 |
| Authentication | bcryptjs (12 rounds), jsonwebtoken (7-day HttpOnly cookies) |
| Validation | express-validator |
| Styling | Tailwind CSS with navy/white/violet design system |

---

## Architecture

```
┌─────────────────┐     HTTP (cookies)     ┌─────────────────┐
│                 │ ◄──────────────────────► │                 │
│  React Client   │       /api/*            │  Express Server │
│  (Vite, :5173)  │  Vite proxy in dev      │     (:5000)     │
│                 │                         │                 │
└─────────────────┘                         └────────┬────────┘
                                                     │
                                                     │ Mongoose
                                                     ▼
                                            ┌─────────────────┐
                                            │    MongoDB       │
                                            │  (teamproof db) │
                                            └─────────────────┘
```

---

## Folder Structure

```
teamproof/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Shared UI components
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── ActivityFeed.jsx
│   │   │   ├── ContributionReport.jsx
│   │   │   ├── CreateTeam.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── JoinTeam.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ProjectList.jsx
│   │   │   ├── ProjectWorkspace.jsx    # Kanban board
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── TaskDetail.jsx
│   │   │   └── TeamDashboard.jsx
│   │   ├── utils/
│   │   │   ├── api.js         # Centralized fetch wrapper
│   │   │   └── helpers.js     # Date, color, status utilities
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Express backend
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── asyncHandler.js
│   │   ├── auth.js            # JWT + team membership
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── Activity.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   ├── Team.js
│   │   └── User.js
│   ├── routes/
│   │   ├── activity.js
│   │   ├── auth.js
│   │   ├── blockers.js
│   │   ├── dashboard.js
│   │   ├── evidence.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── teams.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── logActivity.js
│   ├── index.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Installation & Setup

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local install, Docker, or MongoDB Atlas cloud)
- **Git** (optional)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd teamproof
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/teamproof
JWT_SECRET=your-secure-random-secret-key-here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> ⚠️ **Change `JWT_SECRET`** to a strong random string in production.

### 4. Install Client Dependencies

```bash
cd ../client
npm install
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/teamproof` | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret key for signing JWT tokens |
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `CLIENT_URL` | No | `http://localhost:5173` | Frontend URL for CORS |

---

## MongoDB Setup

### Option A: Local MongoDB

1. Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start the MongoDB service
3. Use `MONGODB_URI=mongodb://localhost:27017/teamproof`

### Option B: MongoDB Atlas (Cloud)

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user and whitelist your IP
3. Get the connection string and set it as `MONGODB_URI`

### Option C: Docker

```bash
docker run -d -p 27017:27017 --name teamproof-mongo mongo:7
```

---

## Running the Application

### Development Mode (two terminals)

**Terminal 1 — Start the backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Start the frontend:**
```bash
cd client
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies API calls to `http://localhost:5000`.

### Production Build

```bash
# Build the client
cd client
npm run build

# The built files are in client/dist/
# Serve them with any static file server or configure Express to serve them
```

---

## API Overview

All API responses follow: `{ success: true, data: ... }` or `{ success: false, error: "..." }`

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/me` | Get current authenticated user |

### Teams
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/teams` | Create new team |
| GET | `/api/teams` | List user's teams |
| GET | `/api/teams/:teamId` | Get team details |
| POST | `/api/teams/join` | Join team by invite code |
| GET | `/api/teams/:teamId/members` | Get team members |

### Projects (all require team membership)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/teams/:teamId/projects` | Create project |
| GET | `/api/teams/:teamId/projects` | List projects |
| GET | `/api/teams/:teamId/projects/:projectId` | Get project |
| PUT | `/api/teams/:teamId/projects/:projectId` | Update project |
| DELETE | `/api/teams/:teamId/projects/:projectId` | Delete project (owner only) |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/teams/:teamId/projects/:projectId/tasks` | Create task |
| GET | `/api/teams/:teamId/projects/:projectId/tasks` | List tasks |
| GET | `/api/teams/:teamId/projects/:projectId/tasks/:taskId` | Get task detail |
| PUT | `/api/teams/:teamId/projects/:projectId/tasks/:taskId` | Update task |
| DELETE | `/api/teams/:teamId/projects/:projectId/tasks/:taskId` | Delete task |

### Evidence
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/teams/:teamId/projects/:projectId/tasks/:taskId/evidence` | Add evidence URL |
| DELETE | `/api/teams/:teamId/projects/:projectId/tasks/:taskId/evidence/:evidenceId` | Remove evidence |

### Blockers
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/teams/:teamId/projects/:projectId/tasks/:taskId/blockers` | Report blocker |
| PUT | `/api/teams/:teamId/projects/:projectId/tasks/:taskId/blockers/:blockerId/resolve` | Resolve blocker |

### Dashboard & Activity
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/teams/:teamId/dashboard` | Team dashboard metrics |
| GET | `/api/teams/:teamId/activity` | Paginated activity feed |

---

## Testing Instructions

### Manual Testing Checklist

1. **Registration**: Register with name, email, password → should redirect to dashboard
2. **Login/Logout**: Login with registered credentials, logout, verify cookie cleared
3. **Create Team**: Create team → verify invite code appears
4. **Join Team**: Register second user, join with invite code
5. **Create Project**: Create project with deadline
6. **Create Tasks**: Create tasks on Kanban, assign to team members
7. **Move Tasks**: Change task status through Kanban → verify in-progress, blocked, done
8. **Add Evidence**: On task detail, add evidence URL → verify URL validation
9. **Add Blocker**: Flag blocker → task auto-moves to "Blocked"
10. **Resolve Blocker**: Resolve blocker → task returns to "Todo"
11. **Dashboard**: Check that all stats update correctly
12. **Contribution Report**: Print/preview the report
13. **Refresh**: Reload any page → data should persist from MongoDB
14. **Invalid Input**: Try empty fields, invalid URLs, wrong passwords → verify error messages
15. **Cross-team Access**: Try accessing another team's data → should get 403

### Build Verification

```bash
# Server syntax check
cd server && node --check index.js

# Client production build
cd client && npm run build
```

---

## Deployment

### Backend (e.g., Render, Railway, Fly.io)

1. Set environment variables in the hosting platform
2. Set `NODE_ENV=production`
3. Set `CLIENT_URL` to the deployed frontend URL
4. Build command: `npm install`
5. Start command: `npm start`

### Frontend (e.g., Vercel, Netlify, Cloudflare Pages)

1. Build command: `npm run build`
2. Output directory: `dist`
3. Set the API proxy/rewrite to point to the backend URL

### Database (MongoDB Atlas)

1. Use MongoDB Atlas free tier (M0)
2. Set `MONGODB_URI` to the Atlas connection string
3. Whitelist the backend server's IP

---

## Screenshots

> Screenshots can be added here after running the application locally.

| Page | Description |
|---|---|
| Landing Page | SaaS landing with hero, problem/solution, features |
| Dashboard | User's teams overview with quick actions |
| Team Dashboard | Live metrics, health indicator, member contribution table |
| Kanban Board | 4-column task board with priority badges and overdue highlights |
| Task Detail | Full task view with evidence, blockers, completion summary |
| Contribution Report | Printable per-member audit dossier |

---

## Startup Thinking

### Why Users Benefit
- **Students** get fair credit for their work and printable proof for internship applications
- **Instructors** can see who actually contributed before grading group projects
- **Hackathon organizers** can track team velocity and identify blockers in real-time

### Potential Business Model
- **Free tier**: Small teams (up to 5 members), 3 projects
- **Paid institutional workspaces**: Unlimited teams, advanced analytics, LMS integration
- **Premium reporting**: Verified contribution exports, portfolio integration
- **Enterprise**: Custom branding, SSO, API access

### Competitors
- **Trello / Asana / Jira**: General task management, no contribution proof
- **GitHub Projects**: Code-centric, not designed for non-code tasks
- **Notion**: Flexible but no structured contribution tracking

### Key Assumptions to Validate
1. Students want structured proof of contributions (not just screenshots)
2. Professors/instructors will accept TeamProof reports as evidence
3. Teams will adopt the evidence-attachment habit
4. Blocker flagging reduces last-minute delivery failures

### Future Extensions
- **GitHub integration**: Auto-link commits and PRs to tasks
- **Verified portfolio exports**: Shareable public contribution pages
- **LMS integration**: Connect with Canvas, Blackboard, Google Classroom
- **AI-powered insights**: Workload imbalance detection, deadline risk prediction
- **Real-time collaboration**: WebSocket-based live updates

---

## Limitations & Future Work

### Current Limitations
- No real-time updates (requires page refresh to see others' changes)
- No drag-and-drop on Kanban (uses click-to-move buttons)
- No email notifications for blockers or deadlines
- No file upload (evidence is URL-based only)
- No GitHub API integration (URLs are manually attached)
- Contribution reports do not independently verify linked evidence
- No role-based access beyond owner/member

### Not Implemented in MVP (by design)
- Payment/billing system
- AI chatbot
- Complex integrations (GitHub API, Slack, etc.)
- Multi-organization hierarchy
- Admin panel

---

## License

MIT

---

**Built with ❤️ for radical contribution transparency.**
