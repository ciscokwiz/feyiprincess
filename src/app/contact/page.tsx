import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact-form';
export const metadata: Metadata = { title: 'Contact' };
export default function Contact() { return <><section className="page-heading"><span className="meta">THE CONVERSATION / 05</span><h1>Let’s compare notes.</h1><p>A question, a project, or a useful idea. Start with a few words.</p></section><div className="contact-grid"><aside><span className="meta blue">A NOTE BEFORE YOU WRITE</span><h2>A space for<br />a conversation.</h2><p>This form demonstrates validation. Delivery hasn’t been connected yet.</p><p className="muted">Add your preferred contact details and a delivery integration when you’re ready to publish your personal information.</p></aside><ContactForm /></div></>; }
