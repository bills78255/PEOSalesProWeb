import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="brand-mark">PSP</span>
        <span>
          <strong>PEO Sales Pro</strong>
          <small>Sales enablement platform</small>
        </span>
      </Link>
      <nav className="site-nav">
        <Link href="/opportunities">Opportunities</Link>
        <Link href="/login">Login</Link>
        <Link href="/signup" className="button-link">
          Get Started
        </Link>
      </nav>
    </header>
  );
}
