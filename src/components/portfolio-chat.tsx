"use client";

import {
    Component,
    lazy,
    Suspense,
    useRef,
    useState,
    type KeyboardEvent,
    type ReactNode,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, MessageQuestionIcon } from "@hugeicons/core-free-icons";

// The conversation (and with it the AI SDK) is the heaviest thing on every
// page and most visitors never open it, so it is a separate chunk that loads
// on demand. `loadConversation` is also called on hover/focus/touch of the
// launcher to warm it up, so opening still feels instant.
const loadConversation = () =>
    import("@/components/portfolio-chat-conversation").then((module) => ({
        default: module.ChatConversation,
    }));
const ChatConversation = lazy(loadConversation);

// If the chunk can't be downloaded (offline, a stale deploy), say so inside the
// dialog instead of letting the error take down the whole page.
class ConversationLoadBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        if (!this.state.failed) return this.props.children;
        return (
            <div role="alert" className="flex-1 space-y-2 px-4 py-4 text-sm text-red-200">
                <p>Couldn&apos;t load the chat. Check your connection and try again.</p>
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

// Floating "Ask about me" widget, mounted once in the root layout so it's
// available on every route rather than scoped to a single page.
export function PortfolioChat() {
    const [isOpen, setIsOpen] = useState(false);
    // Once opened, the conversation stays mounted (just hidden), so closing the
    // dialog doesn't throw the visitor's chat history away.
    const [hasOpened, setHasOpened] = useState(false);
    const launcherRef = useRef<HTMLButtonElement>(null);

    function open() {
        setHasOpened(true);
        setIsOpen(true);
    }

    // Closing from inside the dialog (Escape, the X) would otherwise leave focus
    // on an element that just disappeared; return it to the button that opened it.
    function close() {
        setIsOpen(false);
        launcherRef.current?.focus();
    }

    function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape") {
            event.stopPropagation();
            close();
        }
    }

    return (
        <>
            <button
                ref={launcherRef}
                type="button"
                onClick={() => (isOpen ? close() : open())}
                onPointerEnter={loadConversation}
                onFocus={loadConversation}
                onTouchStart={loadConversation}
                aria-expanded={isOpen}
                aria-controls="portfolio-chat-panel"
                className="fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-lg shadow-black/30 transition-transform hover:scale-105"
            >
                <HugeiconsIcon
                    icon={isOpen ? Cancel01Icon : MessageQuestionIcon}
                    size={18}
                    aria-hidden="true"
                />
                {isOpen ? "Close" : "Ask about me"}
            </button>

            {hasOpened && (
                <div
                    id="portfolio-chat-panel"
                    role="dialog"
                    aria-label="Ask about Minn"
                    hidden={!isOpen}
                    onKeyDown={handleDialogKeyDown}
                    className="fixed right-5 bottom-20 z-50 flex h-[70dvh] max-h-140 w-95 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40"
                >
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-white">Ask about me</p>
                            <p className="text-xs text-slate-300">
                                Ask about Minn&apos;s background, skills, or this site.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={close}
                            aria-label="Close chat"
                            className="rounded-md p-1 text-slate-300 transition-colors hover:text-white"
                        >
                            <HugeiconsIcon icon={Cancel01Icon} size={18} aria-hidden="true" />
                        </button>
                    </div>

                    <ConversationLoadBoundary>
                        <Suspense
                            fallback={
                                <p role="status" className="flex-1 px-4 py-4 text-sm text-slate-300">
                                    Loading chat…
                                </p>
                            }
                        >
                            <ChatConversation isOpen={isOpen} />
                        </Suspense>
                    </ConversationLoadBoundary>
                </div>
            )}
        </>
    );
}
