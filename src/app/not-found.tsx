import { Arrow } from '@/components/arrow';
import Link from 'next/link';
export default function NotFound() { return <section className="page-heading"><span className="meta">404 / A WRONG TURN</span><h1>Nothing at this address.</h1><p><Link className="text-link" href="/">Back to the portfolio <Arrow /></Link></p></section>; }
