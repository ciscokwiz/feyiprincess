import type { Metadata } from "next";
import { PlannerApp } from "@/components/planner/PlannerApp";
import { Highlight } from "@/components/ui/Highlight";

export const metadata: Metadata = {
  title: "Planner",
  description:
    "Uchechukwu's academic planner: daily checklist, weekly timetable, notes, calendar, reminders and a progress dashboard. Saved privately in your browser.",
  alternates: { canonical: "/planner/" },
  openGraph: { url: "/planner/", title: "Academic planner | Uchechukwu Onuoma" },
};

export default function PlannerPage() {
  return (
    <>
      <section className="planner-hero" aria-labelledby="planner-title">
        <div className="container">
          <p className="eyebrow">Planner</p>
          <h1 id="planner-title">
            Study <Highlight>smart</Highlight>, <span className="display-italic">rest well.</span>
          </h1>
          <p className="lead">
            My daily study HQ for the BSc Data Science at Miva. Everything is saved privately in this browser. No account, no
            server.
          </p>
        </div>
      </section>
      <section className="planner-section" aria-label="Planner app">
        <div className="container">
          <PlannerApp />
        </div>
      </section>
    </>
  );
}
