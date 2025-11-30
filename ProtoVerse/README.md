# 🚀 FoloUp + CognitoForge Integration

**AI-Powered Interview Platform with Real-Time Security Analysis**

## 🎯 Project Overview

This hackathon project combines **FoloUp** (AI interview platform) with **CognitoForge** (security analysis tool) to create a unique experience:

1. **Candidate takes AI interview** via FoloUp
2. **While interview ends**, candidate can optionally **analyze their GitHub repository** 
3. **CognitoForge runs security analysis** detecting vulnerabilities and attack vectors
4. **Results displayed instantly** with severity levels, affected files, and recommendations
5. **Candidate provides feedback** and completes their session

## ✨ Key Features

- 🎤 **AI Voice Interviews** - Natural conversational interviews
- 🔒 **GitHub Security Analysis** - Real-time vulnerability detection
- 🤖 **AI-Powered Insights** - Google Gemini integration for attack simulations
- 📊 **Visual Dashboards** - Comprehensive security reports
- ⚡ **Fast Integration** - Seamless flow between interview and analysis
- 🎨 **Modern UI** - Clean, responsive interface

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FoloUp Frontend                      │
│                    (Next.js - Port 3000)                │
│                                                         │
│  ┌──────────────┐  ┌───────────────────────────────┐  │
│  │  Interview   │→ │  Security Analysis Screen     │  │
│  │  Component   │  │  (GitHub Repo Input)          │  │
│  └──────────────┘  └───────────────────────────────┘  │
│         ↓                        ↓                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │        Next.js API Route Handler                 │  │
│  │        /api/security-analysis                    │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│              CognitoForge Backend                       │
│              (FastAPI - Port 8000)                      │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Repo Upload  │→ │  AI Analysis │→ │   Report    │  │
│  │   Service    │  │   (Gemini)   │  │  Generator  │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Git

### Installation

1. **Clone and navigate to project**
```bash
cd "c:\Users\Ankit\Desktop\Combine"
```

2. **Install FoloUp dependencies**
```bash
cd FoloUp-main
npm install
```

3. **Install CognitoForge dependencies**
```bash
cd ../CognitoForge/backend
pip install -r requirements.txt
```

4. **Configure environment variables**

