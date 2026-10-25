import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container container--narrow">
        <p className="eyebrow">404</p>
        <h1>Oops, this page wandered off.</h1>
        <p className="lead">Probably dancing somewhere. Let&rsquo;s get you back on track.</p>
        <Link href="/" className="btn">
          Back home
        </Link>
      </div>
    </section>
  );
}
