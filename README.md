# Orbit - Agentic AI Job Searcher

Orbit is a personal, deployable web application that uses agentic AI to continuously research and aggregate internships, jobs, and remote roles from across the web, tailored to your profile and preferences.

## Architecture & Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Actions)
- **Styling**: Tailwind CSS, Framer Motion, React Three Fiber
- **Backend / Database**: Supabase (Auth, Postgres, RLS)
- **AI Agent Engine**: Groq API (using LLaMA or Mixtral models for fast inference)
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest & React Testing Library

## Current Status (Iteration 1: Foundation)
- Scaffolding Next.js with deep charcoal and vibrant orange aesthetics.
- 3D Interactive background using React Three Fiber.
- Docker configuration (`Dockerfile` & `docker-compose.yml`) for standalone execution.
- Testing infrastructure setup with Jest.

## How to Run

### Development Mode
```bash
npm install
npm run dev
```

### Production via Docker
```bash
docker-compose up --build
```

*(Note: In upcoming iterations, you will need to provide `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` via an `.env` file.)*
