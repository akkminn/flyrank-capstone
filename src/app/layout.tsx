import type { Metadata } from "next";
import "./globals.css";

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
        <body>{children}</body>
        </html>
    );
}