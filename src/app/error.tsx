'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <section className="page-heading"><h1>Something didn’t load.</h1><p>Please try again.</p><button className="button" onClick={reset}>Try again</button></section>; }
