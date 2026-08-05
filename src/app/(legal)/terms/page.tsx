import type { Metadata } from "next";
import Link from "next/link";
import { LegalContactLink, LegalDocument, type LegalSection } from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern access to and use of Goal Planner.",
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement to these terms",
    content: <><p>These Terms &amp; Conditions (“Terms”) govern your access to the Goal Planner website, applications, and related services (the “Service”). References to “Goal Planner,” “we,” “us,” or “our” mean the provider of the Service.</p><p>By accessing or using the Service, you agree to these Terms and acknowledge our <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not use the Service.</p></>,
  },
  {
    id: "service",
    title: "What Goal Planner provides",
    content: <><p>Goal Planner helps you turn goals into structured plans, generate clarification questions, break work into smaller steps, estimate effort, and track completion and consistency. Some features use artificial intelligence to generate suggestions from the information you provide.</p><p>The Service is a planning and organizational tool. It does not complete tasks for you, guarantee that a goal is achievable, or promise any particular personal, professional, financial, health, educational, or other outcome.</p></>,
  },
  {
    id: "eligibility-and-accounts",
    title: "Eligibility and accounts",
    content: <><p>You must be legally capable of entering into these Terms. The Service is not intended for children under 13. If the law where you live requires parental consent or a higher minimum age for online services, you may use the Service only when those requirements are met.</p><p>You may begin with a limited temporary account. Temporary plans exist only in the current browser tab and are cleared when you return home, close the tab, or clear site data unless you sign in to save first. Registered features require a Google-authenticated account. You are responsible for activity under your account, for keeping access to your Google account secure, and for promptly telling us if you believe your Goal Planner account has been accessed without permission.</p></>,
  },
  {
    id: "your-content",
    title: "Your goals and content",
    content: <><p>You retain ownership of the goals, answers, plan content, and other information you submit (“User Content”). You give us a limited, non-exclusive license to host, copy, transmit, format, and process User Content only as needed to operate, secure, support, and improve the Service or comply with law.</p><p>You are responsible for your User Content and must have the right to submit it. Do not enter confidential information belonging to someone else, regulated secrets, or sensitive personal information that is unnecessary for planning your goal.</p></>,
  },
  {
    id: "ai-output",
    title: "AI-generated plans",
    content: <><p>AI output may be incomplete, inaccurate, outdated, unsuitable, or unexpectedly similar to content produced for other users. Review every plan and estimate before relying on it. You are responsible for deciding whether an action is appropriate for your circumstances.</p><p>Goal Planner is not a substitute for qualified medical, legal, financial, mental-health, safety, or other professional advice. For decisions with material consequences, consult an appropriate professional and verify important information independently.</p></>,
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: <><p>You may not use the Service to:</p><ul><li>break the law, violate another person’s rights, or create or distribute harmful or deceptive material;</li><li>submit content you do not have permission to use;</li><li>probe, disrupt, overload, bypass, or gain unauthorized access to the Service or another user’s data;</li><li>circumvent usage limits, authentication, security controls, or safety measures;</li><li>introduce malware, scrape the Service at unreasonable volume, or operate automated access without our written permission; or</li><li>use AI output as the sole basis for decisions that determine another person’s legal rights, access to essential services, employment, credit, housing, healthcare, or safety.</li></ul><p>We may limit or suspend access when reasonably necessary to protect users, the Service, or third parties.</p></>,
  },
  {
    id: "third-parties",
    title: "Third-party services",
    content: <><p>The Service relies on third parties, including Google for sign-in, Supabase for authentication and data storage, OpenAI for AI processing, and hosting or infrastructure providers. Your use of those services may also be governed by their terms and privacy notices.</p><p>We are not responsible for third-party products or websites that we do not control. Availability or changes in a third-party service may affect Goal Planner features.</p></>,
  },
  {
    id: "intellectual-property",
    title: "Our intellectual property",
    content: <><p>Except for User Content, the Service—including its software, interface, branding, templates, and original editorial content—is owned by or licensed to Goal Planner and is protected by applicable intellectual-property laws.</p><p>These Terms give you a personal, limited, revocable, non-exclusive, non-transferable right to use the Service. They do not transfer ownership of the Service or permit you to copy, resell, sublicense, or create a competing service from protected parts of Goal Planner except where applicable law expressly allows it.</p></>,
  },
  {
    id: "availability",
    title: "Availability and changes",
    content: <><p>We may add, change, suspend, or discontinue features, limits, or integrations. Temporary access currently includes browser-session plans, a limited lifetime number of AI actions, and fewer breakdown levels than a registered account. Limits may change to protect the Service, manage cost, or improve the product.</p><p>We aim to keep the Service available, but we do not guarantee uninterrupted or error-free operation. Maintenance, provider outages, security incidents, or circumstances beyond our control may cause interruptions. If paid features are introduced, their price, billing cycle, cancellation terms, and any additional conditions will be presented before purchase.</p></>,
  },
  {
    id: "termination",
    title: "Ending use of the Service",
    content: <><p>You may stop using Goal Planner at any time. You can delete individual plans in the Service and may request account deletion using the contact details below.</p><p>We may suspend or terminate access when you materially breach these Terms, create risk or legal exposure, misuse the Service, or when we discontinue the Service. Where practical and lawful, we will provide notice and an opportunity to export or remove your content.</p></>,
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    content: <><p>To the maximum extent permitted by law, the Service is provided “as is” and “as available.” We disclaim implied warranties of merchantability, fitness for a particular purpose, non-infringement, and any warranty arising from course of dealing or usage.</p><p>We do not warrant the accuracy of AI-generated content, time estimates, progress calculations, or suggested actions. Nothing in these Terms excludes warranties or consumer rights that cannot lawfully be excluded.</p></>,
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content: <><p>To the maximum extent permitted by law, Goal Planner and its suppliers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of profits, opportunities, goodwill, or data arising from your use of the Service.</p><p>Our total liability for claims relating to the Service will not exceed the greater of the amount you paid us for the Service during the 12 months before the event giving rise to the claim or US$100. These limits do not apply where liability cannot legally be limited, including where applicable for fraud, willful misconduct, or personal injury caused by negligence.</p></>,
  },
  {
    id: "disputes",
    title: "Resolving concerns",
    content: <><p>Please contact us first so we can try to resolve a concern informally. Applicable law, including any mandatory consumer protections available where you live, continues to apply.</p><p>Nothing in these Terms prevents either party from seeking urgent relief necessary to protect security, confidential information, or intellectual-property rights.</p></>,
  },
  {
    id: "changes",
    title: "Changes to these terms",
    content: <><p>We may update these Terms as the Service changes or law requires. We will update the effective date and provide additional notice when a change is material. Continuing to use the Service after the revised Terms take effect means you accept them, except where law requires another form of consent.</p></>,
  },
  {
    id: "contact",
    title: "Contact",
    content: <><p>Questions about these Terms can be sent to <LegalContactLink />.</p></>,
  },
];

export default function TermsPage() {
  return <LegalDocument title="Terms & Conditions" introduction="The rules for using Goal Planner and its AI-assisted planning features." sections={sections} />;
}
