# Project Context: Orbit

Orbit is an AI-powered agentic job search platform designed for a premium user experience with a "mission control" aesthetic.

## Architecture Guidelines

- **Containerization**: The app is built to be deployed via Docker (`Dockerfile` provides a Next.js standalone build).
- **Compliance & Security**: AI Agent interactions must be designed referencing NIST AI RMF 1.0, OWASP Top 10 for LLMs, ISO/IEC 42001, and EU AI Act principles.
- **Interpretability**: Ensure the matching algorithms and AI suggestions are completely explainable to the user (Mechanistic Interpretability).
- **LLM Agnostic Engine**: The system supports remote providers (Groq) and local models (Ollama, Qwen) for local-first privacy. We will abstract the LLM calls so the user can easily switch between `GROQ_API_KEY` and a local `OLLAMA_URL`.
- **Optimization & Self-Learning**: We leverage fast inference via Groq/Ollama. The AI must be highly intelligent and self-learning. It will implement a continuous feedback loop (RLHF/RLAIF framework) by storing user interactions, feedback, and job preferences in a vector database/feedback table to dynamically adjust its matching criteria on future runs.

## Completed Iterations

### Iteration 1: Foundation
- Scaffolding Next.js 14+ App Router.
- Premium UI Foundation (Tailwind v4, Deep Charcoal & Orange styling).
- 3D Hero Scene with React Three Fiber.
- Docker configuration (`Dockerfile` & `docker-compose.yml`).
- Jest Testing configuration.
