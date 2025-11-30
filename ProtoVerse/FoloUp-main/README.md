<div align="center">

# 🎯 FoloUp

### *Next-Generation AI-Powered Interview & Coding Assessment Platform*

[![Next.js](https://img.shields.io/badge/Next.js-14.2.33-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**Transform your hiring process with AI-driven voice interviews, real-time coding assessments, and intelligent candidate evaluation.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Demo](#-demo) • [Contributing](#-contributing)

</div>

---

## 🌟 **Overview**

FoloUp revolutionizes technical hiring by combining **AI-powered voice interviews** with **live coding assessments** in a single, seamless platform. Built by **Team ProtoVerse**, it enables organizations to conduct scalable, unbiased, and comprehensive candidate evaluations.

### **Why FoloUp?**

✅ **All-in-One Solution** — Voice interviews + Coding tests + Security analysis in one platform  
✅ **AI-Driven Insights** — Automated scoring, feedback generation, and candidate reports  
✅ **Real-Time Assessment** — Monaco-powered code editor with 10+ DSA challenges  
✅ **Enterprise Ready** — Built with Next.js 14, TypeScript, and Supabase for scale  
✅ **Zero Setup for Candidates** — Browser-based, no downloads required  

---

## ✨ **Features**

### 🎙️ **AI Voice Interviews**
- **Natural Conversations** — Retell AI conducts human-like, adaptive voice interviews
- **Real-Time Transcription** — Live transcripts of interviewer and candidate responses
- **Camera Integration** — Optional webcam monitoring with on/off controls
- **Tab Switch Detection** — Security feature to track focus changes during interviews
- **Customizable Duration** — Set interview length (5-60 minutes)

### 💻 **Live Coding Assessment**
- **Monaco Editor Integration** — Professional IDE experience in the browser
- **Multi-Language Support** — JavaScript, Python, Java, C++ with syntax highlighting
- **10 Pre-Built DSA Problems** — Two Sum, Valid Parentheses, Binary Search, LRU Cache, and more
- **HackerRank-Style Layout** — Split-panel design with problem statements and code editor
- **Piston API Integration** — Run code securely with real-time execution and output
- **Automatic Transition** — Coding round starts automatically after interview ends
- **45-Minute Timer** — Dedicated timer for coding challenges with visual countdown
- **No Solution Templates** — Clean slate for authentic skill assessment

### 📊 **Intelligent Evaluation**
- **AI-Powered Scoring** — OpenAI evaluates responses for clarity, relevance, and competency
- **Security Analysis** — Post-interview security check with detailed report
- **Feedback Forms** — Collect candidate experience insights
- **Comprehensive Reports** — Strengths, weaknesses, and improvement suggestions
- **Response Analytics** — Track interview performance metrics

### 🎨 **Modern Dashboard**
- **Interview Management** — Create, schedule, and track all interviews
- **Candidate Portal** — Unified view of all candidate interactions
- **Organization Support** — Multi-tenant architecture with Clerk authentication
- **Responsive Design** — Beautiful UI built with Tailwind CSS and shadcn/ui
- **Dark Mode Support** — Theme customization for better UX

### 🔒 **Security & Reliability**
- **Secure Authentication** — Clerk-powered user and organization management
- **Unique Interview Links** — One-time URLs for candidate access
- **Data Encryption** — Supabase handles secure data storage
- **Error Handling** — Robust error boundaries and fallback mechanisms
- **GDPR Compliant** — Privacy-first data handling

---

## 🛠️ **Tech Stack**

### **Frontend**
- **Framework:** Next.js 14.2.33 (App Router)
- **Language:** TypeScript 5.0
- **Styling:** Tailwind CSS + shadcn/ui components
- **Code Editor:** Monaco Editor (VS Code engine)
- **State Management:** React Hooks + Context API
- **UI Components:** Radix UI primitives

### **Backend & Services**
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Clerk (Organizations + Users)
- **Voice AI:** Retell AI (Real-time voice conversations)
- **LLM:** OpenAI GPT (Question generation + scoring)
- **Code Execution:** Piston API (Multi-language sandbox)

### **DevOps & Tools**
- **Package Manager:** Yarn
- **Linting:** ESLint
- **Version Control:** Git
- **Deployment:** Vercel/Railway/Docker ready

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and Yarn
- Supabase account
- Clerk account
- Retell AI API key
- OpenAI API key

### **1. Clone Repository**
```bash
git clone https://github.com/your-org/foloup.git
cd foloup
```

### **2. Install Dependencies**
```bash
yarn install
```

### **3. Environment Setup**
Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx

# Retell AI (Voice Interviews)
RETELL_API_KEY=key_xxxxx

# OpenAI (AI Evaluation)
OPENAI_API_KEY=sk-xxxxx
```

### **4. Database Setup**
Run the schema in Supabase SQL Editor:
```bash
# Located in: supabase_schema.sql
```

### **5. Run Development Server**
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📖 **Detailed Setup Guide**

### **Clerk Authentication**
1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Enable **Organizations** feature
4. Copy API keys to `.env.local`
5. Configure redirect URLs:
   - Sign-in: `/sign-in`
   - Sign-up: `/sign-up`
   - After sign-in: `/dashboard`

### **Supabase Database**
1. Create project at [supabase.com](https://supabase.com)
2. Navigate to SQL Editor
3. Paste contents of `supabase_schema.sql`
4. Execute to create tables:
   - `interviewers`
   - `interviews`
   - `clients`
   - `responses`
   - `feedback`
5. Copy Project URL and Anon Key to `.env.local`

### **Retell AI Setup**
1. Sign up at [retell.ai](https://retell.ai)
2. Create API key in dashboard
3. Configure voice agent settings
4. Add API key to `.env.local`

### **OpenAI Configuration**
1. Get API key from [platform.openai.com](https://platform.openai.com)
2. Add to `.env.local`
3. Default model: `gpt-4-turbo` (configurable)

---

## 🎬 **Demo**

### **Interview Flow**
1. **Create Interview** → Generate questions from job description
2. **Share Link** → Send unique URL to candidate
3. **Voice Round** → AI conducts adaptive interview (5-60 mins)
4. **Auto-Transition** → Coding round opens automatically
5. **Coding Assessment** → Solve DSA problems in 45 minutes
6. **AI Evaluation** → Receive detailed candidate report

### **Key Screens**
- 📋 Dashboard — Interview management
- 🎙️ Live Call Interface — Voice interview with camera
- 💻 Code Editor Modal — HackerRank-style coding environment
- 📊 Analytics — Response scores and insights
- 📝 Feedback Form — Post-interview candidate experience

---

## 📂 **Project Structure**

```
FoloUp-main/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (user)/            # User-facing routes
│   │   │   └── call/[id]/     # Interview call page
│   │   ├── (client)/          # Client dashboard
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── call/              # Interview components
│   │   │   ├── index.tsx      # Main call orchestration
│   │   │   ├── codeEditorNew.tsx  # Monaco editor modal
│   │   │   ├── feedbackForm.tsx
│   │   │   └── securityAnalysis.tsx
│   │   ├── dashboard/         # Dashboard components
│   │   └── ui/                # shadcn/ui components
│   ├── contexts/              # React Context providers
│   ├── services/              # API service layers
│   ├── types/                 # TypeScript definitions
│   ├── lib/                   # Utility functions
│   └── utils/
│       └── runCode.ts         # Piston API wrapper
├── public/                    # Static assets
├── supabase_schema.sql        # Database schema
├── package.json
└── README.md
```

---

## 🎯 **Key Components**

### **Call Component** (`src/components/call/index.tsx`)
- Manages interview lifecycle
- Retell WebClient integration
- Timer management for interview + coding rounds
- Auto-transition logic between rounds

### **Code Editor** (`src/components/call/codeEditorNew.tsx`)
- Monaco Editor with auto-complete
- 10 DSA problem presets with difficulty badges
- Piston API for code execution
- Timer with visual countdown

### **Run Code Utility** (`src/utils/runCode.ts`)
- Piston API wrapper
- Multi-language support
- Timeout and error handling
- Stdin/stdout management

---

## 🧪 **Testing**

### **Quick Test Flow**
1. Set interview duration to **1 minute** (for faster testing)
2. Start interview → Wait for timer to end
3. Verify auto-transition to coding round after 2 seconds
4. Select DSA problem → Write code → Run Code
5. Click "End Round" → Verify thank you screen appears

### **Console Debugging**
Check browser console for:
```
Interview time ended, stopping call...
Transitioning to coding round in 2 seconds...
Opening coding round now!
```

---

## 🤝 **Contributing**

We welcome contributions! Here's how:

### **Development Workflow**
```bash
# 1. Fork the repository
# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Make changes and commit
git commit -m "Add amazing feature"

# 4. Push to branch
git push origin feature/amazing-feature

# 5. Open Pull Request
```

### **Contribution Guidelines**
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic
- Update README if adding major features

### **Areas for Contribution**
- 🐛 Bug fixes
- ✨ New features (more DSA problems, language support)
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations

---

## 📜 **License**

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

**Built with ❤️ by Team ProtoVerse**

### **Special Thanks**
- [Retell AI](https://retell.ai) — Voice interview technology
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — Code editor engine
- [Piston](https://github.com/engineer-man/piston) — Code execution API
- [shadcn/ui](https://ui.shadcn.com) — Beautiful UI components
- [Supabase](https://supabase.com) — Backend infrastructure

---

## 📞 **Support & Contact**

- 📧 Email: support@foloup.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/foloup/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-org/foloup/discussions)

---

## 🗺️ **Roadmap**

### **Coming Soon**
- [ ] Real-time collaborative coding
- [ ] Video recording of interviews
- [ ] Advanced analytics dashboard
- [ ] Custom DSA problem creation
- [ ] Multi-round interview support
- [ ] Candidate comparison tools
- [ ] Integration with ATS systems
- [ ] Mobile app for candidates
- [ ] Whiteboard feature for system design

---

<div align="center">

### **⭐ Star this repo if you find it useful!**

Made with 💙 by Team ProtoVerse

[⬆ Back to Top](#-foloup)

</div>
