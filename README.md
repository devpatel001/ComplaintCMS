# 🚀 AI-Powered Complaint Management System

A sophisticated institutional grievance management platform built with **React, Vite, Tailwind CSS (v4), and Gemini AI.**

## ✨ Key Features
- **🤖 Gemini AI Integration**: Automated complaint classification, sentiment analysis, and intelligent auto-response drafting.
- **☁️ Cloud Backend**: Real-time data persistence powered by **Supabase (PostgreSQL)**.
- **🔔 Notification Engine**: In-app notification center for students and admins with auto-escalation for pending cases.
- **📊 Strategic Analytics**: Macro-level insight dashboard using **Gemini 1.5 Pro** to identify root causes and systemic bottlenecks.
- **📄 Professional Reporting**: Native PDF report generation and CSV data exports for administrative auditing.
- **🎨 Premium UI**: Modern glassmorphism design with smooth animations and responsive layouts.

## 🛠️ Tech Stack
- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase
- **AI Engine**: Google Gemini API (1.5 Flash & 1.5 Pro)
- **Icons**: Lucide React
- **Charts**: Recharts

## 📥 Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone https://github.com/devpatel001/ComplaintCMS.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 📜 Business Logic
- **Triage**: Complaints are automatically analyzed upon submission to assign priority based on emotional tone.
- **SLA**: Tickets pending for more than 48 hours are automatically escalated to Admin alerts.
- **Security**: Admin features are restricted to verified accounts.
