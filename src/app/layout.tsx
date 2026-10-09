import { Arrow } from '@/components/arrow';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import './globals.css';
import { profile } from '@/lib/content';
const display = localFont({ src: '../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2', variable: '--font-display' });
const sans = localFont({ src: [
 { path: '../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2', weight: '400' },
 { path: '../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff2', weight: '500' },
 { path: '../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2', weight: '600' }
], variable: '--font-body' });
const mono = localFont({ src: '../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2', variable: '--font-mono' });
export const metadata: Metadata = { title: { default: `${profile.name} — Work & next steps`, template: `%s — ${profile.name}` }, description: 'A personal portfolio and a practical space to plan the next step.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
 return <html lang="en"><body className={`${display.variable} ${sans.variable} ${mono.variable}`}><a href="#main" className="skip-link">Skip to content</a><div className="shell"><Navigation /><main id="main">{children}</main><footer><span>{profile.name.toUpperCase()} <span className="muted">/ WORK & NEXT STEPS</span></span><Link href="/contact">Start a conversation <Arrow /></Link><span className="meta">BUILT WITH INTENTION.</span></footer></div></body></html>;
}
