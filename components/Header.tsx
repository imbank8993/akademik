"use client";

import { useEffect, useState } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Informasi", href: "/#info" },
  {
    label: "Laporan",
    href: "/#laporan",
    dropdown: [
      { label: "Jurnal Pembelajaran", href: "/laporan/jurnal-pembelajaran" },
      { label: "Laporan Piket", href: "/laporan/piket" },
      { label: "Unggah Dokumen", href: "/upload" }
    ]
  },
  { label: "Aplikasi", href: "/#apps" },
];


export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileLaporanOpen, setMobileLaporanOpen] = useState(false);

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
        <a className="brand" href="/" onClick={() => setOpen(false)}>
          <img src="/logo-a.png" alt="Logo" className="logoImg" />
          <span className="brandText">Akademik MAN IC Gowa</span>
        </a>

        <nav className="navDesktop" aria-label="Primary">
          {navItems.map((item) => (
            item.dropdown ? (
              <div key={item.label} className="navItemWithDropdown">
                <a className="navLink" href={item.href}>
                  {item.label} <i className="bi bi-chevron-down" style={{ fontSize: '0.8em', marginLeft: '4px' }}></i>
                </a>
                <div className="navDropdown">
                  {item.dropdown.map(sub => (
                    <a key={sub.href} href={sub.href} className="dropdownLink">
                      {sub.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a key={item.href} className="navLink" href={item.href}>
                {item.label}
              </a>
            )
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
            <span>Akademik MAN IC Gowa</span>
          </div>
          <button className="btn small ghost" onClick={() => setOpen(false)}>
            Tutup
          </button>
        </div>

        <div className="mobileLinks">
          {navItems.map((item) => (
            item.dropdown ? (
              <div key={item.label} className="mobileNavItem">
                <div className="mobileLink mobileDropdownToggle" onClick={() => setMobileLaporanOpen(!mobileLaporanOpen)}>
                  {item.label}
                  <i className={`bi bi-chevron-${mobileLaporanOpen ? 'up' : 'down'}`} style={{ marginLeft: 'auto' }}></i>
                </div>
                {mobileLaporanOpen && (
                  <div className="mobileSubLinks">
                    {item.dropdown.map(sub => (
                      <a
                        key={sub.href}
                        className="mobileSubLink"
                        href={sub.href}
                        onClick={() => setOpen(false)}
                      >
                        {sub.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a
                key={item.href}
                className="mobileLink"
                href={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            )
          ))}
          <a className="accaLogoLinkMobile" href="https://acca.icgowa.sch.id" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <img src="/logo-acca.png" alt="ACCA Logo" className="accaLogoImgMobile" />
          </a>
        </div>
      </div>

      <style jsx>{`
        .navItemWithDropdown {
          position: relative;
          display: flex;
          align-items: center;
        }

        .navDropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          background: white;
          border: 1px solid var(--border);
          border-radius: 12px;
          min-width: 220px;
          padding: 8px;
          opacity: 0;
          visibility: hidden;
          display: flex;
          flex-direction: column;
          gap: 2px;
          box-shadow: none;
          pointer-events: none;
        }

        .navItemWithDropdown:hover .navDropdown {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
          box-shadow: var(--shadow-lg);
          pointer-events: auto;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .dropdownLink {
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-dim);
          transition: all 0.2s;
        }

        .dropdownLink:hover {
          background: var(--primary-light);
          color: var(--primary);
          padding-left: 20px;
        }

        /* Mobile Adjustments */
        .mobileNavItem {
          display: flex;
          flex-direction: column;
        }

        .mobileDropdownToggle {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .mobileSubLinks {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 12px 0 12px 20px;
          border-left: 2px solid var(--primary-light);
          margin-left: 10px;
          margin-top: 8px;
        }

        .mobileSubLink {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-dim);
        }

        .mobileSubLink:hover {
          color: var(--primary);
        }

        .mobileMenuTop .btn.small {
          padding: 6px 12px;
          font-size: 12px;
          border-radius: 8px;
          height: auto;
          line-height: 1;
        }

        .mobileMenuTop .brandMini {
          white-space: normal;
          line-height: 1.2;
          max-width: 160px;
          font-size: 14px;
        }

        .mobileMenuTop .logoImgSmall {
          flex-shrink: 0;
        }
      `}</style>
    </header>
  );
}