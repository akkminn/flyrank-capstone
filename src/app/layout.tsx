import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { PortfolioChat } from "@/components/portfolio-chat";
import { PortfolioTerminal } from "@/components/portfolio-terminal";

const figtree = localFont({
    src: "./fonts/figtree-latin-wght-normal.woff2",
    variable: "--font-figtree",
    weight: "100 900",
    display: "swap",
});

const syne = localFont({
    src: "./fonts/syne-latin-wght-normal.woff2",
    variable: "--font-syne",
    weight: "400 800",
    display: "swap",
});

const jetbrainsMono = localFont({
    src: "./fonts/jetbrains-mono-latin-wght-normal.woff2",
    variable: "--font-jetbrains-mono",
    weight: "100 800",
    display: "swap",
    fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

export const metadata: Metadata = {
    title: "Aung Ko Ko Minn — Developer Portfolio",
    description: "Software developer portfolio",
    icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${figtree.variable} ${syne.variable} ${jetbrainsMono.variable}`}>
        <body className="flex min-h-screen flex-col bg-slate-950 text-white">
        <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-900"
        >
            Skip to main content
        </a>
        <Navigation />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
        </main>
        <div className="fixed right-5 bottom-5 z-50 flex items-center gap-3">
            <PortfolioTerminal />
            <PortfolioChat />
        </div>
        </body>
        </html>
    );
}
