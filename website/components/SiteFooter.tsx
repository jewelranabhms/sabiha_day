import Link from 'next/link';
import { site } from '@/lib/site';
import { Leaf } from './ui';

export function SiteFooter() {
  return (
    <footer className="border-t border-line/60 bg-cream">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <Leaf className="mb-10" />

        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🌸</span>
              <span className="font-bn text-base font-semibold text-ink">{site.brand.journey}</span>
            </div>
            <p className="mt-3 max-w-xs font-bn text-sm leading-relaxed text-muted">
              {site.brand.tagline}
              <br />
              <span className="text-faint">Everyone can leave a little love.</span>
            </p>
          </div>

          <div>
            <p className="font-bn text-xs font-semibold uppercase tracking-[0.18em] text-sage-600">
              Navigate
            </p>
            <ul className="mt-4 space-y-2.5">
              {[...site.nav, { href: '/write', label: 'সাবিহাকে লিখুন' }].map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="font-bn text-sm text-muted transition-colors hover:text-sage-700"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-bn text-xs font-semibold uppercase tracking-[0.18em] text-sage-600">
              🔒 Privacy
            </p>
            <p className="mt-4 font-bn text-sm leading-relaxed text-muted">
              {site.footer.privacy}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {site.footer.links.map((l) => (
                <Link key={l.href} href={l.href} className="chip">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-line/70 pt-6">
          <p className="font-bn text-xs leading-relaxed text-faint">
            {site.footer.note}
            <br />
            <span className="opacity-70">
              © {new Date().getFullYear()} {site.brand.journey}. Made with care, one day at a time.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
