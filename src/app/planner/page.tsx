import type { Metadata } from 'next';
import { Planner } from '@/components/planner';
export const metadata: Metadata = { title: 'Planner' };
export default function PlannerPage() { return <><section className="page-heading"><span className="meta">THE NEXT STEP / 04</span><h1>A little more order.</h1><p>Put it down. Work through it. Make space for what’s next.</p></section><Planner /></>; }
