import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { notFound } from "next/navigation";
import { GoalMarkIcon } from "@/components/goal-mark-icon";
import { PageBackLink } from "@/components/page-back-link";
import { TipCover, TipDiagram } from "@/components/tip-visuals";
import { getTipArticle, tipArticles } from "@/lib/tips";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return tipArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getTipArticle(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: `/tips/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url: `/tips/${article.slug}`,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.description },
  };
}

export default async function TipArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getTipArticle(slug);
  if (!article) notFound();

  const related = tipArticles.filter((item) => item.slug !== article.slug).slice(0, 3);
  const formattedDate = new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${article.publishedAt}T00:00:00Z`));
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: `${appUrl}/tips/${article.slug}`,
    author: { "@type": "Organization", name: "SMART Goal" },
    publisher: { "@type": "Organization", name: "SMART Goal" },
    keywords: article.keywords.join(", "),
  };

  return (
    <main className="tip-article-page has-tip-banner app-shell">
      <aside className="guest-plan-banner tip-build-banner">
        <div>
          <GoalMarkIcon size={22} />
          <span><strong>Build your SMART goal and action plan in minutes</strong><small>Let AI clarify your goal and turn it into practical, editable steps.</small></span>
        </div>
        <Link className="button button-primary" href="/">Build my SMART goal</Link>
      </aside>
      <div className="page-back-row page-shell"><PageBackLink href="/tips">All tips</PageBackLink></div>
      <article>
        <div className="tip-article-header page-shell">
          <div className="tip-article-meta"><span>{article.category}</span><span>{article.readingTime}</span><time dateTime={article.publishedAt}>{formattedDate}</time></div>
          <h1>{article.title}</h1>
          <p className="tip-article-deck">{article.excerpt}</p>
          <div className="tip-article-cover"><TipCover article={article} /></div>
        </div>

        <div className="tip-article-body">
          {article.sections.map((section) => (
            <section id={section.id} key={section.id}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.diagram && <TipDiagram kind={section.diagram} />}
              {section.steps && (
                <ol className="tip-steps">
                  {section.steps.map((step, index) => (
                    <li key={step.title}>
                      <span className="tip-step-number">{String(index + 1).padStart(2, "0")}</span>
                      <div><h3>{step.title}</h3><p>{step.body}</p></div>
                    </li>
                  ))}
                </ol>
              )}
              {section.bullets && (
                <ul className="tip-bullets">
                  {section.bullets.map((bullet) => <li key={bullet}><Check size={16} aria-hidden="true" /><span>{bullet}</span></li>)}
                </ul>
              )}
              {section.template && (
                <div className="tip-template"><span>Use this template</span><p>{section.template}</p></div>
              )}
            </section>
          ))}

          {article.sources.length > 0 && (
            <section className="tip-sources" aria-labelledby="tip-sources-heading">
              <h2 id="tip-sources-heading">Sources and further reading</h2>
              <ul>
                {article.sources.map((source) => (
                  <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label}</a></li>
                ))}
              </ul>
            </section>
          )}

        </div>
      </article>

      <section className="tip-related page-shell" aria-labelledby="related-heading">
        <div className="tip-related-head"><h2 id="related-heading">Keep reading</h2><Link href="/tips">View all tips</Link></div>
        <div className="tip-related-grid">
          {related.map((item) => (
            <Link href={`/tips/${item.slug}`} key={item.slug}>
              <span>{item.category} · {item.readingTime}</span>
              <h3>{item.title}</h3>
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}
