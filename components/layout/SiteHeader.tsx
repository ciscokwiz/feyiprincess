"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import { focusableWithin, setPageLocked } from "@/lib/dom";
import { isActivePath, NAV_LINKS } from "@/lib/nav";

const MOBILE_QUERY = "(max-width: 860px)";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  // Close the menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Header shadow once the page scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While open: lock page scroll, trap focus inside the header, close on Escape.
  useEffect(() => {
    setPageLocked(open);
    if (!open) return;

    const firstLink = navRef.current?.querySelector<HTMLElement>("a");
    firstLink?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
        return;
      }
      if (event.key !== "Tab" || !headerRef.current) return;
      const focusable = focusableWithin(headerRef.current);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const media = window.matchMedia(MOBILE_QUERY);
    const onMediaChange = () => {
      if (!media.matches) close(false);
    };

    document.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onMediaChange);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onMediaChange);
      setPageLocked(false);
    };
  }, [open, close]);

  return (
    <header ref={headerRef} className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="container site-header__inner">
        <Link href="/" className="brand">
          <span className="brand__mark" aria-hidden="true">
            {profile.monogram}
          </span>
          <span className="brand__name">
            Uchechukwu<span>.</span>
          </span>
          <span className="visually-hidden">{` ${profile.fullName.split(" ").slice(1).join(" ")}, home`}</span>
        </Link>

        <button
          ref={toggleRef}
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle__bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          {open ? "Close" : "Menu"}
        </button>

        <nav ref={navRef} id="site-nav" className={`site-nav${open ? " is-open" : ""}`} aria-label="Main">
          <ul className="site-nav__list">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="site-nav__item">
                <Link
                  href={link.href}
                  className="site-nav__link"
                  aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