Create `FoloUp-main/.env.local`:
```env
COGNITOFORGE_API_URL=http://localhost:8000

# Add your existing FoloUp env vars (Clerk, Supabase, etc.)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Create `CognitoForge/backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_TOKEN=your_github_token_here (optional)
```

### Running the Application

**Option 1: Windows (Recommended for hackathon)**
```bash
start-dev.bat
```

**Option 2: Manual Start**

Terminal 1 - Backend:
```bash
cd CognitoForge/backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Terminal 2 - Frontend:
```bash
cd FoloUp-main
npm run dev
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🎮 User Flow

1. **Start Interview**
   - Navigate to interview link
   - Enter email and name
   - Complete AI voice interview

2. **Interview Ends**
   - Choose "Run Security Analysis" or "Skip to Feedback"

3. **Security Analysis** (Optional)
   - Enter GitHub repository URL
   - Wait 10-30 seconds for analysis
   - View comprehensive security report with:
     - Overall severity rating
     - Vulnerability breakdown (Critical/High/Medium/Low)
     - Attack scenario description
     - Affected files list
     - Recommended remediation steps

4. **Provide Feedback**
   - Rate satisfaction
   - Submit feedback
   - Complete session

## 📁 Project Structure

```
Combine/
├── FoloUp-main/                    # Interview Platform
│   ├── src/
│   │   ├── app/
│   │   │   └── api/
│   │   │       └── security-analysis/
│   │   │           └── route.ts    # CognitoForge API integration
│   │   ├── components/
│   │   │   └── call/
│   │   │       ├── index.tsx       # Main interview component (MODIFIED)
│   │   │       ├── securityAnalysis.tsx  # NEW: Security UI
│   │   │       └── feedbackForm.tsx
│   │   └── services/
│   └── package.json
│
├── CognitoForge/                   # Security Analysis Backend
│   ├── backend/
│   │   ├── app/
│   │   │   ├── main.py            # FastAPI entry point
│   │   │   ├── routers/
│   │   │   │   ├── operations.py  # Repo upload, simulation
│   │   │   │   └── ai.py          # Gemini AI endpoints
│   │   │   └── services/
│   │   │       ├── gemini_service.py
│   │   │       └── repo_fetcher.py
│   │   └── requirements.txt
│
├── start-dev.bat                   # Windows startup script
├── start-dev.sh                    # Linux/Mac startup script
└── README.md                       # This file
```

## 🔧 API Endpoints

### Security Analysis API (Next.js)
- `POST /api/security-analysis` - Main analysis endpoint
  - `action: "upload"` - Upload GitHub repo
  - `action: "simulate"` - Run attack simulation
  - `action: "report"` - Get analysis report

### CognitoForge API (FastAPI)
- `POST /upload_repo` - Upload repository for analysis
- `POST /simulate_attack` - Run security simulation
- `GET /reports/{repo_id}/latest` - Get latest report
- `POST /api/gemini` - Direct Gemini AI queries

## 🎨 Tech Stack

**Frontend (FoloUp)**
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn UI
- Clerk (Auth)
- Supabase (Database)

**Backend (CognitoForge)**
- FastAPI
- Python 3.11+
- Google Gemini AI
- Pydantic
- Snowflake (optional)

## ⚡ Performance Optimizations

- **Parallel API calls** for faster analysis
- **Streaming responses** for real-time updates
- **Caching** for repeated repo analysis
- **Async/await** throughout the stack
- **Minimal dependencies** for faster load times

## 🐛 Troubleshooting

**Backend won't start:**
```bash
cd CognitoForge/backend
pip install --upgrade -r requirements.txt
```

**Frontend build errors:**
```bash
cd FoloUp-main
rm -rf .next node_modules
npm install
npm run dev
```

**CORS errors:**
- Ensure backend is running on port 8000
- Check `COGNITOFORGE_API_URL` in `.env.local`
- Verify CORS settings in `CognitoForge/backend/app/main.py`

**Security analysis timeout:**
- Large repos take longer (30-60 seconds)
- Check Gemini API key is valid
- Monitor backend logs for errors

## 📝 Environment Variables Reference

### FoloUp (.env.local)
```env
# CognitoForge Integration
COGNITOFORGE_API_URL=http://localhost:8000

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Interview (Retell)
RETELL_API_KEY=
```

### CognitoForge (.env)
```env
# AI Integration
GEMINI_API_KEY=your_gemini_api_key

# GitHub Access (optional, for private repos)
GITHUB_TOKEN=your_github_token

# Data Warehouse (optional)
SNOWFLAKE_ACCOUNT=
SNOWFLAKE_USER=
SNOWFLAKE_PASSWORD=
SNOWFLAKE_WAREHOUSE=
SNOWFLAKE_DATABASE=

# Auth (optional)
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
```

## 🎯 Hackathon Demo Tips

1. **Pre-load a test repo** to show instant results
2. **Use public repos** to avoid GitHub auth issues
3. **Have backend running** before starting demo
4. **Show the full flow**: Interview → Analysis → Feedback
5. **Highlight the AI insights** from Gemini
6. **Explain the severity levels** in the report

## 🤝 Contributing

This is a hackathon project - contributions welcome!

## 📄 License

MIT License - see individual project licenses

## 🙏 Acknowledgments

- **FoloUp** - AI Interview Platform
- **CognitoForge** - Security Analysis Engine
- **Google Gemini** - AI-powered insights
- **Vercel** - Deployment platform

---

**Built with ⚡ for Hackathon speed and 🚀 for production quality**
