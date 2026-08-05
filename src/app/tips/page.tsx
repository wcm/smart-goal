import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TipCover } from "@/components/tip-visuals";
import { tipArticles } from "@/lib/tips";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Goal Planning Tips & Practical Guides",
  description: "Actionable guides for setting clear goals, breaking big goals into small steps, planning your week, and building consistent progress.",
  alternates: { canonical: "/tips" },
  openGraph: {
    title: "Goal Planning Tips & Practical Guides",
    description: "Concrete goal-setting methods and planning systems you can put into action today.",
    url: "/tips",
  },
};

export default function TipsPage() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Goal Planning Tips",
    itemListElement: tipArticles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${appUrl}/tips/${article.slug}`,
      name: article.title,
    })),
  };

  return (
    <main className="tips-index page-shell app-shell">
      <section className="dashboard-heading tips-heading"><h1>Tips</h1></section>

      <section className="tip-card-grid" aria-label="Goal planning articles">
        {tipArticles.map((article) => (
          <Link className="tip-card" href={`/tips/${article.slug}`} key={article.slug}>
            <div className="tip-card-cover"><TipCover article={article} compact /></div>
            <div className="tip-card-body">
              <div className="tip-card-meta"><span>{article.category}</span><span>{article.readingTime}</span></div>
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
              <span className="tip-card-link">Read guide <ArrowUpRight size={16} /></span>
            </div>
          </Link>
        ))}
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}
