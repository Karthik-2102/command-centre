# Personal Developer Command Centre 🚀

An all-in-one developer productivity platform, roadmap tracker, and AI Learning Mentor designed for aspiring software engineers. Built with a production-grade full-stack architecture using **Spring Boot 3**, **React 18**, **PostgreSQL**, **Tailwind CSS**, and **Google Gemini Flash**.

---

## ✨ Key Features

- **Personal AI Learning Mentor**: Integrated conversational AI powered by Google Gemini (with multi-model fallback cascade across Gemini, Groq Llama 3.3, Ollama, and Local Telemetry). Features persistent chat sessions, code reviews, milestone recommendations, and 1-click task/DSA creation.
- **Dynamic Passcode & 2FA Security**: Multi-tier authentication flow featuring dynamic 10-character code-generated passwords (valid for 3 minutes) dispatched via Resend, followed by 6-digit email 2FA verification.
- **DSA Practice Matrix**: Track Data Structures & Algorithms problem-solving across LeetCode, HackerRank, CodeChef, and GeeksforGeeks with difficulty filters, topic tags, and analytics.
- **10-Month Learning Roadmap**: Visual milestone tracker breaking down Java fundamentals, OOP, Spring Boot, microservices, databases, and production project deployment.
- **Developer Telemetry & Analytics**: Daily streak trackers, GitHub-style heatmaps, task velocity gauges, and career readiness scores.
- **Tasks & Sprints Backlog**: Priority-based task manager with deadline tracking and categories.
- **Cheat Sheet & Quick Reference**: Instant modal reference for Java syntax, Git workflows, Docker commands, and SQL queries (`Ctrl + K`).

---

## 🛠️ Tech Stack

### Backend
- **Java 21 & Spring Boot 3.3+**
- **Spring Security 6** (Stateless authentication, BCrypt, session tokens)
- **Spring Data JPA & Hibernate**
- **PostgreSQL / H2 Database**
- **Resend Java SDK** (Real-time email 2FA and dynamic passcode delivery)
- **Google Gemini REST API & Groq Cloud API**
- **Docker** (Multi-stage containerization)

### Frontend
- **React 18 & Vite**
- **Tailwind CSS** (Dark cyber-command aesthetic)
- **Lucide React Icons**
- **Axios with Request/Response Interceptors**

---

## 🚀 Getting Started

### Prerequisites
- Java 21 JDK
- Node.js 18+ & npm
- PostgreSQL (or local H2 default)

### 1. Environment Configuration
Copy `.env.example` to `.env` and provide your credentials:

```bash
cp .env.example .env
```

### 2. Run Backend
```bash
cd command-centre-api
./mvnw spring-boot:run
```
API runs on `http://localhost:8080`.

### 3. Run Frontend
```bash
cd command-centre-ui
npm install
npm run dev
```
UI runs on `http://localhost:5173`.

---

## ☁️ Deployment

- **Backend**: Containerized with multi-stage Docker build, deployed on [Render.com](https://render.com).
- **Database**: Managed PostgreSQL on Render or Neon.tech.
- **Frontend**: Edge-hosted on [Vercel](https://vercel.com) with automatic HTTPS and SPA routing rewrites.

---

## 👤 Author
- **Karthik** — [GitHub Profile](https://github.com/Karthik-2102/)
