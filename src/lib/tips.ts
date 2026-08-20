export type TipDiagramKind =
  | "goal-ladder"
  | "next-action-test"
  | "reverse-plan"
  | "ninety-day-cycle"
  | "smart-blueprint"
  | "smart-to-action"
  | "weekly-loop"
  | "if-then-plan";

export type TipSection = {
  id: string;
  heading: string;
  paragraphs: string[];
  steps?: { title: string; body: string }[];
  bullets?: string[];
  template?: string;
  diagram?: TipDiagramKind;
};

export type TipArticle = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  keywords: string[];
  coverLabel: string;
  coverVariant: "violet" | "blue" | "coral" | "mint";
  sections: TipSection[];
  sources: { label: string; href: string }[];
};

export const tipArticles: TipArticle[] = [
  {
    slug: "smart-action-plan-examples",
    title: "SMART Action Plan Examples: 5 Goals With Clear Steps",
    description: "See five complete SMART action plan examples for study, work, business, health, and learning, with measurable goals, sequenced steps, and review points.",
    excerpt: "Five realistic SMART goals carried through into action plans—not just polished goal statements—with steps, timing, and checkpoints you can adapt.",
    category: "SMART examples",
    publishedAt: "2026-08-14",
    updatedAt: "2026-08-14",
    readingTime: "10 min read",
    keywords: [
      "SMART action plan examples",
      "SMART goals action plan examples",
      "SMART action plan sample",
      "SMART plan example",
      "SMART goal planning",
      "actionable goals",
    ],
    coverLabel: "5 goals → 5 complete plans",
    coverVariant: "coral",
    sections: [
      {
        id: "goal-versus-plan",
        heading: "A SMART goal is the finish line; the action plan is the route",
        paragraphs: [
          "A useful SMART action plan has two layers. The goal defines a specific, measurable, achievable, relevant, and time-bound result. The plan then names the work, order, effort, and review points needed to reach it. If you only write the goal, you may still be unsure what to do next. If you only list tasks, you may stay busy without knowing whether the work adds up to success.",
          "The examples below cover a student, an employee, an entrepreneur, a health goal, and a learning goal. Each uses the same structure so you can compare the goal with the actions that make it executable.",
        ],
        bullets: [
          "Goal: the result and evidence of completion.",
          "Milestones: meaningful outcomes along the route.",
          "Actions: clear tasks that produce the next milestone.",
          "Capacity: the time, money, or support the plan can use.",
          "Review point: a scheduled moment to adjust using real evidence.",
        ],
        template: "By [date], I will [observable result], measured by [evidence], because [reason]. I can use [capacity], and I will review progress every [interval].",
      },
      {
        id: "student-example",
        heading: "1. Student SMART action plan: finish a literature review",
        paragraphs: [
          "SMART goal: Within ten weeks, I will submit a 6,000-word literature review that synthesizes at least thirty relevant peer-reviewed sources and meets my supervisor’s agreed outline and citation requirements. I will protect six hours each week and request feedback at the outline and first-draft stages.",
          "Why it is SMART: the deliverable and subject are specific; word count, source count, and supervisor criteria make it measurable; six weekly hours make the scope testable; it advances the student’s dissertation; and the ten-week deadline is clear.",
        ],
        steps: [
          { title: "Week 1: Confirm the question and criteria", body: "Agree on the research question, chapter outline, source criteria, and feedback dates with the supervisor." },
          { title: "Weeks 1–3: Build the evidence base", body: "Search, screen, and annotate at least thirty useful sources in a structured evidence table." },
          { title: "Weeks 3–4: Produce the synthesis outline", body: "Group findings into themes, identify disagreements or gaps, and submit the outline for feedback." },
          { title: "Weeks 5–8: Draft and revise", body: "Write one section at a time, then revise the complete draft against the agreed criteria." },
          { title: "Weeks 9–10: Review and submit", body: "Apply supervisor feedback, verify citations, proofread, and submit before the deadline." },
        ],
        template: "Weekly review: sources screened, words drafted, next section, unresolved question, and hours remaining.",
      },
      {
        id: "work-example",
        heading: "2. Work SMART action plan: build a stronger portfolio",
        paragraphs: [
          "SMART goal: Within ten weeks, I will publish two product-design case studies that explain the problem, my decisions, and the outcome, then request structured feedback from six relevant hiring managers or senior designers. I will use four hours each week outside my current role.",
          "This is more actionable than “improve my portfolio” because the finish line is published work plus completed feedback conversations. It also separates the work you control from the result you do not control: receiving a job offer.",
        ],
        steps: [
          { title: "Choose two projects", body: "Select projects with clear constraints, meaningful personal contribution, and evidence of change." },
          { title: "Create one shared case-study structure", body: "Define the sections, evidence, image list, and quality checklist before drafting either story." },
          { title: "Publish case study one", body: "Draft, review with one trusted peer, revise, and publish by the end of week four." },
          { title: "Publish case study two", body: "Reuse the structure, improve the weak points found in the first review, and publish by week eight." },
          { title: "Run the feedback loop", body: "Contact six relevant reviewers, record their comments, and make one focused revision to each case study." },
        ],
        template: "Review at weeks 2, 4, 8, and 10: published evidence, feedback received, actual hours, and next revision.",
      },
      {
        id: "business-example",
        heading: "3. Entrepreneur SMART action plan: validate a paid workshop",
        paragraphs: [
          "SMART goal: Within twelve weeks, I will validate and launch a two-hour online workshop for first-time managers, secure ten paid bookings at $75 or more, and maintain an average feedback score of at least four out of five. I will use a $600 test budget and eight hours each week.",
          "Revenue alone would not show whether the offer is useful, so this goal combines a commercial measure with a quality guardrail. The action plan tests the riskiest assumption—the audience’s willingness to pay—before investing in a large course.",
        ],
        steps: [
          { title: "Interview ten potential participants", body: "Confirm the most urgent first-manager problems and the language people use to describe them." },
          { title: "Define and pre-sell the workshop", body: "Write the promise, agenda, price, date, and refund terms, then invite interview participants to book." },
          { title: "Build the minimum useful session", body: "Create the exercises, facilitator notes, and take-home checklist needed to deliver the promised outcome." },
          { title: "Run the first workshop", body: "Deliver to a small paid group and collect ratings, open comments, and follow-up questions." },
          { title: "Improve and run it again", body: "Revise the weakest section, repeat promotion through the strongest channel, and review bookings, revenue, and feedback in week twelve." },
        ],
        template: "Track interviews, landing-page visits, paid bookings, acquisition cost, attendance, and participant rating each week.",
      },
      {
        id: "health-example",
        heading: "4. Health SMART action plan: prepare for a first 5K",
        paragraphs: [
          "SMART goal: Within twelve weeks, I will complete a 5 km event by following a beginner-appropriate plan with three scheduled movement sessions each week, while adjusting for pain, recovery, and advice from a qualified health professional when needed.",
          "The event provides a clear outcome, while completed sessions make progress visible before race day. The safety constraint matters: a goal is not achievable if the plan ignores health history, recovery, or warning signs.",
        ],
        steps: [
          { title: "Check the starting point", body: "Choose an appropriate event date, assess current capacity, and get professional guidance if health concerns or symptoms make that necessary." },
          { title: "Schedule three weekly sessions", body: "Place two shorter sessions and one gradually longer session into realistic calendar slots." },
          { title: "Progress gradually", body: "Increase only one demand at a time and keep easier weeks or rest available for recovery." },
          { title: "Rehearse the event", body: "Test clothing, hydration, pacing, and the planned route or conditions before the final week." },
          { title: "Review the full cycle", body: "After the event, record completion, comfort, consistency, and what the next goal should preserve or change." },
        ],
        template: "Weekly review: sessions completed, distance or duration, recovery, discomfort, and next week’s adjustment.",
      },
      {
        id: "learning-example",
        heading: "5. Learning SMART action plan: hold a Spanish conversation",
        paragraphs: [
          "SMART goal: Within six months, I will hold a ten-minute conversation in Spanish with a tutor about travel, daily routines, and future plans, using no English for clarification. I will complete five twenty-minute practice sessions and one speaking session each week.",
          "The conversation is direct evidence of the desired skill. Weekly practice is a leading measure the learner can control, while the six-month test prevents endless preparation without performance.",
        ],
        steps: [
          { title: "Record a baseline conversation", body: "Attempt the same topics now and note where vocabulary, listening, or sentence formation breaks down." },
          { title: "Build a useful language set", body: "Collect high-frequency phrases for the three topics instead of studying disconnected word lists." },
          { title: "Create a weekly practice loop", body: "Alternate listening, recall, short writing, and speaking, then use the tutor session to expose gaps." },
          { title: "Run monthly ten-minute tests", body: "Record one conversation under the final conditions and compare fluency, pauses, and clarification needs." },
          { title: "Focus the final month", body: "Use the test recordings to target the two biggest gaps, then complete the final conversation." },
        ],
        template: "Track practice sessions, speaking minutes, phrases recalled, and one problem to address in the next tutor session.",
      },
      {
        id: "adapt-example",
        heading: "How to adapt any SMART action plan sample",
        paragraphs: [
          "Copy the structure, not the numbers. A twelve-week plan is only useful if the scope fits your starting point and weekly capacity. Replace the outcome, evidence, deadline, and constraints first. Then keep only the actions that produce your next milestone.",
          "Review the draft as a connected system. If the goal changes, the milestones and estimates may need to change too. If an action does not create evidence, reduce uncertainty, or enable another step, remove it. The best plan is not the longest one; it is the smallest credible route from your current position to the finish line.",
        ],
        bullets: [
          "Keep one observable finish line.",
          "Use both outcome measures and controllable leading measures.",
          "Match the plan to a normal week, not an ideal week.",
          "Add an early review before the final deadline.",
          "Break down only the next unclear step.",
        ],
      },
    ],
    sources: [
      { label: "World Health Organization SMART action planning guide", href: "https://extranet.who.int/lqsi/sites/default/files/attachedfiles/SMART%20Action%20Planning_0.pdf" },
      { label: "University of Kansas Community Tool Box action planning resources", href: "https://ctb.ku.edu/en/table-of-contents/structure/strategic-planning/develop-action-plans/tools" },
      { label: "Worcester Polytechnic Institute SMART goal examples", href: "https://www.wpi.edu/sites/default/files/2025-06/Examples-of-SMART-Goals-by-Division-and-Roles.pdf" },
    ],
  },
  {
    slug: "how-to-use-an-ai-goal-planner",
    title: "How to Use an AI Goal Planner Without Getting a Generic Plan",
    description: "Learn how to use an AI goal planner to clarify a SMART goal, add useful context, evaluate generated steps, and build an action plan that fits real life.",
    excerpt: "AI can draft the structure quickly. The quality comes from a clear finish line, honest constraints, and a careful review of every suggested step.",
    category: "AI goal planning",
    publishedAt: "2026-08-14",
    updatedAt: "2026-08-14",
    readingTime: "8 min read",
    keywords: [
      "AI goal planner",
      "AI goal planning",
      "goal planner AI",
      "AI action plan generator",
      "SMART goal planner",
      "actionable goal plan",
    ],
    coverLabel: "Your context → a useful AI plan",
    coverVariant: "blue",
    sections: [
      {
        id: "what-ai-planner-does",
        heading: "What an AI goal planner should actually do",
        paragraphs: [
          "An AI goal planner should reduce the distance between a rough intention and a plan you can inspect. It can propose a clearer target, ask for missing context, organize milestones, identify dependencies, estimate small tasks, and suggest a first action. That is more useful than returning a motivational paragraph or an enormous undifferentiated checklist.",
          "The output is still a draft. AI does not know your calendar, health, finances, workplace, skill level, or changing priorities unless you provide relevant context—and even then, it can make weak assumptions. Use it to accelerate planning, while keeping decisions about feasibility, safety, and importance with you.",
        ],
        bullets: [
          "Clarify the finish line before generating tasks.",
          "Ask for context that changes the route.",
          "Organize work into outcomes and next actions.",
          "Show estimates as hypotheses, not guarantees.",
          "Keep every part editable and reviewable.",
        ],
      },
      {
        id: "start-rough",
        heading: "Start with the goal you have, even if it is vague",
        paragraphs: [
          "You do not need to write a perfect prompt. “Get fitter,” “launch my business,” or “finish my dissertation” is enough to begin. The planner’s first job is to expose what is missing, not pretend the vague statement is already an executable goal.",
          "A strong first pass converts the direction into a proposed SMART goal. Review the wording rather than accepting it automatically. The draft should describe the result you want—not substitute a convenient activity count for the outcome that matters.",
        ],
        template: "I want to [rough direction]. My current starting point is [baseline]. This matters because [reason].",
      },
      {
        id: "review-smart-draft",
        heading: "Review the SMART goal before building the action plan",
        paragraphs: [
          "Check the five dimensions separately. Specific identifies the actual result. Measurable names evidence. Achievable tests scope against resources. Relevant protects capacity for something that matters. Time-bound adds a finish or decision point. Editing these fields before generating the plan prevents one weak assumption from spreading into every step.",
        ],
        steps: [
          { title: "Specific", body: "Can you picture the completed result, who it affects, and what is outside the scope?" },
          { title: "Measurable", body: "Would an independent person recognize the evidence that the goal is complete?" },
          { title: "Achievable", body: "Does the target fit your baseline, time, money, skills, support, and known constraints?" },
          { title: "Relevant", body: "Does this goal deserve attention now, and what larger outcome does it support?" },
          { title: "Time-bound", body: "Is there a credible deadline plus an earlier point to review assumptions?" },
        ],
      },
      {
        id: "add-context",
        heading: "Give the AI context that changes the plan",
        paragraphs: [
          "Useful context is not a long autobiography. Include facts that change scope, order, effort, or risk: your baseline, deadline, weekly capacity, budget, existing resources, fixed commitments, required approvals, and quality or safety constraints.",
          "If a fact would not change the plan, leave it out. If you do not know an important fact, say that it is uncertain. A good plan turns uncertainty into an early discovery action rather than inventing confidence.",
        ],
        bullets: [
          "Starting point: what already exists or has been completed?",
          "Capacity: how many hours or how much budget is actually available?",
          "Constraints: which dates, rules, dependencies, or limits cannot move?",
          "Resources: which people, tools, materials, or skills can help?",
          "Quality bar: what must be true beyond simply finishing?",
        ],
        template: "I have [weekly capacity] and [resources]. I must work around [constraints]. The result must meet [quality or safety criteria]. I am uncertain about [unknown].",
      },
      {
        id: "evaluate-plan",
        heading: "Test the generated plan before you trust it",
        paragraphs: [
          "Read the plan from the finish line backward. Do the milestones create the promised evidence? Do the steps respect dependencies? Are estimates attached to work small enough to estimate? Does the first action fit your current position? Remove generic filler such as “stay motivated,” “research options,” or “work on the project” unless it produces a specific output.",
          "Then compare the total effort with your available weeks. If the numbers do not fit, change the scope, deadline, or capacity. Do not keep an impossible plan because the wording sounds confident.",
        ],
        bullets: [
          "Every milestone describes an observable completed state.",
          "Each active step begins with a clear verb and produces one result.",
          "Dependencies appear before the work they enable.",
          "Time estimates add up without counting parent and child work twice.",
          "The plan includes a checkpoint before the final deadline.",
        ],
      },
      {
        id: "worked-example",
        heading: "Example: use AI to plan a newsletter launch",
        paragraphs: [
          "Rough goal: “Start a newsletter.” A useful SMART draft could be: “Within twelve weeks, publish eight weekly issues for first-time product managers and reach 150 relevant subscribers, using five hours each week.” Before accepting it, the user should confirm whether eight issues, 150 subscribers, and five hours are credible.",
          "Useful context might include an existing audience of forty people, no email platform, a $200 budget, one experienced editor available for feedback, and a fixed launch date. The action plan can then sequence audience interviews, positioning, platform setup, an editorial outline, the first issue, signup testing, publishing, and distribution. Without that context, an AI planner is likely to produce a generic content checklist.",
        ],
        steps: [
          { title: "Define the reader and promise", body: "Interview five potential readers and write one positioning statement based on repeated problems." },
          { title: "Build the publishing system", body: "Choose the platform, configure signup and welcome messages, and test the complete subscription path." },
          { title: "Prepare the first three issues", body: "Outline all three, draft the first, and use editor feedback to improve the shared format." },
          { title: "Publish and distribute weekly", body: "Use two relevant channels, track subscriptions and replies, and protect the five-hour capacity limit." },
          { title: "Review after issue four", body: "Compare actual writing time, subscriber growth, replies, and topic performance before planning the final four issues." },
        ],
      },
      {
        id: "high-stakes",
        heading: "Use extra judgment for high-stakes goals",
        paragraphs: [
          "Do not follow an unreviewed AI plan when mistakes could materially affect health, safety, legal rights, finances, employment, or other people. Use qualified professional advice where appropriate and treat the planner as an organizational aid, not an authority.",
          "Also avoid sharing sensitive personal or confidential information that is unnecessary for the plan. Describe constraints at the level needed to organize the work. You can often say “a fixed medical limitation” or “a confidential approval process” without supplying private details.",
        ],
      },
      {
        id: "good-output",
        heading: "The result should be easier to act on—and easier to change",
        paragraphs: [
          "A useful AI-generated goal plan gives you an obvious next action today, a visible milestone ahead, and a finish line you can evaluate. It should also remain editable. Real progress reveals new information, so the plan must absorb completed work, updated estimates, changed constraints, and better ideas.",
          "That is the right division of labor: AI drafts and organizes quickly; you supply context, challenge assumptions, choose trade-offs, and decide what matters.",
        ],
      },
    ],
    sources: [
      { label: "NIST AI Risk Management Framework: Generative AI Profile", href: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf" },
      { label: "Implementation intentions and goal achievement meta-analysis", href: "https://www.researchgate.net/publication/37367696_Implementation_Intentions_and_Goal_Achievement_A_Meta-Analysis_of_Effects_and_Processes" },
    ],
  },
  {
    slug: "how-to-break-down-big-goals-into-small-steps",
    title: "How to Break Down Big Goals Into Small Achievable Steps",
    description: "A concrete goal breakdown method for turning an overwhelming goal into milestones, manageable tasks, and a next action you can start today.",
    excerpt: "Turn a vague ambition into a practical hierarchy of milestones, projects, and small next actions—without planning every detail upfront.",
    category: "Goal planning",
    publishedAt: "2026-08-05",
    updatedAt: "2026-08-05",
    readingTime: "8 min read",
    keywords: [
      "how to break down big goals",
      "break goals into small steps",
      "goal breakdown method",
      "actionable steps for goals",
      "goal planning step by step",
    ],
    coverLabel: "Big goal → clear next action",
    coverVariant: "violet",
    sections: [
      {
        id: "why-big-goals-stall",
        heading: "Why big goals feel difficult to start",
        paragraphs: [
          "A big goal usually describes a destination, not an action. “Launch a business,” “run a half marathon,” and “learn Spanish” may be meaningful, but none tells you what to do at 9:00 tomorrow morning. The distance between the outcome and the next visible action creates uncertainty—and uncertainty is easy to postpone.",
          "The solution is not to make the goal less ambitious. It is to create enough structure that you can see the next decision, estimate the work, and begin without reopening the entire plan. A useful goal planner should let you stop at a high level where the work is obvious and go deeper only where a step still feels vague.",
        ],
        bullets: [
          "An outcome describes the change you want.",
          "A milestone proves meaningful progress.",
          "A project produces one milestone.",
          "A next action is small and specific enough to start.",
        ],
      },
      {
        id: "four-level-goal-tree",
        heading: "Use a four-level goal breakdown method",
        paragraphs: [
          "Start with a four-level tree instead of one enormous task list. The levels protect you from two common mistakes: jumping straight from a dream to dozens of disconnected tasks, or planning so much detail that the plan becomes harder to maintain than the work itself.",
          "For example, “launch a useful weekly newsletter” can become a milestone such as “publish the first three issues.” That milestone can contain a project called “prepare issue one,” which can be broken into the next actions “choose one reader problem,” “write a five-point outline,” and “draft the opening 300 words.”",
        ],
        steps: [
          { title: "Write the finish line", body: "Describe the observable result, the quality bar, and any deadline or boundary." },
          { title: "Choose three to five milestones", body: "Use outcomes that would prove the goal is moving, not broad activity categories." },
          { title: "Identify the projects", body: "For each milestone, list the pieces of work that produce it." },
          { title: "Break down only the unclear project", body: "Continue until the first action feels obvious; leave understandable work at a higher level." },
        ],
        diagram: "goal-ladder",
      },
      {
        id: "write-better-milestones",
        heading: "Write milestones that show progress",
        paragraphs: [
          "A milestone should be verifiable. “Research,” “prepare,” and “work on marketing” are categories of effort. “Interview five target readers,” “finish a twelve-week training schedule,” and “publish a landing page with a working signup form” are results you can inspect.",
          "Use a noun plus a completed state: “reader profile approved,” “race selected,” or “portfolio case study published.” If a milestone contains “and,” test whether it is actually two milestones. If it takes only one sitting, it is probably a task rather than a milestone.",
        ],
        template: "By [date], I will have [observable result], proven by [evidence], while respecting [important constraint].",
      },
      {
        id: "small-enough-next-actions",
        heading: "Know when a step is small enough",
        paragraphs: [
          "Keep breaking down a step when you cannot picture starting it, when it contains multiple verbs, or when completion depends on information you have not gathered. Stop when the action has a clear verb, a visible output, and a realistic time box.",
          "A practical next action often takes between fifteen and ninety minutes, but duration is not the only test. “Email Maya three interview questions” is actionable even if it takes five minutes. “Build website” is not actionable even if you reserve an afternoon for it.",
        ],
        diagram: "next-action-test",
        bullets: [
          "Starts with a physical verb: draft, call, compare, book, outline, test.",
          "Produces one visible result.",
          "Does not hide an unanswered decision.",
          "Can be completed in one focused session or scheduled block.",
        ],
      },
      {
        id: "estimate-without-false-precision",
        heading: "Estimate effort without pretending to know everything",
        paragraphs: [
          "Estimate the smallest active steps, then let their time add up to the parent. This makes the total useful without counting the same work twice. If four child tasks take 20, 30, 45, and 25 minutes, the parent should show two hours—not two hours plus the original parent estimate.",
          "Treat the first estimate as a planning hypothesis. After completing two or three similar steps, update the remaining estimates. The purpose is capacity awareness: can this goal fit into your actual week? It is not a promise that every task will finish on schedule.",
        ],
      },
      {
        id: "weekly-review",
        heading: "Use a ten-minute weekly goal review",
        paragraphs: [
          "Once a week, look at the plan from the bottom up. Check completed actions, update anything that changed, and choose the smallest unfinished step that would make the next week meaningful. Avoid rebuilding the whole plan because one estimate was wrong.",
        ],
        bullets: [
          "What moved forward last week?",
          "Which step is still too vague to start?",
          "What new constraint or information should change the plan?",
          "What is the one next action I will schedule?",
        ],
      },
    ],
    sources: [
      { label: "Locke and Latham on specific, challenging goals", href: "https://doi.org/10.1111/j.1467-8721.2006.00449.x" },
      { label: "University of Houston goal breakdown handout", href: "https://www.uhcl.edu/cmhc/resources/documents/personal-self-help-handouts/break-down-goals.pdf" },
    ],
  },
  {
    slug: "90-day-goal-planning-method",
    title: "The 90-Day Goal Planning Method: From Outcome to Weekly Plan",
    description: "Build a realistic 90-day goal plan by working backward from the outcome, choosing milestones, and matching weekly actions to your available time.",
    excerpt: "A practical 90-day goal planning system that connects a meaningful outcome to weekly commitments and honest capacity.",
    category: "Planning methods",
    publishedAt: "2026-08-05",
    updatedAt: "2026-08-05",
    readingTime: "9 min read",
    keywords: [
      "90 day goal planning",
      "90 day goal planner",
      "quarterly goal planning method",
      "weekly goal plan",
      "how to create a 90 day action plan",
    ],
    coverLabel: "One quarter, one clear outcome",
    coverVariant: "blue",
    sections: [
      {
        id: "why-90-days",
        heading: "Why use a 90-day goal plan?",
        paragraphs: [
          "A year is long enough for priorities and assumptions to change. A week is too short for many meaningful outcomes. Ninety days is a useful middle distance: long enough to complete substantial work, but short enough to make trade-offs and review progress regularly.",
          "A 90-day plan works best when it is treated as a capacity decision, not a wish list. Choose one primary outcome, optionally one maintenance goal, and explicitly defer the rest. Your plan should answer what “done” looks like, what must be true by the end of each phase, and what can fit into a normal week.",
        ],
      },
      {
        id: "reverse-plan",
        heading: "Work backward from evidence of success",
        paragraphs: [
          "Begin at day 90 and ask what evidence would convince you the goal is complete. Then move backward: what must exist by day 60, day 30, and the end of this week? Reverse planning exposes dependencies earlier than a forward brainstorm.",
          "Suppose the goal is “hold a fifteen-minute conversation in Spanish.” Day-90 evidence could be a recorded conversation with a tutor. Day 60 might require ten completed speaking sessions. Day 30 might require a core vocabulary deck and four sessions. This week might require choosing a tutor and booking the first call.",
        ],
        diagram: "reverse-plan",
        template: "On day 90, [evidence] will show that [outcome] is complete. By day 60, [milestone]. By day 30, [milestone]. This week, [next action].",
      },
      {
        id: "divide-quarter",
        heading: "Divide the quarter into four working phases",
        paragraphs: [
          "Do not divide the plan into thirteen identical weeks. Different stages need different kinds of work. A simple phase structure gives you direction without over-scheduling every day.",
        ],
        steps: [
          { title: "Weeks 1–2: Define and prepare", body: "Confirm the finish line, baseline, tools, constraints, and first calendar commitments." },
          { title: "Weeks 3–6: Build the core", body: "Complete the highest-leverage work while the plan is still easy to adjust." },
          { title: "Weeks 7–10: Repeat and improve", body: "Use feedback, repetition, or testing to close the largest quality gaps." },
          { title: "Weeks 11–13: Finish and review", body: "Protect time for integration, delivery, recovery from delays, and a final review." },
        ],
        diagram: "ninety-day-cycle",
      },
      {
        id: "capacity",
        heading: "Build the plan from weekly capacity",
        paragraphs: [
          "Write down the hours that are genuinely available in an average week—not your best week. Reserve roughly twenty percent for overruns, coordination, and recovery. If you have five hours, plan about four. A goal that requires eight hours must change in scope, deadline, or available capacity.",
          "Next, compare each milestone’s estimated work with the weeks assigned to it. This catches impossible quarters before they become discouraging quarters. When estimates are uncertain, create a short discovery step rather than adding a large guess.",
        ],
        bullets: [
          "Use your normal week as the baseline.",
          "Keep one buffer block unassigned.",
          "Schedule the hardest recurring action first.",
          "Reduce scope before relying on motivation or overtime.",
        ],
      },
      {
        id: "weekly-plan",
        heading: "Turn the 90-day plan into a weekly goal planner",
        paragraphs: [
          "At the start of each week, choose one weekly outcome tied to the current phase. Then select two to five actions that produce it. Calendar the first action and leave lower-priority work visible but unscheduled.",
          "At the end of the week, update the plan using evidence: completed steps, actual time, new constraints, and feedback. Do not punish a missed week by doubling the next one. Re-estimate, move the milestone, or reduce scope.",
        ],
        template: "This week will be successful if [weekly outcome]. The first action is [specific action] at [time/place]. If the week becomes constrained, I will preserve [minimum viable action].",
      },
      {
        id: "example",
        heading: "Example: a 90-day newsletter launch plan",
        paragraphs: [
          "Outcome: publish six useful issues and reach 250 relevant subscribers by day 90. Weeks 1–2 define the audience and interview five readers. Weeks 3–6 create the landing page, welcome email, and first three issues. Weeks 7–10 publish weekly and test two distribution channels. Weeks 11–13 improve the strongest channel and document a repeatable publishing workflow.",
          "The key is that subscriber growth is not the only measure. Publishing cadence and reader replies are leading evidence that the system is working. If growth is slower than expected, the plan can change distribution steps without discarding the entire goal.",
        ],
      },
    ],
    sources: [
      { label: "Locke and Latham’s goal-setting research review", href: "https://www.researchgate.net/publication/254734316_Building_a_Practically_Useful_Theory_of_Goal_Setting_and_Task_Motivation_A_35Year_Odyssey" },
      { label: "Implementation intentions and goal achievement", href: "https://www.researchgate.net/publication/37367696_Implementation_Intentions_and_Goal_Achievement_A_Meta-Analysis_of_Effects_and_Processes" },
    ],
  },
  {
    slug: "smart-goals-to-action-plan",
    title: "SMART Goals That Actually Work: Turn Them Into an Action Plan",
    description: "Learn how to write a SMART goal and convert it into milestones, time estimates, and concrete next actions with practical examples.",
    excerpt: "SMART makes a target clearer. This guide adds the missing execution layer: milestones, dependencies, estimates, and next actions.",
    category: "Goal setting",
    publishedAt: "2026-08-05",
    updatedAt: "2026-08-05",
    readingTime: "8 min read",
    keywords: [
      "how to write SMART goals",
      "SMART goals action plan",
      "SMART goal examples",
      "goal setting and action planning",
      "SMART goal planning template",
    ],
    coverLabel: "Clear target → executable plan",
    coverVariant: "coral",
    sections: [
      {
        id: "smart-is-a-target-test",
        heading: "SMART is a target test, not a complete plan",
        paragraphs: [
          "SMART is useful because it forces a vague intention to become more specific, measurable, achievable, relevant, and time-bound. But a well-written target can still sit untouched. “Publish twelve newsletter issues by December 1” is clearer than “write more,” yet it does not identify the audience, publishing system, first issue, or weekly work.",
          "Treat SMART as the first layer of goal planning. Once the target passes the SMART test, add an execution layer: evidence, constraints, milestones, dependencies, estimated effort, and the first scheduled action.",
        ],
        diagram: "smart-blueprint",
      },
      {
        id: "write-smart-goal",
        heading: "How to write a SMART goal, step by step",
        paragraphs: [
          "Write one sentence first, then test each part. Avoid stuffing every detail into the sentence; supporting context belongs in the plan. The target should remain easy to remember and precise enough to evaluate.",
        ],
        steps: [
          { title: "Specific", body: "Name the result and who or what it affects. Replace “improve” with an observable change." },
          { title: "Measurable", body: "Choose evidence you can count, observe, publish, demonstrate, or verify." },
          { title: "Achievable", body: "Check the target against current skill, resources, and available time—not optimism." },
          { title: "Relevant", body: "Explain why this goal deserves capacity now and what it supports." },
          { title: "Time-bound", body: "Choose a decision date or completion date, plus an earlier review point." },
        ],
        template: "By [date], I will [specific result], measured by [evidence], because [relevance], using no more than [capacity or constraint].",
      },
      {
        id: "examples",
        heading: "Three practical SMART goal examples",
        paragraphs: [
          "Career: “By October 31, I will publish two product-design case studies and ask six relevant hiring managers for feedback, using four hours each week.” The evidence is published work and completed feedback conversations—not simply “feel ready to change careers.”",
          "Fitness: “Within twelve weeks, I will complete three runs per week and finish a 10 km training run without pain, following a plan reviewed by an appropriate professional for my current condition.” The process measure supports the outcome while keeping a safety constraint visible.",
          "Learning: “By December 15, I will hold a fifteen-minute Spanish conversation with a tutor using no English, supported by three hours of weekly practice.” The conversation is the evidence; weekly practice is the controllable input.",
        ],
      },
      {
        id: "convert-to-action",
        heading: "Convert a SMART goal into an actionable goal plan",
        paragraphs: [
          "Move from the target to milestones by asking what must be true before the final evidence can exist. Then turn only the nearest milestone into projects and next actions. This keeps the plan useful when later assumptions change.",
          "For the career example, milestones might be “case-study outline reviewed,” “first case study published,” “second case study published,” and “six feedback conversations completed.” The first next action could be “choose the project with the clearest before-and-after evidence.”",
        ],
        diagram: "smart-to-action",
        bullets: [
          "List three to five milestone outcomes.",
          "Mark dependencies that must happen first.",
          "Estimate the smallest active steps.",
          "Schedule one next action, not the entire future.",
        ],
      },
      {
        id: "failure-modes",
        heading: "Fix common SMART goal planning mistakes",
        paragraphs: [
          "A measurable goal can still reward the wrong behavior. Publishing volume without a quality signal may produce twelve weak issues. Add a guardrail such as reader replies, completion quality, or a review checklist. Likewise, “achievable” should not mean effortless; it means the scope and resources are credible.",
          "Deadlines also need review points. Waiting until the final date hides bad assumptions. Add a checkpoint after the first meaningful attempt and use it to update scope, order, or estimates.",
        ],
        bullets: [
          "Do not confuse an activity count with the outcome you value.",
          "Do not choose a deadline without checking weekly capacity.",
          "Do not make every milestone dependent on the previous one when work can run in parallel.",
          "Do not keep a step vague just because the final goal is specific.",
        ],
      },
      {
        id: "worksheet",
        heading: "A compact SMART goal planning worksheet",
        paragraphs: [
          "Write the answers below in plain language. If one answer is uncertain, turn that uncertainty into a discovery step rather than inventing confidence.",
        ],
        bullets: [
          "Target: What exactly will be different?",
          "Evidence: What will prove completion?",
          "Deadline: When will you decide whether it is done?",
          "Capacity: How much time or money is honestly available?",
          "Milestones: What three outcomes must exist first?",
          "Next action: What can you start in one focused session?",
        ],
      },
    ],
    sources: [
      { label: "Background on the original SMART criteria", href: "https://en.wikipedia.org/wiki/SMART_criteria" },
      { label: "New directions in goal-setting theory", href: "https://doi.org/10.1111/j.1467-8721.2006.00449.x" },
    ],
  },
  {
    slug: "weekly-goal-oriented-planning-system",
    title: "Goal-Oriented Planning: A Weekly System for Consistent Progress",
    description: "Use a goal-oriented weekly planning system to prioritize meaningful outcomes, create if-then plans, track progress, and recover after missed weeks.",
    excerpt: "Connect the work on your calendar to a meaningful outcome with a simple weekly plan, review loop, and recovery rule.",
    category: "Productivity",
    publishedAt: "2026-08-05",
    updatedAt: "2026-08-05",
    readingTime: "9 min read",
    keywords: [
      "goal oriented planning",
      "weekly goal planning system",
      "goal progress tracker",
      "productivity planning for goals",
      "how to stay consistent with goals",
    ],
    coverLabel: "Plan the week around outcomes",
    coverVariant: "mint",
    sections: [
      {
        id: "goal-oriented-vs-task-oriented",
        heading: "What is goal-oriented planning?",
        paragraphs: [
          "Task-oriented planning asks, “What needs doing?” Goal-oriented planning asks, “Which result matters, and what work will move it?” Both are necessary, but only the second prevents urgent maintenance work from consuming every available hour.",
          "A goal-oriented week begins with one outcome, not a long list. Tasks are selected because they produce that outcome. Administrative work still exists, but it no longer decides the shape of the week by default.",
        ],
        template: "This week’s outcome is [observable result]. It matters because [goal connection]. I will protect [time blocks] for the actions that produce it.",
      },
      {
        id: "weekly-loop",
        heading: "Use a four-part weekly goal planning loop",
        paragraphs: [
          "A useful weekly system is deliberately small: plan, do, review, adjust. The review is not a performance judgment. It is where the plan absorbs reality—actual duration, new information, missed dependencies, and changing priorities.",
        ],
        steps: [
          { title: "Plan", body: "Choose one weekly outcome and no more than five supporting actions." },
          { title: "Do", body: "Start with the highest-leverage action during protected time." },
          { title: "Review", body: "Record completed work, actual effort, evidence, and blockers." },
          { title: "Adjust", body: "Break down vague steps, change estimates, or reduce scope before the next week." },
        ],
        diagram: "weekly-loop",
      },
      {
        id: "choose-weekly-outcome",
        heading: "Choose a weekly outcome instead of a weekly theme",
        paragraphs: [
          "“Work on the website” is a theme. “Publish the pricing page and test its signup path” is an outcome. The second creates a finish line and makes it easier to reject unrelated tasks.",
          "Choose an outcome small enough to finish in the capacity you control. If several people or uncertain approvals are involved, define your part: “Send the reviewed proposal and schedule the decision meeting” is within your control even if final approval is not.",
        ],
        bullets: [
          "It produces visible evidence by the end of the week.",
          "It advances one current milestone.",
          "It fits inside normal capacity with a small buffer.",
          "It can survive one disrupted day.",
        ],
      },
      {
        id: "if-then-plans",
        heading: "Turn important actions into if-then plans",
        paragraphs: [
          "An implementation intention connects a situation to a response: “If it is Tuesday at 7:30, then I will open the draft and write for twenty-five minutes.” The cue reduces the need to decide again in the moment.",
          "Add a fallback for predictable disruption. “If Tuesday evening is unavailable, then I will use Wednesday’s lunch block.” The fallback should preserve momentum, not demand that you complete the entire missed session later.",
        ],
        diagram: "if-then-plan",
        template: "If [specific time, place, or trigger] occurs, then I will [small goal action]. If that is blocked, I will [minimum fallback] at [backup trigger].",
      },
      {
        id: "track-progress",
        heading: "Track goal progress without creating busywork",
        paragraphs: [
          "Track completed actions and milestone evidence, not mood. A streak can make consistency visible, but it should represent meaningful movement: completing a step, running the planned session, publishing the draft, or reviewing the plan after new information.",
          "Use time-weighted progress when steps differ substantially. Checking a five-minute setup task should not count the same as completing a five-hour deliverable. Let the smallest active steps contribute their estimated share while parent steps summarize their children.",
        ],
        bullets: [
          "Daily: mark meaningful completed steps.",
          "Weekly: review progress and choose the next outcome.",
          "Monthly: confirm the goal still deserves its capacity.",
          "At milestones: update the plan using evidence and feedback.",
        ],
      },
      {
        id: "recover",
        heading: "How to recover after missing a week",
        paragraphs: [
          "Do not copy every missed task into the next week. First identify why the plan failed: insufficient time, unclear action, missing dependency, avoidance, or a changed priority. Fix that planning problem before adding more work.",
          "Restart with a minimum viable action that reconnects you to the goal in under thirty minutes. Then rebuild the next milestone using current capacity. Consistency is not an unbroken sequence of perfect weeks; it is the ability to resume without turning one miss into abandonment.",
        ],
        steps: [
          { title: "Name the cause", body: "Choose the main planning failure instead of using a general label such as “lack of discipline.”" },
          { title: "Shrink the re-entry step", body: "Select an action small enough to complete today." },
          { title: "Repair the plan", body: "Change scope, dependencies, timing, or detail based on what happened." },
          { title: "Resume the normal loop", body: "Choose the next weekly outcome without trying to repay every missed task." },
        ],
      },
    ],
    sources: [
      { label: "Implementation intentions meta-analysis", href: "https://www.researchgate.net/publication/37367696_Implementation_Intentions_and_Goal_Achievement_A_Meta-Analysis_of_Effects_and_Processes" },
      { label: "Mental contrasting with implementation intentions review", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8149892/" },
    ],
  },
];

export function getTipArticle(slug: string) {
  return tipArticles.find((article) => article.slug === slug);
}
