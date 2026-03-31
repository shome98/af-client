'use client';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12">
      <section>
        <Hero />
      </section>
      <section>
        <Features />
      </section>
      <section>
        <Pricing />
      </section>
    </div>
  );
}
