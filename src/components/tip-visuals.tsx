import type { ReactNode } from "react";
import type { TipArticle, TipDiagramKind } from "@/lib/tips";

const coverPalettes = {
  violet: { start: "#f2efff", end: "#faf9ff", ink: "#5b47d6", soft: "#ded8ff" },
  blue: { start: "#edf6ff", end: "#fbfdff", ink: "#1973c8", soft: "#cee7ff" },
  coral: { start: "#fff1ec", end: "#fffaf7", ink: "#cf5a38", soft: "#ffd8ca" },
  mint: { start: "#eaf9f4", end: "#fbfefd", ink: "#14795f", soft: "#c8eee2" },
} as const;

function SvgLines({ x, y, lines, anchor = "middle", className = "tip-svg-label" }: { x: number; y: number; lines: string[]; anchor?: "start" | "middle" | "end"; className?: string }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={className}>
      {lines.map((line, index) => (
        <tspan key={line} x={x} dy={index === 0 ? 0 : 20}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export function TipCover({ article, compact = false }: { article: TipArticle; compact?: boolean }) {
  const palette = coverPalettes[article.coverVariant];
  const id = `tip-cover-${article.slug}`;

  return (
    <svg
      className="tip-cover-svg"
      viewBox="0 0 960 480"
      role="img"
      aria-labelledby={`${id}-title ${id}-description`}
      preserveAspectRatio="xMidYMid slice"
    >
      <title id={`${id}-title`}>{article.coverLabel}</title>
      <desc id={`${id}-description`}>An abstract planning path connecting a goal to a series of achievable steps.</desc>
      <defs>
        <linearGradient id={`${id}-background`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={palette.start} />
          <stop offset="1" stopColor={palette.end} />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor={palette.ink} floodOpacity="0.13" />
        </filter>
      </defs>
      <rect width="960" height="480" rx={compact ? 24 : 32} fill={`url(#${id}-background)`} />
      <circle cx="830" cy="80" r="170" fill={palette.soft} opacity="0.42" />
      <circle cx="78" cy="454" r="130" fill={palette.soft} opacity="0.28" />
      <path d="M86 333 C 220 333, 227 186, 374 186 S 519 305, 662 305 S 760 154, 875 154" fill="none" stroke={palette.ink} strokeWidth="4" strokeLinecap="round" opacity="0.32" />
      {[{ x: 114, y: 333 }, { x: 374, y: 186 }, { x: 662, y: 305 }, { x: 850, y: 154 }].map((node, index) => (
        <g key={index} filter={`url(#${id}-shadow)`}>
          <circle cx={node.x} cy={node.y} r={index === 3 ? 34 : 24} fill="#fff" />
          <circle cx={node.x} cy={node.y} r={index === 3 ? 15 : 8} fill={palette.ink} opacity={0.45 + index * 0.16} />
        </g>
      ))}
      <text x="72" y="112" className="tip-cover-label" fill="#17171a">
        {article.coverLabel}
      </text>
    </svg>
  );
}

type DiagramMeta = { title: string; description: string };

const diagramMeta: Record<TipDiagramKind, DiagramMeta> = {
  "goal-ladder": { title: "The goal breakdown ladder", description: "A large goal is broken into milestones, projects, and small next actions." },
  "next-action-test": { title: "The next-action test", description: "A short decision flow determines whether a step is ready to do or needs another breakdown." },
  "reverse-plan": { title: "Reverse-plan from day 90", description: "Work backward from day 90 evidence through day 60, day 30, and this week's action." },
  "ninety-day-cycle": { title: "The 90-day planning cycle", description: "Four phases move from preparing to building, improving, and finishing." },
  "smart-blueprint": { title: "SMART plus execution", description: "The five SMART criteria form the target layer above evidence, milestones, and next actions." },
  "smart-to-action": { title: "From a SMART goal to action", description: "A SMART goal flows through milestones and a current project to one next action." },
  "weekly-loop": { title: "The weekly goal planning loop", description: "Plan, do, review, and adjust repeat as a continuous weekly cycle." },
  "if-then-plan": { title: "An if-then action plan", description: "A clear cue leads to a goal action, with a fallback route when the first plan is blocked." },
};

function DiagramFrame({ kind, children }: { kind: TipDiagramKind; children: ReactNode }) {
  const meta = diagramMeta[kind];
  return (
    <figure className="tip-diagram-wrap">
      <svg className="tip-diagram" viewBox="0 0 960 420" role="img" aria-labelledby={`${kind}-title ${kind}-desc`}>
        <title id={`${kind}-title`}>{meta.title}</title>
        <desc id={`${kind}-desc`}>{meta.description}</desc>
        <defs>
          <marker id={`${kind}-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L10,5 L0,10 z" fill="#a4a2ad" />
          </marker>
        </defs>
        <rect width="960" height="420" rx="28" fill="#f8f8fa" />
        {children}
      </svg>
      <figcaption>{meta.title}</figcaption>
    </figure>
  );
}

function GoalLadder() {
  const rows = [
    { x: 330, y: 62, w: 300, label: ["GOAL", "Publish a useful newsletter"] },
    { x: 260, y: 154, w: 440, label: ["MILESTONE", "First three issues published"] },
    { x: 190, y: 246, w: 580, label: ["PROJECT", "Prepare issue one"] },
    { x: 90, y: 338, w: 780, label: ["NEXT ACTIONS", "Choose problem  ·  Outline  ·  Draft opening"] },
  ];
  return (
    <DiagramFrame kind="goal-ladder">
      {rows.map((row, index) => (
        <g key={row.label[0]}>
          {index > 0 && <path d={`M480 ${row.y - 34} V${row.y - 15}`} stroke="#b9b7c1" strokeWidth="3" />}
          <rect x={row.x} y={row.y - 15} width={row.w} height="68" rx="18" fill="#fff" stroke="#e4e2e8" />
          <text x={row.x + 24} y={row.y + 11} className="tip-svg-kicker">{row.label[0]}</text>
          <text x={row.x + 24} y={row.y + 36} className="tip-svg-label" textAnchor="start">{row.label[1]}</text>
        </g>
      ))}
    </DiagramFrame>
  );
}

function NextActionTest() {
  return (
    <DiagramFrame kind="next-action-test">
      <rect x="70" y="156" width="220" height="108" rx="22" fill="#fff" stroke="#e1dfe6" />
      <SvgLines x={180} y={190} lines={["Can I picture", "starting this?"]} />
      <path d="M290 210 H398" stroke="#a4a2ad" strokeWidth="3" markerEnd="url(#next-action-test-arrow)" />
      <rect x="410" y="156" width="220" height="108" rx="54" fill="#efeaff" stroke="#d9d0ff" />
      <SvgLines x={520} y={190} lines={["One verb +", "visible output?"]} />
      <path d="M630 210 H738" stroke="#a4a2ad" strokeWidth="3" markerEnd="url(#next-action-test-arrow)" />
      <rect x="750" y="156" width="150" height="108" rx="22" fill="#5c4ad4" />
      <SvgLines x={825} y={201} lines={["DO IT"]} className="tip-svg-label tip-svg-label-light" />
      <path d="M520 264 V328 H278" fill="none" stroke="#a4a2ad" strokeWidth="3" markerEnd="url(#next-action-test-arrow)" />
      <rect x="70" y="304" width="196" height="54" rx="18" fill="#fff" stroke="#e1dfe6" />
      <SvgLines x={168} y={337} lines={["Break it down"]} />
      <text x="350" y="304" className="tip-svg-note">No — still unclear</text>
      <text x="666" y="190" className="tip-svg-note">Yes</text>
    </DiagramFrame>
  );
}

function ReversePlan() {
  const cards = [
    { x: 64, label: "DAY 90", body: ["Evidence of", "completion"] },
    { x: 288, label: "DAY 60", body: ["Core milestone", "complete"] },
    { x: 512, label: "DAY 30", body: ["Foundation", "ready"] },
    { x: 736, label: "THIS WEEK", body: ["Book the first", "action"] },
  ];
  return (
    <DiagramFrame kind="reverse-plan">
      <path d="M824 294 C690 94 320 94 134 294" fill="none" stroke="#b8cfe6" strokeWidth="4" strokeDasharray="8 10" markerEnd="url(#reverse-plan-arrow)" />
      {cards.map((card, index) => (
        <g key={card.label}>
          <rect x={card.x} y={150 + Math.abs(1.5 - index) * 30} width="160" height="126" rx="20" fill={index === 0 ? "#e8f4ff" : "#fff"} stroke="#dce5ed" />
          <text x={card.x + 80} y={184 + Math.abs(1.5 - index) * 30} textAnchor="middle" className="tip-svg-kicker">{card.label}</text>
          <SvgLines x={card.x + 80} y={220 + Math.abs(1.5 - index) * 30} lines={card.body} />
        </g>
      ))}
      <text x="480" y="68" textAnchor="middle" className="tip-svg-note">Start with the finish line, then work backward</text>
    </DiagramFrame>
  );
}

function CycleDiagram({ kind, labels, accent }: { kind: "ninety-day-cycle" | "weekly-loop"; labels: { title: string; note: string }[]; accent: string }) {
  const positions = [{ x: 480, y: 95 }, { x: 700, y: 210 }, { x: 480, y: 325 }, { x: 260, y: 210 }];
  const paths = ["M540 105 C635 116 674 144 690 172", "M690 248 C668 284 611 314 544 320", "M416 320 C349 308 293 280 270 248", "M270 172 C293 132 350 105 416 100"];
  return (
    <DiagramFrame kind={kind}>
      {paths.map((path) => <path key={path} d={path} fill="none" stroke="#b7b5bf" strokeWidth="3" markerEnd={`url(#${kind}-arrow)`} />)}
      <circle cx="480" cy="210" r="72" fill={accent} opacity="0.12" />
      <SvgLines x={480} y={201} lines={kind === "weekly-loop" ? ["ONE WEEK", "ONE OUTCOME"] : ["90 DAYS", "ONE OUTCOME"]} className="tip-svg-kicker tip-svg-center" />
      {labels.map((label, index) => (
        <g key={label.title}>
          <rect x={positions[index].x - 86} y={positions[index].y - 41} width="172" height="82" rx="20" fill="#fff" stroke="#e1dfe6" />
          <text x={positions[index].x} y={positions[index].y - 7} textAnchor="middle" className="tip-svg-label">{label.title}</text>
          <text x={positions[index].x} y={positions[index].y + 18} textAnchor="middle" className="tip-svg-note">{label.note}</text>
        </g>
      ))}
    </DiagramFrame>
  );
}

function SmartBlueprint() {
  const smart = ["SPECIFIC", "MEASURABLE", "ACHIEVABLE", "RELEVANT", "TIME-BOUND"];
  return (
    <DiagramFrame kind="smart-blueprint">
      <text x="74" y="70" className="tip-svg-kicker">TARGET LAYER</text>
      {smart.map((item, index) => (
        <g key={item}>
          <rect x={74 + index * 164} y="92" width="144" height="70" rx="18" fill={index === 0 ? "#fff0ea" : "#fff"} stroke="#eadfd9" />
          <text x={146 + index * 164} y="134" textAnchor="middle" className="tip-svg-label">{item}</text>
        </g>
      ))}
      <path d="M480 170 V216" stroke="#aaa7b0" strokeWidth="3" markerEnd="url(#smart-blueprint-arrow)" />
      <rect x="134" y="238" width="692" height="116" rx="24" fill="#fff" stroke="#e1dfe6" />
      <text x="174" y="274" className="tip-svg-kicker">EXECUTION LAYER</text>
      <text x="174" y="318" className="tip-svg-label" textAnchor="start">Evidence</text>
      <text x="335" y="318" className="tip-svg-symbol">→</text>
      <text x="390" y="318" className="tip-svg-label" textAnchor="start">Milestones</text>
      <text x="568" y="318" className="tip-svg-symbol">→</text>
      <text x="622" y="318" className="tip-svg-label" textAnchor="start">Next action</text>
    </DiagramFrame>
  );
}

function FlowDiagram({ kind, nodes, accentIndex = 0 }: { kind: "smart-to-action" | "if-then-plan"; nodes: { kicker: string; lines: string[] }[]; accentIndex?: number }) {
  const cardWidth = kind === "if-then-plan" ? 230 : 176;
  const gap = kind === "if-then-plan" ? 62 : 48;
  const startX = (960 - (nodes.length * cardWidth + (nodes.length - 1) * gap)) / 2;
  return (
    <DiagramFrame kind={kind}>
      {nodes.map((node, index) => {
        const x = startX + index * (cardWidth + gap);
        return (
          <g key={node.kicker}>
            {index > 0 && <path d={`M${x - gap + 10} 210 H${x - 12}`} stroke="#aaa7b0" strokeWidth="3" markerEnd={`url(#${kind}-arrow)`} />}
            <rect x={x} y="148" width={cardWidth} height="124" rx="22" fill={index === accentIndex ? "#efeaff" : "#fff"} stroke={index === accentIndex ? "#d9d0ff" : "#e1dfe6"} />
            <text x={x + cardWidth / 2} y="182" textAnchor="middle" className="tip-svg-kicker">{node.kicker}</text>
            <SvgLines x={x + cardWidth / 2} y={216} lines={node.lines} />
          </g>
        );
      })}
      {kind === "if-then-plan" && (
        <g>
          <path d="M480 272 V330 H720" fill="none" stroke="#aaa7b0" strokeWidth="3" markerEnd="url(#if-then-plan-arrow)" />
          <rect x="730" y="304" width="170" height="54" rx="18" fill="#fff" stroke="#e1dfe6" />
          <SvgLines x={815} y={337} lines={["Use fallback"]} />
          <text x="501" y="316" className="tip-svg-note">If blocked</text>
        </g>
      )}
    </DiagramFrame>
  );
}

export function TipDiagram({ kind }: { kind: TipDiagramKind }) {
  switch (kind) {
    case "goal-ladder":
      return <GoalLadder />;
    case "next-action-test":
      return <NextActionTest />;
    case "reverse-plan":
      return <ReversePlan />;
    case "ninety-day-cycle":
      return <CycleDiagram kind={kind} accent="#2582c4" labels={[{ title: "Prepare", note: "Weeks 1–2" }, { title: "Build", note: "Weeks 3–6" }, { title: "Improve", note: "Weeks 7–10" }, { title: "Finish", note: "Weeks 11–13" }]} />;
    case "smart-blueprint":
      return <SmartBlueprint />;
    case "smart-to-action":
      return <FlowDiagram kind={kind} nodes={[{ kicker: "TARGET", lines: ["SMART goal"] }, { kicker: "PROOF", lines: ["Milestones"] }, { kicker: "NOW", lines: ["Next action"] }, { kicker: "CALENDAR", lines: ["Time block"] }]} />;
    case "weekly-loop":
      return <CycleDiagram kind={kind} accent="#21866d" labels={[{ title: "Plan", note: "Choose outcome" }, { title: "Do", note: "Protect time" }, { title: "Review", note: "Use evidence" }, { title: "Adjust", note: "Repair plan" }]} />;
    case "if-then-plan":
      return <FlowDiagram kind={kind} accentIndex={1} nodes={[{ kicker: "IF", lines: ["Tuesday", "at 7:30"] }, { kicker: "THEN", lines: ["Write for", "25 minutes"] }, { kicker: "RESULT", lines: ["Goal moves", "forward"] }]} />;
  }
}
