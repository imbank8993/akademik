"use client";

import { useEffect, useState } from "react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Informasi", href: "#info" },
  { label: "Laporan", href: "#reports" },
  { label: "Aplikasi", href: "#apps" },
  { label: "Testimoni", href: "#testimonials" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // prevent body scroll when menu open (mobile)
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="container headerInner">
        <a className="brand" href="#home" onClick={() => setOpen(false)}>
          <img src="/logo-a.png" alt="Logo" className="logoImg" />
          <span className="brandText">Akademik MAN IC Gowa</span>
        </a>

        <nav className="navDesktop" aria-label="Primary">
          {navItems.map((item) => (
            <a key={item.href} className="navLink" href={item.href}>
              {item.label}
            </a>
          ))}
          <a className="accaLogoLink" href="https://acca.icgowa.sch.id" target="_blank" rel="noopener noreferrer">
            <img src="/logo-acca.png" alt="ACCA Logo" className="accaLogoImg" title="Ke Laman ACCA" />
          </a>
        </nav>

        <button
          className="burger"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu overlay */}
      <div className={`mobileOverlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />

      <div className={`mobileMenu ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="mobileMenuTop">
          <div className="brandMini">
            <img src="/logo-a.png" alt="Logo" className="logoImgSmall" />
            <span>Akademik IC Gowa</span>
          </div>
          <button className="btn small ghost" onClick={() => setOpen(false)}>
            Tutup
          </button>
        </div>

        <div className="mobileLinks">
          {navItems.map((item) => (
            <a
              key={item.href}
              className="mobileLink"
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a className="accaLogoLinkMobile" href="https://acca.icgowa.sch.id" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <img src="/logo-acca.png" alt="ACCA Logo" className="accaLogoImgMobile" />
          </a>
        </div>
      </div>
    </header>
  );
}