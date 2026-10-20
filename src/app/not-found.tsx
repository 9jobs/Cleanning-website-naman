import { Button } from "@/components/ui";
export default function NotFound() {
  return (
    <section className="container status-screen">
      <span className="eyebrow">404 · PAGE NOT FOUND</span>
      <h1>Looking for a clean start?</h1>
      <p>The page you are looking for cannot be found. Explore our cleaning services or return to the homepage.</p>
      <Button href="/">Return to Homepage</Button>
    </section>
  );
}
