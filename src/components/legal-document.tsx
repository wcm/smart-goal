import type { ReactNode } from "react";
import { legalConfig } from "@/lib/legal";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export function LegalContactLink() {
  return <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>;
}

export function LegalDocument({ title, introduction, sections }: { title: string; introduction: string; sections: LegalSection[] }) {
  return (
    <main className="legal-page page-shell app-shell">
      <header className="legal-heading">
        <h1>{title}</h1>
        <p>{introduction}</p>
        <span>Effective {legalConfig.effectiveDate}</span>
      </header>

      <article className="legal-content">
        {sections.map((section, index) => (
          <section id={section.id} key={section.id}>
            <h2><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</h2>
            {section.content}
          </section>
        ))}
      </article>
    </main>
  );
}
