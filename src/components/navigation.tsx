"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/experience", label: "Experience" },
    { href: "/projects", label: "Projects" },
    { href: "/contact", label: "Contact" },
];

export function Navigation() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                <Link
                    href="/"
                    className="text-sm font-semibold tracking-tight text-white"
                    onClick={() => setIsOpen(false)}
                >
                    Aung Ko Ko Minn
                </Link>

                <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "text-sm transition-colors hover:text-white",
                                    isActive ? "text-white" : "text-slate-400"
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md p-2 text-slate-300 transition-colors hover:text-white md:hidden"
                    aria-expanded={isOpen}
                    aria-controls="mobile-nav"
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    onClick={() => setIsOpen((open) => !open)}
                >
                    <HugeiconsIcon icon={isOpen ? Cancel01Icon : Menu01Icon} size={22} />
                </button>
            </div>

            {isOpen && (
                <nav
                    id="mobile-nav"
                    aria-label="Primary"
                    className="border-t border-white/10 px-6 py-4 md:hidden"
                >
                    <ul className="flex flex-col gap-4">
                        {NAV_LINKS.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        aria-current={isActive ? "page" : undefined}
                                        className={cn(
                                            "block text-sm transition-colors hover:text-white",
                                            isActive ? "text-white" : "text-slate-400"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            )}
        </header>
    );
}
