import Link from "next/link";
import { ArrowDown, Check, GitBranch, RefreshCw, Timer } from "lucide-react";
import { GoalCapture } from "@/components/goal-capture";
import { ClearTemporaryPlan } from "@/components/clear-temporary-plan";
import { SiteHeader } from "@/components/site-header";
import { getViewer } from "@/lib/supabase/server";

const examplePlans = [
  {
    title: "Launch a newsletter people love",
    progress: 31,
    total: "9h",
    tone: "violet",
    emoji: "💌",
    steps: [
      { title: "Define your ideal reader", time: "45m", complete: true },
      {
        title: "Create the first three issues",
        time: "5h",
        children: ["Outline each issue", "Write and edit issue one"],
      },
      { title: "Set up a publishing rhythm", time: "2h" },
    ],
  },
  {
    title: "Run my first half marathon",
    progress: 18,
    total: "44h",
    tone: "blue",
    emoji: "🏃",
    steps: [
      { title: "Choose a realistic race date", time: "30m", complete: true },
      {
        title: "Build a 12-week training plan",
        time: "1h",
        children: ["Set weekly mileage", "Schedule recovery weeks"],
      },
      { title: "Complete the first base week", time: "4h" },
    ],
  },
  {
    title: "Learn conversational Spanish",
    progress: 42,
    total: "36h",
    tone: "coral",
    emoji: "💬",
    steps: [
      { title: "Define a six-month milestone", time: "30m", complete: true },
      {
        title: "Create a weekly practice loop",
        time: "3h",
        children: ["Book one speaking session", "Review 20 useful phrases"],
      },
      { title: "Practice a travel conversation", time: "1h" },
    ],
  },
];

const userStories = [
  {
    quote: "I stopped carrying the whole launch in my head. Now I can open the plan, see the next useful action, and get moving.",
    initials: "IF",
    role: "Indie founder",
    use: "Planning a product launch",
    tone: "violet",
  },
  {
    quote: "Breaking my dissertation into work I could finish in one sitting made a huge goal feel calm and surprisingly manageable.",
    initials: "GS",
    role: "Graduate student",
    use: "Finishing a dissertation",
    tone: "blue",
  },
  {
    quote: "The time estimates helped me build a training plan around real life—not the imaginary perfect week I usually plan for.",
    initials: "AR",
    role: "Amateur runner",
    use: "Training for a first race",
    tone: "coral",
  },
];

function ExamplePlan({ plan }: { plan: (typeof examplePlans)[number] }) {
  return (
    <article className={`example-plan tone-${plan.tone}`}>
      <div className="example-plan-head">
        <span className="example-emoji" aria-hidden="true">{plan.emoji}</span>
      </div>
      <h3>{plan.title}</h3>
      <footer><span>{plan.total} total</span><span>{plan.steps.length + 2} steps</span></footer>
      <div className="example-progress"><span style={{ width: `${plan.progress}%` }} /></div>
      <div className="example-steps">
        {plan.steps.map((step) => (
          <div className="example-step-group" key={step.title}>
            <div className={`example-step ${step.complete ? "done" : ""}`}>
              <span className="example-check">{step.complete && <Check size={12} />}</span>
              <div><strong>{step.title}</strong></div>
              <span className="example-time"><Timer size={13} /> {step.time}</span>
            </div>
            {step.children && (
              <div className="example-children">
                {step.children.map((child) => (
                  <div key={child}><span />{child}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}

export default async function Home({ searchParams }: { searchParams: Promise<{ signin?: string }> }) {
  const [viewer, params] = await Promise.all([getViewer(), searchParams]);

  return (
    <main className="marketing-page">
      <ClearTemporaryPlan />
      <SiteHeader viewer={viewer?.isDemo ? null : viewer} autoOpenGuestSignIn={params.signin === "usage"} />
      <section className="hero page-shell">
        <div className="hero-aura" aria-hidden="true"><span /><span /><span /></div>
        <h1>Turn any goal into<br />a plan you can <span>finish.</span></h1>
        <p className="hero-copy">Practical AI planning with clear steps, honest time estimates, and as much detail as you need.</p>
        <GoalCapture showSuggestions />
      </section>

      <section className="plan-gallery page-shell" aria-label="Example plans">
        <div className="gallery-heading"><h2>Plans that meet you where you are.</h2></div>
        <div className="example-grid">
          {examplePlans.map((plan) => <ExamplePlan key={plan.title} plan={plan} />)}
        </div>
      </section>

      <section className="testimonials page-shell" aria-labelledby="testimonials-heading">
        <div className="testimonial-panel">
          <div className="testimonial-heading">
            <span>Illustrative user stories</span>
            <h2 id="testimonials-heading">Clarity creates momentum.</h2>
          </div>
          <div className="testimonial-grid">
            {userStories.map((story) => (
              <figure className="testimonial-card" key={story.role}>
                <blockquote>“{story.quote}”</blockquote>
                <figcaption>
                  <span className={`testimonial-avatar tone-${story.tone}`} aria-hidden="true">{story.initials}</span>
                  <span><strong>{story.role}</strong><small>{story.use}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="how-it-works page-shell">
        <div className="section-intro"><h2>From idea to action.</h2></div>
        <div className="feature-grid">
          <article><div className="feature-icon"><GitBranch /></div><h3>Start with the outcome</h3><p>Get a sequenced plan with realistic estimates.</p></article>
          <article><div className="feature-icon"><ArrowDown /></div><h3>Break down the hard parts</h3><p>Go deeper until every next action is clear.</p></article>
          <article><div className="feature-icon"><RefreshCw /></div><h3>Adjust as life changes</h3><p>Add context and rebuild only what needs to change.</p></article>
        </div>
      </section>

      <section className="closing-cta">
        <div className="page-shell">
          <h2>What do you want to achieve?</h2>
          <GoalCapture />
        </div>
      </section>
      <footer className="marketing-footer">
        <div className="page-shell">
          <span>© {new Date().getFullYear()} Goal Planner</span>
          <nav aria-label="Legal"><Link href="/terms">Terms &amp; Conditions</Link><Link href="/privacy">Privacy Policy</Link></nav>
        </div>
      </footer>
    </main>
  );
}
