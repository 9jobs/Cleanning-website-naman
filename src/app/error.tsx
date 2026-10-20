"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="container status-screen">
      <h1>Something went wrong.</h1>
      <p>An unexpected error occurred while loading this page. Please try again or return to our cleaning homepage.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
