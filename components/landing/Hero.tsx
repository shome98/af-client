import { LANDING } from '@/constants/landing.constant';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';

const Hero = () => {
  return (
    <>
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink max-w-3xl leading-tight whitespace-pre-line">
          {LANDING.hero.headline}
        </h1>
        <p className="text-lg text-ink-muted max-w-xl">
          {LANDING.hero.subheadline}
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href={'/register'}>
            <Button>{LANDING.hero.ctaPrimary}</Button>
          </Link>
          <a href="#features">
            <Button>{LANDING.hero.ctaSecondary}</Button>
          </a>
        </div>
      </section>
    </>
  );
};

export default Hero;
