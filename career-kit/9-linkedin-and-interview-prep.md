# LINKEDIN COPY + INTERVIEW PREP — paste-ready

## PART 1 — LINKEDIN

### Headline (220 chars max — this is what shows in every search result)
> Forward-Deployed AI Engineer · I ship production AI in <2 weeks · Claude API, MCP, RAG, Next.js · 5 products live · Google Global Youth AI Advisor (1 of ~100) · NYC

### About section (paste whole)
> I embed with a customer, scope the messy real-world problem, and ship working AI software in days — not quarters.
>
> Five production products, built solo, end-to-end:
>
> ⚡ Styloire — a fashion founder needed her stylists to stop hand-writing brand pitches. I built her entire platform in under two weeks: one personalized email to every brand on a stylist's list, one click.
> 📄 Klauza — an AI contract scanner protecting freelancers from predatory clauses. Claude API pipeline: clause chunking → classification → risk flagging.
> 🤖 Spur — an agentic NYC concierge that plans your day and actually books it. Multi-step tool use, human-in-the-loop confirmation.
> 👥 The Common Collective — a members-only NYC social club platform. 300 members in week one.
> 📚 EverPage — an iOS social reading tracker built for consistency.
>
> Before software, I put in 2,000+ hours as an EMT in the Bronx. That's where I learned the skill that actually matters in forward-deployed work: walk into chaos, find the real problem, act fast, stay human.
>
> And I've made my choice — I build. Not headed to med school, not shopping for my next startup. I've proven I can ship alone; now I want a team, real customers, and stakes bigger than I can reach solo.
>
> Selected by Google as 1 of ~100 Global Youth AI Advisors worldwide. 10 Google AI certifications. Fluent in English, Hindi, and Spanish.
>
> Stack: Claude API · OpenAI API · MCP · RAG · embeddings · LangChain · Python · FastAPI · TypeScript · Next.js · Supabase · n8n
>
> 📬 neelbarmecha5@gmail.com — I reply fast.

### Settings checklist
- [ ] "Open to Work" ON → titles: Forward Deployed Engineer, Solutions Engineer, AI Engineer, GTM Engineer → visibility: **Recruiters only**
- [ ] Featured section: pin your portfolio site + Klauza + your best Loom demo
- [ ] Experience titles must match the positioning: "Founder & Builder — Sarga Haus (MVP studio: 5 shipped products)" / "Automation Engineer (Intern) — Mudita Studios" *(not just "Intern")*
- [ ] Custom URL: linkedin.com/in/neelbarmecha (or closest)
- [ ] Skills: add the exact keywords recruiters search — "Forward Deployed Engineer", "Solutions Engineering", "LLM", "RAG", "n8n", "GTM Engineering"

### X/Twitter bio (for the build-in-public track)
> Shipping production AI in <2 weeks. 5 products live. Forward-deployed engineer for hire (NYC). Google Global Youth AI Advisor. Building in public → 

---

## PART 2 — INTERVIEW PREP (the four rounds)

### Round 1 — Practical coding
What it looks like: "parse this file / call this API / build a small endpoint," 45–60 min, real-world not LeetCode.
Prep (do twice before first interview):
- Timed drill: FastAPI endpoint that accepts a document, chunks it, calls Claude with a tool definition, returns structured JSON. You've built this — the drill is doing it *cold in 40 minutes while talking*.
- Narrate constantly: "I'm stubbing this to keep moving, would harden it with X." Thinking out loud IS the interview.

### Round 2 — Systems / integration design
Prompt shape: "A customer wants our product on their data. Walk me through ingestion → serving."
Framework to say out loud, in order:
1. **Clarify** — data shape/volume/freshness? auth model? what does "working" mean to them?
2. **Ingest** — connectors, batch vs streaming, cleaning, PII handling
3. **Index/serve** — chunking + embeddings + retrieval choices, where evals sit
4. **Failure modes** — bad data, rate limits, model regressions, rollback plan
5. **Week-one cut** — "here's the smallest slice I'd ship in days to prove value"
That last step is your signature move — always end designs with the shippable slice.

### Round 3 — Customer case (YOUR round — rehearse, don't wing)
Prompt shape: "Customer says the pilot isn't working. First week?"
Your script skeleton:
1. "First I'd get in the room" — sit with the actual users, watch the real workflow (Styloire story)
2. Separate symptom from problem — what they *say* vs what blocks value
3. Scope one thin win shippable in days; agree on what "fixed" means, in their metric
4. Ship it, demo it live, iterate in the room
5. Feed it back — "one-off fix or does the product need this?"
Then attach a real story: Styloire discovery, or an EMT scene ("triage under ambiguity" — use once, it lands).
**Rehearse out loud 3× before your first onsite. Record yourself once.**

### Round 4 — Behavioral / the identity questions
They will ask, in some form:
- "Why not med school?" / "Why would a founder work for us?" → the commitment answer (application pack, memorize it)
- "You've never worked on a team of engineers" → "True — and it's exactly what I'm buying with this job. What I bring is the whole-loop instinct: I've been the PM, the engineer, and the support line. What I want is code review, senior engineers, and problems too big for one person."
- "Your products are small scale" → "Right — solo products cap at solo scale. That's the point of joining. What transfers is the loop: embed, scope, ship fast, iterate. The scale is what you have and I don't."
- "Walk me through a failure" → prepare ONE real one (a launch that flopped, an agent that misbooked, a customer feature that missed) + what changed in your process. Do not give a fake-humble answer.

### Logistics
- Every interview: 2 questions ready to ask back. Best ones: "What does a great first 90 days look like in this seat?" and "What's the deployment that went sideways and what did the team learn?"
- Same-day thank-you note, one line referencing something specific discussed.
- After every interview: 5 minutes, write down every question asked → feeds the next prep.
