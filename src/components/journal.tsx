"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { articles } from "@/lib/data";
import { Photo } from "./ui";
import { Reveal } from "./motion";
export function BlogListing() {
  const [category, setCategory] = useState("All guides");
  const featured = articles[0];
  return (
    <>
      <div className="split" style={{ marginBottom: 60 }}>
        <Photo
          src={featured.image}
          alt={featured.title}
          className="tall-photo"
        />
        <div>
          <span className="eyebrow">FEATURED GUIDE · {featured.read}</span>
          <h2>{featured.title}</h2>
          <p>{featured.intro}</p>
          <Link href={`/blog/${featured.slug}`} className="button">
            Read cleaning guide <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <div className="tabs" role="group" aria-label="Filter cleaning articles">
        {[
          "All guides",
          ...new Set(articles.map((article) => article.category)),
        ].map((c) => (
          <button
            key={c}
            className={category === c ? "selected" : ""}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid three">
        {articles
          .filter((a) => category === "All guides" || a.category === category)
          .map((a) => (
            <Reveal className="card" key={a.slug}>
              <Link href={`/blog/${a.slug}`}>
                <Photo src={a.image} alt={a.title} />
                <div className="card-body">
                  <span className="mini-label">
                    {a.category} · {a.read}
                  </span>
                  <h3>{a.title}</h3>
                  <p>{a.intro}</p>
                  <span className="text-link">
                    Read cleaning guide <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
      </div>
      <p className="caption newsletter-note">
        Practical cleaning guides and maintenance advice from the Thrive4
        Cleaning team.
      </p>
    </>
  );
}
