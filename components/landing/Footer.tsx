import Link from 'next/link';

import { APP } from '@/constants/landing.constant';
import { LEGAL_FOOTER_LINKS } from '@/constants/legal.constant';

const Footer = () => {
  return (
    <footer className="px-6 py-8 text-center text-xs">
      <p>
        © {new Date().getFullYear()} {APP.name} · {APP.shortDesc}
      </p>
      <div className="mt-2 flex items-center justify-center gap-4">
        {LEGAL_FOOTER_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
