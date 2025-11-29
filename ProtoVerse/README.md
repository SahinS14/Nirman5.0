
# 🚀 **FoloUp — AI-Powered Interview & Evaluation Platform**

*Built with precision by **Team ProtoVerse***

FoloUp is an AI-driven interview and assessment platform designed for organizations to conduct structured, unbiased, and scalable interviews. It supports voice-based interviews, automated question generation, scoring, and an integrated dashboard for complete candidate evaluation.

The system is modular, secure, and built with modern infrastructure—making deployments smooth and maintenance simple.

---

# ⭐ **Key Features**

### **1. Automated Interview Creation**

Generate tailored interview questions from any job description.

### **2. AI Voice Interviewer**

Conduct natural, conversational interviews that adapt to candidate responses in real time.

### **3. Intelligent Response Scoring**

AI evaluates each answer and assigns scores based on clarity, relevance, communication skills, and expected role competency.

### **4. Secure Interview Sessions**

Generate unique, shareable links for candidates to join their interviews.

### **5. Centralized Dashboard**

Track all interviews, responses, scores, and candidate stats in one place.

### **6. Candidate Insights Report**

Receive structured feedback, strengths, weaknesses, and suggestions for improvement.

---

# 🛠️ **Technology Overview**

FoloUp is powered by:

* Authentication service for secure user access
* Supabase for data storage
* Voice interview engine for calls and recordings
* AI models for question generation and analysis

The architecture is fully modular and suitable for large-scale usage.

---

# 📦 **Initial Setup**

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-project-folder>
```

---

# 🔐 **Environment Configuration**

Copy the environment template:

```bash
cp .env.example .env
```

Populate each variable as you complete the setup.

---

# 👥 **Authentication Setup**

Used for:

* Logging in users
* Managing organizations
* Securing dashboards

### Steps:

1. Create an app in your authentication service.
2. Copy your API keys.
3. Add them to the `.env` file:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key
```

4. Enable organization support and create one for your workspace.

---

# 🗄️ **Database Setup (Supabase)**

Supabase stores all essential data:

* Interviews
* Questions
* Candidates
* Organization metadata
* Analysis results

### Steps:

1. Create a project.
2. Open the SQL editor.
3. Paste and run the SQL from `supabase_schema.sql`.
4. Add your project URL and anon key to `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

# 📞 **AI Voice Interview Setup**

FoloUp uses a voice engine to:

* Conduct voice calls
* Manage the interview lifecycle
* Record and store sessions

### Steps:

1. Generate an API key in your voice-call provider.
2. Add it to `.env`:

```
RETELL_API_KEY=your_key
```

---

# 🤖 **AI Question & Evaluation Setup**

Used for:

* Generating interview questions
* Analyzing responses
* Producing candidate insights

### Steps:

1. Create an API key from your AI provider.
2. Add it to `.env`:

```
OPENAI_API_KEY=your_key
```

---

# ▶️ **Run the Project Locally**

Install packages:

```bash
yarn
```

Start the development server:

```bash
yarn dev
```

Open the application:

```
http://localhost:3000
```

---

# 🌐 **Deployment**

You can deploy FoloUp on any platform that supports:

* Environment variables
* Serverless functions
* Static hosting for frontend
* Continuous deployments

Use a cloud provider that suits your team’s workflow.

---

# 🤝 **Contributing**

Contributions are welcome.
To contribute:

* Fork the repository
* Create a feature branch
* Submit a pull request

Please follow clean code practices and include documentation.

---

# 📄 **License**

This project is licensed under the **MIT License**, allowing reuse, customization, and distribution.

---

