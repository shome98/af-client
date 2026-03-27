import type {Metadata} from "next";
import {Montserrat} from "next/font/google";
import "./globals.css";
import React from "react";
import {cn} from "@/lib/utils";
import NavBar from "@/components/Navbar";

const montserrat = Montserrat({subsets: ['latin'], variable: '--font-sans'});
const themeScript = `(() => {
  const storageKey = 'af-theme';
  const storedTheme = window.localStorage.getItem(storageKey);
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : systemTheme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
})();`;

export const metadata: Metadata = {
    title: "Api Hub",
    description: "get rest apis in minutes!!!😊",
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
            className={cn("h-full", "antialiased", "font-sans", montserrat.variable)}
        >
        <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{__html: themeScript}}/>
        <NavBar/>
        <main className="flex-1">{children}</main>
        </body>
        </html>
    );
}
