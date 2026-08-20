import type { Metadata } from "next";
import Link from "next/link";
import { TipCover } from "@/components/tip-visuals";
import { tipArticles } from "@/lib/tips";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "SMART Goal Planning Tips & Action Plan Guides",
  description: "Practical SMART goal planning guides, action plan examples, and methods for turning big goals into clear, achievable steps.",
  alternates: { canonical: "/tips" },
  openGraph: {
    title: "SMART Goal Planning Tips & Action Plan Guides",
    description: "Practical SMART goal examples, action plans, and planning methods you can put into action today.",
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
      <section className="dashboard-heading tips-heading">
        <h1>SMART goal planning tips</h1>
        <p>Practical guides for writing actionable goals, building realistic action plans, and making steady progress.</p>
      </section>

      <section className="tip-card-grid" aria-label="Goal planning articles">
        {tipArticles.map((article) => (
          <Link className="tip-card" href={`/tips/${article.slug}`} key={article.slug}>
            <div className="tip-card-cover"><TipCover article={article} compact /></div>
            <div className="tip-card-body">
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
              <div className="tip-card-meta"><span>{article.category}</span><span>{article.readingTime}</span></div>
            </div>
          </Link>
        ))}
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}
