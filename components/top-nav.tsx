import Link from "next/link";

export function TopNav() {
  return (
    <header className="topNav">
      <div className="container shell">
        <div>
          <p className="eyebrow">Singapore Primary 1</p>
          <h1>P1 School Selector</h1>
        </div>
        <nav aria-label="Primary" className="navLinks">
          <Link href="/">Home</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/sources">Sources</Link>
          <Link href="/methodology">Methodology</Link>
        </nav>
      </div>
    </header>
  );
}
