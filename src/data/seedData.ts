import { Journal, ActionItemDocument, IdeaItem } from "../types";

export const USER_A_INITIAL_JOURNALS: Journal[] = [
  {
    id: "jrn_evelyn_01",
    userId: "usr_a_evelyn_vance_8821",
    title: "On Distributed AI Agents and Latency Budgets",
    summary: "Reflected on designing multi-turn agentic loops for real-time systems. Realized that streaming tokens client-side drastically reduces perceived latency even when deep reasoning passes occur server-side.",
    messages: [
      {
        id: "m1",
        role: "user",
        text: "I've been wrestling with latency budgets for our agentic synthesis pipeline. When models perform multi-step planning, users perceive a 4-second delay as broken.",
        timestamp: "2026-08-25T14:30:00.000Z",
      },
      {
        id: "m2",
        role: "gemini",
        text: "Perceived latency is often more psychological than technical. When the interface provides immediate progressive indicators—such as streaming early intent classification or subtle typographic pulses—the user experiences the delay as deliberate reasoning rather than sluggishness.",
        timestamp: "2026-08-25T14:30:45.000Z",
      },
      {
        id: "m3",
        role: "user",
        text: "That aligns with my intuition. I should decouple the intent parser from the deep reflection pass and stream intermediate milestones.",
        timestamp: "2026-08-25T14:31:30.000Z",
      },
    ],
    keyPoints: [
      "Decouple initial UI feedback from long-running inference chains",
      "Perceived responsiveness relies on progressive milestone disclosure",
      "Server-side fallback ladders ensure zero user-facing 503 drops",
    ],
    actionItems: [
      { id: "act_ev_1", text: "Benchmark token streaming vs buffered JSON payloads", status: "completed" },
      { id: "act_ev_2", text: "Draft architecture memo on fallback model ladders", status: "accepted" },
    ],
    tags: ["AI Architecture", "Systems", "Performance"],
    sentiment: "focused",
    isPinned: true,
    createdAt: "2026-08-25T14:32:00.000Z",
    updatedAt: "2026-08-25T14:32:00.000Z",
  },
  {
    id: "jrn_evelyn_02",
    userId: "usr_a_evelyn_vance_8821",
    title: "Quiet Focus and Cognitive Recovery",
    summary: "Explored how continuous context switching degrades deep architectural thinking. Determined to establish a 3-hour morning deep-work block without instant messaging.",
    messages: [
      {
        id: "m4",
        role: "user",
        text: "My calendar is fractured into 30-minute slices. I notice my capacity for architectural clarity diminishes sharply by mid-afternoon.",
        timestamp: "2026-08-24T09:15:00.000Z",
      },
      {
        id: "m5",
        role: "gemini",
        text: "Architectural synthesis requires holding entire dependency graphs in working memory. When interrupted, rebuilding that mental graph takes 15 to 20 minutes. What if you protected an asynchronous morning sanctuary?",
        timestamp: "2026-08-24T09:16:10.000Z",
      },
    ],
    keyPoints: [
      "Working memory for complex software systems requires uninterrupted temporal blocks",
      "Asynchronous communication by default protects cognitive flow",
    ],
    actionItems: [
      { id: "act_ev_3", text: "Block 08:30-11:30 daily as No-Meeting Deep Focus", status: "accepted" },
    ],
    tags: ["Deep Work", "Mindset", "Productivity"],
    sentiment: "reflective",
    isPinned: false,
    createdAt: "2026-08-24T09:20:00.000Z",
    updatedAt: "2026-08-24T09:20:00.000Z",
  },
  {
    id: "jrn_evelyn_03",
    userId: "usr_a_evelyn_vance_8821",
    title: "Ideathon Strategy & Zero-Trust Verification",
    summary: "Mapped out how to demonstrate undeniable security isolation in an AI product demo: live verification of Firestore Security Rules rather than empty marketing promises.",
    messages: [
      {
        id: "m6",
        role: "user",
        text: "In most hackathons, teams demo sleek mockups with hardcoded API keys and zero backend isolation. I want our Ideathon submission to stand out for uncompromising security engineering.",
        timestamp: "2026-08-23T18:00:00.000Z",
      },
      {
        id: "m7",
        role: "gemini",
        text: "True craftsmanship in software is what happens under the surface. A live demonstration that explicitly attempts an unauthorized cross-user query and shows the Firestore kernel rejecting it is infinitely more persuasive than a slide declaring 'secure by design'.",
        timestamp: "2026-08-23T18:01:20.000Z",
      },
    ],
    keyPoints: [
      "Verifiable security beats visual claims every time",
      "Firestore Security Rules enforce kernel-level isolation at zero latency cost",
      "Server-side Secret Manager integration completely eliminates client credential leakage",
    ],
    actionItems: [
      { id: "act_ev_4", text: "Build an interactive Security Center with live verification test suite", status: "accepted" },
    ],
    tags: ["Security", "Ideathon", "Strategy"],
    sentiment: "energized",
    isPinned: true,
    createdAt: "2026-08-23T18:05:00.000Z",
    updatedAt: "2026-08-23T18:05:00.000Z",
  },
];

