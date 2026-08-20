import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Flag,
  Gauge,
  GitBranch,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import { GoalCapture } from "@/components/goal-capture";
import { ClearTemporaryPlan } from "@/components/clear-temporary-plan";
import { ScrollToGoalButton } from "@/components/scroll-to-goal-button";
import { SiteHeader } from "@/components/site-header";
import { getViewer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { absolute: "AI SMART Goal Planner | Build a Clear Action Plan" },
  description: "Turn a rough idea into a SMART goal and step-by-step action plan with an AI goal planner that helps clarify outcomes, estimate tasks, and track progress.",
  keywords: ["AI goal planner", "SMART goal planner", "SMART goal planning", "goal planner", "SMART action plan", "actionable goals"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "AI SMART Goal Planner | Build a Clear Action Plan",
    description: "Make your goal SMART, add your real-world context, and turn it into a practical action plan.",
    url: "/",
  },
};

const smartDimensions = [
  { letter: "S", title: "Specific", copy: "Name the exact outcome, not just the direction.", question: "What will I accomplish?" },
  { letter: "M", title: "Measurable", copy: "Choose evidence that makes progress visible.", question: "How will I know?" },
  { letter: "A", title: "Achievable", copy: "Fit the scope and pace to your real constraints.", question: "Is the path realistic?" },
  { letter: "R", title: "Relevant", copy: "Connect the work to an outcome that matters.", question: "Why is it worth doing?" },
  { letter: "T", title: "Time-bound", copy: "Give the goal a clear review or finish point.", question: "When will it happen?" },
];

const examplePlans = [
  {
    title: "Publish 8 newsletter issues in 12 weeks",
    progress: 31,
    total: "9h",
    tone: "violet",
    emoji: "💌",
    steps: [
      { title: "Define your ideal reader", time: "45m", complete: true },
      { title: "Create the first three issues", time: "5h", children: ["Outline each issue", "Write and edit issue one"] },
      { title: "Set up a publishing rhythm", time: "2h" },
    ],
  },
  {
    title: "Run my first half marathon in 16 weeks",
    progress: 18,
    total: "44h",
    tone: "blue",
    emoji: "🏃",
    steps: [
      { title: "Choose a realistic race date", time: "30m", complete: true },
      { title: "Build a 12-week training plan", time: "1h", children: ["Set weekly mileage", "Schedule recovery weeks"] },
      { title: "Complete the first base week", time: "4h" },
    ],
  },
  {
    title: "Hold a 10-minute Spanish conversation in 6 months",
    progress: 42,
    total: "36h",
    tone: "coral",
    emoji: "💬",
    steps: [
      { title: "Define a six-month milestone", time: "30m", complete: true },
      { title: "Create a weekly practice loop", time: "3h", children: ["Book one speaking session", "Review 20 useful phrases"] },
      { title: "Practice a travel conversation", time: "1h" },
    ],
  },
  {
    title: "Publish 2 product design case studies in 10 weeks",
    progress: 24,
    total: "32h",
    tone: "mint",
    emoji: "💼",
    steps: [
      { title: "Map my transferable skills", time: "1h", complete: true },
      { title: "Build two portfolio case studies", time: "18h", children: ["Choose two strong projects", "Write the first case study"] },
      { title: "Apply to five suitable roles", time: "4h" },
    ],
  },
];

