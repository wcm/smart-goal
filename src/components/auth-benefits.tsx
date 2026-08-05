import { Check } from "lucide-react";

const benefits = [
  {
    title: "Save your progress",
    description: "Keep this plan and pick up exactly where you left off.",
  },
  {
    title: "Unlimited plans",
    description: "Give every goal its own focused, actionable roadmap.",
  },
  {
    title: "Unlimited breakdowns",
    description: "Go deeper until every next step feels clear and doable.",
  },
];

export function AuthBenefits() {
  return (
    <ul className="auth-benefits">
      {benefits.map((benefit) => (
        <li key={benefit.title}>
          <span className="auth-benefit-icon" aria-hidden="true"><Check size={14} strokeWidth={2.7} /></span>
          <span>
            <strong>{benefit.title}</strong>
            <small>{benefit.description}</small>
          </span>
        </li>
      ))}
    </ul>
  );
}
