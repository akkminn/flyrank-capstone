"use client";

import {
    Component,
    lazy,
    Suspense,
    useEffect,
    useRef,
    useState,
    type KeyboardEvent,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, ComputerTerminal01Icon } from "@hugeicons/core-free-icons";

import { OPEN_TERMINAL_EVENT } from "@/lib/terminal-events";

// Like the chat, the terminal's screen is a separate chunk loaded on demand;
// the launcher warms it on hover/focus/touch so opening still feels instant.
const loadSession = () =>
    import("@/components/terminal-session").then((module) => ({
        default: module.TerminalSession,
    }));
const TerminalSession = lazy(loadSession);

const FOCUSABLE = "button, [href], input, [tabindex]:not([tabindex='-1'])";

class SessionLoadBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        if (!this.state.failed) return this.props.children;
        return (
            <div role="alert" className="flex-1 space-y-2 p-4 font-mono text-sm text-red-200">
                <p>Couldn&apos;t load the terminal. Check your connection and try again.</p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="text-xs font-semibold text-red-100 underline underline-offset-2 hover:text-white"
                >
                    Reload the page
                </button>
            </div>
        );
    }
}

export function PortfolioTerminal() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const launcherRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const returnFocusRef = useRef<HTMLElement | null>(null);

    function open() {
        returnFocusRef.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setHasOpened(true);
        setIsOpen(true);
    }

    function close() {
        setIsOpen(false);
        (returnFocusRef.current?.isConnected ? returnFocusRef.current : launcherRef.current)?.focus();
    }

    useEffect(() => {
        const handleOpen = () => open();
        window.addEventListener(OPEN_TERMINAL_EVENT, handleOpen);
        return () => window.removeEventListener(OPEN_TERMINAL_EVENT, handleOpen);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [isOpen]);

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape") {
            event.stopPropagation();
            close();
            return;
        }
        if (event.key !== "Tab" || event.defaultPrevented) return;

        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    return (
        <>
            <button
                ref={launcherRef}
                type="button"
                onClick={open}
                onPointerEnter={loadSession}
                onFocus={loadSession}
                onTouchStart={loadSession}
                aria-label="Open terminal"
                aria-haspopup="dialog"
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-emerald-300 shadow-lg shadow-black/30 transition-transform hover:scale-105"
            >
                <HugeiconsIcon icon={ComputerTerminal01Icon} size={20} aria-hidden="true" />
            </button>

            {hasOpened && (
                <div
                    hidden={!isOpen}
                    onKeyDown={handleKeyDown}
                    onMouseDown={(event) => {
                        if (event.target !== event.currentTarget) return;
                        // Preserves the hand-back to the opener in close():
                        // without this, mousedown on a non-focusable backdrop
                        // shifts the browser's own focus to <body> first.
                        event.preventDefault();
                        close();
                    }}
                    className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-3 sm:items-center sm:p-6"
                >
                    <div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Terminal"
                        className="flex h-[70dvh] max-h-140 w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/60"
                    >
                        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-2.5">
                            <div className="flex items-center gap-3">
                                <div aria-hidden="true" className="flex gap-1.5">
                                    <span className="size-3 rounded-full bg-rose-400/80" />
                                    <span className="size-3 rounded-full bg-amber-400/80" />
                                    <span className="size-3 rounded-full bg-emerald-400/80" />
                                </div>
                                <p className="font-mono text-xs text-slate-300">minn@portfolio: ~</p>
                            </div>
                            <button
                                type="button"
                                onClick={close}
                                aria-label="Close terminal"
                                className="rounded-md p-1 text-slate-300 transition-colors hover:text-white"
                            >
                                <HugeiconsIcon icon={Cancel01Icon} size={18} aria-hidden="true" />
                            </button>
                        </div>

                        <SessionLoadBoundary>
                            <Suspense
                                fallback={
                                    <p role="status" className="flex-1 p-4 font-mono text-sm text-slate-300">
                                        Starting terminal…
                                    </p>
                                }
                            >
                                <TerminalSession
                                    isOpen={isOpen}
                                    onClose={close}
                                    onNavigate={(href) => {
                                        router.push(href);
                                        close();
                                    }}
                                />
                            </Suspense>
                        </SessionLoadBoundary>
                    </div>
                </div>
            )}
        </>
    );
}
