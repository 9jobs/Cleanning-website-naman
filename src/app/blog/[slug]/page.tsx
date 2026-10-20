import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles } from "@/lib/data";
import { Photo } from "@/components/ui";
import {
  ArticleCompletion,
  RelatedGuides,
  CompletionCTA,
} from "@/components/completion-sections";
export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = articles.find((a) => a.slug === slug);
  return a
    ? {
        title: a.title,
        description: a.intro,
        alternates: { canonical: `/blog/${slug}` },
      }
    : {};
}
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = articles.find((a) => a.slug === slug);
  if (!a) notFound();
  return (
    <div className="inner-site inner-site--article">
      <article className="container section blog-article prose">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/blog">Guides</Link>
          <span>/</span>
          {a.category}
        </div>
        <div className="article-meta">
          CLEANING GUIDES & TIPS · {a.category.toUpperCase()} · {a.read}
        </div>
        <h1>{a.title}</h1>
        <p>{a.intro}</p>
        <Photo src={a.image} alt={a.title} priority />
        <ArticleCompletion article={a} />
      </article>
      <RelatedGuides exclude={a.slug} />
      <CompletionCTA />
    </div>
  );
}
