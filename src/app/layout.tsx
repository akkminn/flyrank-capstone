import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
    title: "Aung Ko Ko Minn — Developer Portfolio",
    description: "Software developer portfolio",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className="flex min-h-screen flex-col bg-slate-950 text-white">
        <Navigation />
        <main className="flex-1">{children}</main>
        </body>
        </html>
    );
}