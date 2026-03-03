StudySprout 🍄
Building for Accountability with Agentic AI
Live Site: https://study-sprout-mu.vercel.app
Overview

StudySprout is a gamified social accountability platform designed to make consistency visible, rewarding, and shareable.

The core idea is simple:

Learning is not hard. Staying consistent is.

StudySprout transforms study habits into a shared growth experience where users track streaks, earn botanical badges, and stay accountable through a real-time friend system.
The most experimental feature is Bloom Ghostwriter ; my first custom AI agent built using the OpenAI SDK. It analyzes user study logs and drafts personalized social media posts for sharing progress on X.
This project is my exploration into building product-focused AI systems, not just calling APIs.

Why I Built This

I built StudySprout because I personally struggled with consistency.

Most productivity tools:

Track tasks.
Show charts.
Feel isolating.

I wanted something:

Social
Visual
Rewarding
AI-assisted

Instead of AI giving generic advice, I built an agent that:

Understands user logs
Extracts themes
Generates authentic progress posts
Encourages accountability

I treated myself as the first customer.

Tech Stack

Frontend: Next.js 14 + Framer Motion
Backend: Next.js API Routes (Node.js)
Database & Auth: Supabase (Realtime + RLS)
AI: OpenAI SDK (GPT-4o-mini)
Deployment: Vercel

AI Coding Tools I Used:
I built this project using AI coding tools (primarily Cursor + OpenAI + Antigravity workflows).
But I don’t use AI blindly.

My workflow:

I never ask AI to generate full applications.
I break features into small modules.
I ask AI to explain tradeoffs before implementation.
I ask it to predict failure modes.
I generate edge cases separately.
I review and refactor every output manually.
I treat AI as a junior engineer, not a senior one.

Secret Hacks I Follow When Using AI Coding Tools:

I prompt for architecture before code.
I ask the model to critique its own output.
I request test cases before writing implementation.
I enforce token boundaries to reduce hallucination.
I implement guardrails early (rate limits, retry logic, cost control).
I version my prompts like I version code.

For Bloom Ghostwriter, I implemented what I call “Vibe Trial Guardrails”:

Limit generation frequency
Control token usage
Prevent spammy outputs
Maintain product tone consistency

Agency: What’s the last thing nobody asked you to do but you did it?

No one asked me to implement guardrails or token cost control, but I did.
Even though this was a student project, I added:

Rate limiting
Structured prompt constraints
Error handling for API failures
Resource usage considerations
I built it as if it were going to scale.

See Problems: How do you Act?

My process:

Build naive version.
Observe where it breaks.
Log failures.
Refactor architecture.
Optimize.

For example:
When generating social posts, early outputs felt robotic.
Instead of tweaking blindly, I:

Analyzed tone mismatch
Adjusted system prompts
Added contextual constraints
Reduced temperature
Introduced pattern conditioning
I debug AI systems like software systems.

Obsession to Learn: What has been the last thing you learned?

Recently I’ve been deeply learning:

Multi-agent orchestration
Tool-calling systems
RAG pipelines
Prompt versioning
Observability in AI systems
Token cost control strategies

Understand yourself as first customer. How are you testing things?

I use StudySprout myself.

How I test:

I intentionally try to break streak logic.
I enter weird study logs to test AI behavior.
I test edge cases in authentication.
I track tone consistency in AI outputs.
I simulate abuse scenarios.

If it feels awkward to me, I fix it.

Eye for Good Products: What product inspires you and why?

Two products that inspire me:

1.Linear : because of its speed and focus. It respects developer time.

2.Notion : because of composability and user empowerment.

Both products feel intentional. That’s what I aim for.

What Makes Me Different

This space is new. I don’t have years of experience.

But I:

Build fast.
Study failure cases.
Care about production constraints.
Think about cost, rate limits, observability.
Treat AI as systems engineering, not magic.
I am not just experimenting with AI tools.
I am learning how to engineer with them.



