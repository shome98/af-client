import type { Metadata } from 'next';
import React from 'react';

import NavBar from '@/components/Navbar';
import Providers from '@/components/providers';

import './globals.css';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Api Hub',
  description: 'Spin up rest api in minutes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full font-sans antialiased"
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers initialUser={null}>
          <div className="relative flex min-h-screen flex-col">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(32,129,226,0.11),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.10),transparent_26%)]" />
            <NavBar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
