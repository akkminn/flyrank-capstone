import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { PortfolioChat } from "@/components/portfolio-chat";

// Loaded through next/font rather than a CSS @import: Next preloads the file
// from the document head, so the text paints in Figtree the first time instead
// of swapping after the stylesheet has been fetched and parsed (the late swap
// was what pushed LCP to ~2.4 s). It also generates a size-matched fallback
// face, so the swap that remains doesn't shift the layout.
const figtree = localFont({
    src: "./fonts/figtree-latin-wght-normal.woff2",
    variable: "--font-figtree",
    weight: "100 900",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Aung Ko Ko Minn — Developer Portfolio",
    description: "Software developer portfolio",
    // Without this, browsers fall back to requesting /favicon.ico, which 404s.
    icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={figtree.variable}>
        <body className="flex min-h-screen flex-col bg-slate-950 text-white">
        {/* First stop in the tab order: keyboard and screen-reader users can jump
            past the header navigation instead of tabbing through it on every page. */}
        <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-900"
        >
            Skip to main content
        </a>
        <Navigation />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
        </main>
        <PortfolioChat />
        </body>
        </html>
    );
}