const userStories = [
  {
    quote: "Once the finish line became eight published issues—not ‘grow my audience’—I finally knew what to do each week.",
    name: "Daniel Brooks",
    role: "Independent founder",
    use: "Publishing a newsletter",
    avatar: "/testimonials/daniel-brooks.jpg",
  },
  {
    quote: "The measurable milestones turned my dissertation from one intimidating project into progress I could actually see.",
    name: "Sofia Alvarez",
    role: "Graduate student",
    use: "Finishing a dissertation",
    avatar: "/testimonials/sofia-alvarez.jpg",
  },
  {
    quote: "A realistic time frame and weekly training target helped me plan around real life instead of an imaginary perfect week.",
    name: "Chloe Martin",
    role: "First-time half marathoner",
    use: "Training for a first race",
    avatar: "/testimonials/chloe-martin.jpg",
  },
  {
    quote: "My portfolio refresh went from a vague someday project to a specific result with a date and a next action.",
    name: "Maya Chen",
    role: "Product designer",
    use: "Rebuilding a portfolio",
    avatar: "/testimonials/maya-chen.jpg",
  },
  {
    quote: "When a step still feels too big, I break it down again. The goal stays fixed while the route gets more practical.",
    name: "Jordan Patel",
    role: "Product manager",
    use: "Changing careers",
    avatar: "/testimonials/jordan-patel.jpg",
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
                {step.children.map((child) => <div key={child}><span />{child}</div>)}
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
        <h1>Make your goal <span>SMART.</span><br />Then make it happen.</h1>
        <p className="hero-copy">Use our AI goal planner to turn a rough idea into a SMART goal, then build a practical action plan with clear steps and realistic time estimates.</p>
        <GoalCapture id="goal-builder" showSuggestions />
      </section>

      <section className="smart-framework page-shell" aria-labelledby="smart-heading">
        <div className="section-intro smart-intro">
          <h2 id="smart-heading">What makes a goal SMART?</h2>
        </div>
        <div className="smart-definition-grid">
          {smartDimensions.map((dimension) => (
            <article className={`smart-definition dimension-${dimension.letter.toLowerCase()}`} key={dimension.letter}>
              <strong>{dimension.letter}</strong>
              <div><h3>{dimension.title}</h3><p>{dimension.copy}</p><small>{dimension.question}</small></div>
            </article>
          ))}
        </div>

        <div className="goal-transformation">
          <div className="transformation-copy">
            <h2>From a direction to a definition.</h2>
            <p>SMART does not make the goal bigger. It removes ambiguity so every planning decision has something concrete to aim at.</p>
            <ScrollToGoalButton label="Build my SMART goal" />
          </div>
          <div className="before-after" aria-label="Example of a vague goal transformed into a SMART goal">
            <div className="goal-example vague"><span>Before</span><p>“I want to get better at running.”</p></div>
            <span className="transformation-arrow" aria-hidden="true"><ArrowRight size={18} /></span>
            <div className="goal-example smart">
              <span>After</span>
              <p>“Finish my first half marathon within 16 weeks by completing four progressive training sessions each week.”</p>
              <div className="smart-proof"><span><b>S</b> Half marathon</span><span><b>M</b> 21.1 km</span><span><b>A</b> 4× weekly</span><span><b>R</b> First race</span><span><b>T</b> 16 weeks</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="why-smart page-shell" aria-labelledby="why-smart-heading">
        <div className="section-intro">
          <h2 id="why-smart-heading">Clarity changes what happens next.</h2>
        </div>
        <div className="why-grid">
          <article><span><Target /></span><h3>Choose better actions</h3><p>A defined outcome makes it easier to separate useful work from busywork.</p></article>
          <article><span><Gauge /></span><h3>Set a realistic pace</h3><p>Scope, measures, and timing turn ambition into a plan that fits real life.</p></article>
          <article><span><Flag /></span><h3>Know when you are done</h3><p>A visible finish line helps you track progress, learn, and close the loop.</p></article>
        </div>
      </section>

      <section className="plan-gallery page-shell" aria-label="Example plans">
        <div className="gallery-heading"><h2>SMART goals become practical action plans.</h2></div>
        <div className="example-grid">
          {examplePlans.map((plan) => <ExamplePlan key={plan.title} plan={plan} />)}
        </div>
        <div className="gallery-guide-link">
          <Link href="/tips/smart-action-plan-examples">See five complete SMART action plan examples <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="how-it-works page-shell">
        <div className="section-intro"><h2>From vague idea to next action.</h2></div>
        <div className="feature-grid smart-steps">
          <article><div className="step-number">1</div><div className="feature-icon"><Sparkles /></div><h3>Make it SMART</h3><p>AI drafts the five SMART dimensions. You review and edit every detail.</p></article>
          <article><div className="step-number">2</div><div className="feature-icon"><Target /></div><h3>Add your context</h3><p>Answer three useful questions about constraints, resources, and your starting point.</p></article>
          <article><div className="step-number">3</div><div className="feature-icon"><GitBranch /></div><h3>Follow the next action</h3><p>Get a sequenced plan, realistic estimates, and deeper breakdowns whenever you need them.</p></article>
        </div>
      </section>

      <section className="testimonials" aria-labelledby="testimonials-heading">
        <div className="testimonial-heading page-shell">
          <h2 id="testimonials-heading">A clear goal creates momentum.</h2>
        </div>
        <div className="testimonial-viewport">
          <div className="testimonial-track">
            {[...userStories, ...userStories].map((story, index) => (
              <figure className="testimonial-card" key={`${story.name}-${index}`} aria-hidden={index >= userStories.length}>
                <blockquote>“{story.quote}”</blockquote>
                <figcaption>
                  <Image className="testimonial-avatar" src={story.avatar} alt={index < userStories.length ? `Fictional portrait of ${story.name}` : ""} width={48} height={48} sizes="48px" />
                  <span><strong>{story.name}</strong><small>{story.role} · {story.use}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-cta">
        <div className="page-shell">
          <h2>Make it clear. Make it doable.<br />Make it SMART.</h2>
          <p>You bring the ambition. We’ll help define the finish line and map the route.</p>
          <ScrollToGoalButton label="Build my SMART goals now" light />
        </div>
      </section>
      <footer className="marketing-footer">
        <div className="page-shell">
          <span>© {new Date().getFullYear()} SMART Goal</span>
          <nav aria-label="Footer"><Link href="/tips">Goal planning tips</Link><Link href="/terms">Terms &amp; Conditions</Link><Link href="/privacy">Privacy Policy</Link></nav>
        </div>
      </footer>
    </main>
  );
}
