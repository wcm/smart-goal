import type { Metadata } from "next";
import Link from "next/link";
import { LegalContactLink, LegalDocument, type LegalSection } from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SMART Goal collects, uses, shares, and protects personal information.",
  alternates: { canonical: "/privacy" },
};

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    content: <><p>This Privacy Policy explains how SMART Goal (“we,” “us,” or “our”) collects, uses, discloses, and protects personal information when you use the SMART Goal website, applications, and related services (the “Service”).</p><p>By using the Service, you acknowledge this Policy. If you do not agree, do not provide personal information through the Service.</p></>,
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    content: <><div className="legal-table-wrap"><table><thead><tr><th>Category</th><th>Examples</th></tr></thead><tbody><tr><td>Account information</td><td>For temporary users, an anonymous user identifier and authentication record. If you sign in with Google, this also includes your name, email address, Google profile image, and account identifier.</td></tr><tr><td>Goal and plan content</td><td>Your goals, context answers, generated plans, steps, descriptions, time estimates, completion status, assumptions, and archived versions.</td></tr><tr><td>Activity information</td><td>Completion dates, streak activity, plan timestamps, timezone, AI generation status, usage count, token counts, and error information.</td></tr><tr><td>Technical information</td><td>Session cookies and information ordinarily recorded by hosting, security, and infrastructure providers, such as IP address, browser, device, request time, and diagnostic logs.</td></tr><tr><td>Communications</td><td>Information you include when you contact us about support, privacy, legal, or product feedback.</td></tr></tbody></table></div><p>Please avoid entering sensitive personal data that is not needed to make your plan. Goal content may reveal information about your health, finances, career, beliefs, relationships, or other personal circumstances depending on what you choose to submit.</p></>,
  },
  {
    id: "sources",
    title: "Where information comes from",
    content: <><p>We receive information directly from you when you enter goals, answer questions, update plans, complete steps, or contact us. You may begin with a temporary anonymous account. When you sign in with Google, Google provides the basic account details you authorize, such as your name, email address, profile image, and account identifier.</p><p>We also collect limited information automatically through session technology, product operations, and service logs. Temporary plan data is kept in your browser session until you sign in or return home. In developer demo mode, plan and activity data is stored only in your browser’s local storage.</p></>,
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    content: <><p>We use personal information to:</p><ul><li>authenticate users and maintain accounts;</li><li>create, store, display, update, archive, and delete plans;</li><li>generate SMART goal drafts, clarification questions, plans, step breakdowns, and estimates;</li><li>calculate completion progress and streak activity;</li><li>enforce usage limits and protect the Service from abuse;</li><li>diagnose errors, maintain security, and improve reliability;</li><li>respond to requests and communicate material service or policy changes; and</li><li>comply with law and protect users, SMART Goal, and third parties.</li></ul><p>Where applicable law requires a legal basis, we rely on performance of our agreement with you to provide the Service, our legitimate interests in securing and improving it, consent where specifically requested, and compliance with legal obligations.</p></>,
  },
  {
    id: "ai-processing",
    title: "How AI processing works",
    content: <><p>When you request a SMART goal draft, plan, questions, or step breakdown, relevant goal content is sent to OpenAI for processing. Depending on the feature, this may include your starting goal, edited SMART fields, plan summary, step title and description, ancestor steps, time estimate, and answers to context questions. We also send a privacy-preserving hashed safety identifier used for abuse prevention.</p><p>SMART Goal configures OpenAI Responses API requests with <code>store: false</code>, so it does not ask OpenAI to store response application state for later use. Under OpenAI’s standard API controls, prompts and responses are not used to train OpenAI models unless the API account owner explicitly opts in. OpenAI may retain abuse-monitoring logs containing customer content for up to 30 days unless different approved retention controls or a legal requirement apply.</p><p>AI output is returned to SMART Goal and becomes part of your saved plan when you choose to create or update it. Do not include sensitive information that is unnecessary for the planning request.</p></>,
  },
  {
    id: "sharing",
    title: "When information is shared",
    content: <><p>We do not sell personal information. We do not share personal information for cross-context behavioral advertising and currently do not use third-party advertising trackers.</p><p>We disclose information only as reasonably necessary to:</p><ul><li>Google, for account authentication;</li><li>Supabase, for authentication, database storage, and security controls;</li><li>OpenAI, for AI generation and abuse prevention;</li><li>hosting, infrastructure, security, and support providers that operate the Service for us;</li><li>professional advisers or authorities when required by law or necessary to protect rights and safety; or</li><li>a successor in a merger, financing, acquisition, reorganization, or sale of assets, subject to appropriate safeguards.</li></ul><p>Service providers may process information only for the services they provide to us and under their own contractual and legal obligations.</p></>,
  },
  {
    id: "cookies-and-storage",
    title: "Cookies and browser storage",
    content: <><p>Temporary and registered accounts use cookies that are necessary to establish, refresh, and secure your Supabase authentication session. These cookies are not advertising cookies. A temporary plan is stored in the current tab’s session storage and is cleared when you return home, close the tab, or clear site data.</p><p>SMART Goal briefly uses browser local storage to carry a temporary plan through Google sign-in. The snapshot is removed after a successful import or when you return home. In developer demo mode, plans and completion activity also remain in local storage until you clear site data or the application removes them.</p></>,
  },
  {
    id: "retention",
    title: "How long we keep information",
    content: <><p>We generally keep registered account and plan information while your account is active or as needed to provide the Service. Temporary plan content is not stored in our plan database. We may delete abandoned anonymous authentication records and their usage counters after 30 days.</p><p>Archived plan versions remain associated with your saved plan so regeneration history can work. Deleting a plan removes its related steps, context answers, AI generation records, and completion events from the active database through linked deletion rules. If you request account deletion, we will delete or de-identify account-linked information unless we must retain limited records for security, fraud prevention, legal compliance, dispute resolution, or backup integrity. Provider logs and backups may persist for a limited period under provider retention schedules before being overwritten or deleted.</p></>,
  },
  {
    id: "transfers",
    title: "International processing",
    content: <><p>Our providers may process information in countries other than where you live. Those countries may have different data-protection laws. Where required, we use contractual or other recognized safeguards for international transfers and take steps intended to ensure that providers protect information consistently with this Policy.</p></>,
  },
  {
    id: "security",
    title: "Security",
    content: <><p>We use reasonable technical and organizational safeguards designed to protect personal information. Current measures include encrypted network connections, managed authentication, database row-level access controls, per-user authorization, server-side API credentials, and restricted AI usage quotas.</p><p>No internet service is completely secure. You should protect your Google account, use a trusted device, and avoid entering information that you would not want processed as described in this Policy.</p></>,
  },
  {
    id: "your-rights",
    title: "Your privacy rights",
    content: <><p>Depending on where you live, you may have rights to request access to, correction of, deletion of, restriction of, or portability of your personal information; to object to certain processing; to withdraw consent; and to complain to a data-protection authority.</p><p>You can update or delete individual plans within the Service. For account-level requests, contact us using the address below. We may need to verify your identity and may retain information where an exception under applicable law applies. Authorized agents may submit requests where local law permits.</p></>,
  },
  {
    id: "children",
    title: "Children’s privacy",
    content: <><p>The Service is not directed to children under 13, and we do not knowingly collect personal information from them. Where a higher age threshold or parental consent applies, users must satisfy that requirement. If you believe a child has provided personal information contrary to this section, contact us so we can investigate and take appropriate action.</p></>,
  },
  {
    id: "automated-decisions",
    title: "Automated decision-making",
    content: <><p>SMART Goal uses AI to suggest planning content, but it does not make decisions that produce legal or similarly significant effects about you. You choose whether to use, edit, complete, or disregard every suggested step.</p></>,
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: <><p>We may update this Policy when the Service, our providers, or applicable requirements change. We will revise the effective date and provide additional notice when a change is material. Earlier versions may be retained for reference where appropriate.</p></>,
  },
  {
    id: "contact",
    title: "Contact us",
    content: <><p>For privacy questions, requests, or complaints, contact <LegalContactLink />. You may also have the right to contact the data-protection authority where you live.</p><p>Use of the Service is also governed by our <Link href="/terms">Terms &amp; Conditions</Link>.</p></>,
  },
];

export default function PrivacyPage() {
  return <LegalDocument title="Privacy Policy" introduction="How SMART Goal handles account information, goal content, and AI-assisted planning data." sections={sections} />;
}
