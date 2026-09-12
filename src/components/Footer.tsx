import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer wrap">
      <div className="footer-links">
        <Link href="/eat-drink">Eat &amp; drink</Link>
        <Link href="/stay">Stay</Link>
        <Link href="/things-to-do">Things to do</Link>
        <Link href="/trades">Trades &amp; services</Link>
        <Link href="/shops">Shops</Link>
      </div>
      <div>Discover Wiltshire — the only list you&apos;ll need</div>
    </footer>
  );
}
