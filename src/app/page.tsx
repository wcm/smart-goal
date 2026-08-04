import { ArrowDown, Check, GitBranch, RefreshCw, Timer } from "lucide-react";
import { GoalCapture } from "@/components/goal-capture";
import { SiteHeader } from "@/components/site-header";
import { getViewer } from "@/lib/supabase/server";

const demoSteps = [
  { title: "Define your ideal reader", time: "45m", complete: true },
  { title: "Choose a useful weekly format", time: "1h 15m", complete: true },
  { title: "Create the first three issues", time: "5h", complete: false },
  { title: "Set up a simple publishing workflow", time: "2h", complete: false },
];

export default async function Home() {
  const viewer = await getViewer();

  return (
    <main className="marketing-page">
      <SiteHeader viewer={viewer?.isDemo ? null : viewer} />
      <section className="hero page-shell">
        <div className="eyebrow"><span /> AI planning that stays practical</div>
        <h1>Make the next step<br /><em>feel obvious.</em></h1>
        <p className="hero-copy">
          Turn any ambition into a clear, time-estimated plan. Add what matters,
          break down what feels big, and build momentum one honest step at a time.
        </p>
        <GoalCapture />
      </section>

      <section className="product-preview page-shell" aria-label="GoalFlow product preview">
        <div className="preview-glow" />
        <div className="preview-window">
          <div className="preview-sidebar">
            <div className="mini-logo">G</div>
            <span className="side-pill active" />
            <span className="side-pill" />
            <span className="side-pill short" />
          </div>
          <div className="preview-content">
            <div className="preview-heading">
              <div>
                <span className="preview-kicker">YOUR PLAN</span>
                <h3>Launch a newsletter people love</h3>
              </div>
              <div className="preview-progress"><strong>31%</strong><span>complete</span></div>
            </div>
            <div className="progress-track"><span style={{ width: "31%" }} /></div>
            <div className="preview-steps">
              {demoSteps.map((step, index) => (
                <div className={`preview-step ${step.complete ? "done" : ""}`} key={step.title}>
                  <span className="preview-check">{step.complete && <Check size={13} />}</span>
                  <span className="preview-number">0{index + 1}</span>
                  <div><strong>{step.title}</strong><small>A focused outcome with room to go deeper.</small></div>
                  <span className="preview-time"><Timer size={13} /> {step.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works page-shell">
        <div className="section-intro">
          <span className="eyebrow"><span /> How it works</span>
          <h2>A plan that gets clearer<br />as you use it.</h2>
        </div>
        <div className="feature-grid">
          <article>
            <span className="feature-number">01</span>
            <div className="feature-icon"><GitBranch /></div>
            <h3>Start with the big picture</h3>
            <p>Describe the outcome. GoalFlow turns it into a sequenced plan with realistic time estimates.</p>
          </article>
          <article>
            <span className="feature-number">02</span>
            <div className="feature-icon"><ArrowDown /></div>
            <h3>Go as deep as you need</h3>
            <p>Break down any vague or intimidating step, layer by layer, while keeping the time honest.</p>
          </article>
          <article>
            <span className="feature-number">03</span>
            <div className="feature-icon"><RefreshCw /></div>
            <h3>Let the plan learn</h3>
            <p>Add context whenever life changes. Regenerate the relevant branch without losing the bigger goal.</p>
          </article>
        </div>
      </section>

      <section className="closing-cta">
        <div className="page-shell">
          <span className="eyebrow light"><span /> Your goal is worth a good plan</span>
          <h2>Start with what you know.<br /><em>Refine as you go.</em></h2>
          <GoalCapture />
        </div>
      </section>
      <footer className="marketing-footer page-shell">
        <span>© {new Date().getFullYear()} GoalFlow</span>
        <span>Built for thoughtful progress.</span>
      </footer>
    </main>
  );
}
