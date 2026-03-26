import type {Metadata} from "next";
import {Montserrat} from "next/font/google";
import "./globals.css";
import React from "react";
import {cn} from "@/lib/utils";

const montserrat = Montserrat({subsets: ['latin'], variable: '--font-sans'});

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
            className={cn("h-full", "antialiased", "font-sans", montserrat.variable, "dark")}
        >
        <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}