export const USER_B_INITIAL_JOURNALS: Journal[] = [
  {
    id: "jrn_marcus_01",
    userId: "usr_b_marcus_sterling_9942",
    title: "Venture Capital Dynamics & Seed Stage Valuations",
    summary: "Analyzed shifts in early-stage AI funding rounds. Founders with proven infrastructure moats are commanding premium terms despite macroeconomic tightening.",
    messages: [
      {
        id: "mb1",
        role: "user",
        text: "Reviewing pitch decks this week. Companies that are pure wrappers around standard LLM endpoints are getting zero traction compared to teams with proprietary data flywheels and robust security guarantees.",
        timestamp: "2026-08-25T11:00:00.000Z",
      },
      {
        id: "mb2",
        role: "gemini",
        text: "The market is maturing rapidly. Thin wrappers lack retention and privacy assurance. Enterprises and discerning individuals demand strict data isolation and zero training on private inputs.",
        timestamp: "2026-08-25T11:01:00.000Z",
      },
    ],
    keyPoints: [
      "Enterprise software buyers require cryptographic isolation guarantees",
      "Defensibility lies in user trust, seamless UX, and domain-tailored workflows",
    ],
    actionItems: [
      { id: "act_mc_1", text: "Finalize investment thesis memo on Private AI Workspaces", status: "accepted" },
    ],
    tags: ["Venture Capital", "Market Dynamics", "Strategy"],
    sentiment: "contemplative",
    isPinned: true,
    createdAt: "2026-08-25T11:05:00.000Z",
    updatedAt: "2026-08-25T11:05:00.000Z",
  },
];

export const USER_A_IDEAS: IdeaItem[] = [
  {
    id: "idea_ev_1",
    userId: "usr_a_evelyn_vance_8821",
    title: "Autonomous Code Refactoring Agent",
    description: "An agent that analyzes git diffs for memory leaks and concurrency race conditions before pull requests merge.",
    category: "AI & Engineering",
    createdAt: "2026-08-24T16:00:00.000Z",
  },
  {
    id: "idea_ev_2",
    userId: "usr_a_evelyn_vance_8821",
    title: "Cryptographic Provenance for Private Journaling",
    description: "Zero-knowledge proof verification verifying journal timestamp authenticity without decrypting entry contents.",
    category: "Privacy & Cryptography",
    createdAt: "2026-08-25T10:00:00.000Z",
  },
  {
    id: "idea_ev_3",
    userId: "usr_a_evelyn_vance_8821",
    title: "Adaptive Cognitive Load Dashboard",
    description: "Subtly measures daily typing cadence and ideation complexity to suggest optimal rest intervals.",
    category: "Human-Computer Interaction",
    createdAt: "2026-08-25T15:30:00.000Z",
  },
];
