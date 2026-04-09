import { APP } from '@/constants/landing.constant';

const Footer = () => {
  return (
    <footer className="px-6 py-8 text-center text-xs">
      <p>
        © {new Date().getFullYear()} {APP.name} · {APP.shortDesc}
      </p>
    </footer>
  );
};

export default Footer;
