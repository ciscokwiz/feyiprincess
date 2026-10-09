'use client';
import Link from 'next/link';
import { profile } from '@/lib/content';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
const routes = [['/', 'Home'], ['/about', 'About'], ['/projects', 'Projects'], ['/planner', 'Planner'], ['/contact', 'Contact']];
export function Navigation() {
 const path = usePathname(); const [open, setOpen] = useState(false);
 return <header className="site-header"><Link href="/" className="wordmark" aria-label={`${profile.name} home`}>{profile.name.split(' ').map(part => part[0]).join('')}<span> / </span>PORTFOLIO</Link><button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="main-nav">{open ? 'Close −' : 'Menu +'}</button><nav id="main-nav" className={open ? 'nav open' : 'nav'} aria-label="Main navigation">{routes.map(([href, label]) => <Link key={href} href={href} aria-current={path === href ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link>)}</nav></header>;
}
