"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, MessageQuestionIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The browser's default scrollbar is light-colored and clashes with the
// widget's dark theme, so both scrollable areas (message list, textarea)
// get a slim custom one instead — Firefox via `scrollbar-*`, WebKit/Chromium
// via the `[&::-webkit-scrollbar*]` arbitrary variants.
const SCROLLBAR_CLASS =
    "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb:hover]:bg-white/25";

// Floating "Ask about me" widget, mounted once in the root layout so it's
// available on every route rather than scoped to a single page.
export function PortfolioChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const { messages, sendMessage, status, stop, error } = useChat({
        transport: new DefaultChatTransport({ api: "/api/portfolio-chat" }),
    });

    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    // Only auto-scroll to new content while the user is already near the
    // bottom, so scrolling up to reread earlier messages isn't yanked away.
    const stickToBottomRef = useRef(true);

    function handleScroll() {
        const el = scrollRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        stickToBottomRef.current = distanceFromBottom < 80;
    }

    useEffect(() => {
        if (isOpen && stickToBottomRef.current) {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
        }
    }, [messages, isOpen]);

    const isBusy = status === "submitted" || status === "streaming";

    function submitMessage() {
        const text = input.trim();
        if (!text || isBusy) return;
        sendMessage({ text });
        setInput("");
        stickToBottomRef.current = true;
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        submitMessage();
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submitMessage();
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-controls="portfolio-chat-panel"
                className="fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-lg shadow-black/30 transition-transform hover:scale-105"
            >
                <HugeiconsIcon icon={isOpen ? Cancel01Icon : MessageQuestionIcon} size={18} />
                {isOpen ? "Close" : "Ask about me"}
            </button>

            {isOpen && (
                <div
                    id="portfolio-chat-panel"
                    role="dialog"
                    aria-label="Ask about Minn"
                    className="fixed right-5 bottom-20 z-50 flex h-[70vh] max-h-140 w-95 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40"
                >
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-white">Ask about me</p>
                            <p className="text-xs text-slate-400">
                                Ask about Minn&apos;s background, skills, or this site.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat"
                            className="rounded-md p-1 text-slate-400 transition-colors hover:text-white"
                        >
                            <HugeiconsIcon icon={Cancel01Icon} size={18} />
                        </button>
                    </div>

                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        aria-live="polite"
                        className={cn(
                            "flex-1 space-y-3 overflow-y-auto px-4 py-4",
                            SCROLLBAR_CLASS
                        )}
                    >
                        {messages.length === 0 && (
                            <p className="text-sm text-slate-400">
                                Ask something like &ldquo;What does Minn work on?&rdquo; or
                                &ldquo;What&apos;s this site built with?&rdquo;
                            </p>
                        )}

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex",
                                    message.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words",
                                        message.role === "user"
                                            ? "bg-white text-slate-900"
                                            : "bg-slate-800 text-slate-100"
                                    )}
                                >
                                    {message.parts.map((part, index) =>
                                        part.type === "text" ? (
                                            <span key={index}>{part.text}</span>
                                        ) : null
                                    )}
                                </div>
                            </div>
                        ))}

                        {status === "submitted" && (
                            <div className="flex justify-start">
                                <div
                                    className="flex items-center gap-1 rounded-2xl bg-slate-800 px-4 py-3"
                                    aria-label="Assistant is thinking"
                                >
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                                </div>
                            </div>
                        )}

                        {status === "error" && (
                            <p role="alert" className="text-sm text-red-400">
                                Something went wrong{error?.message ? `: ${error.message}` : "."}{" "}
                                Please try again.
                            </p>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="flex items-end gap-2 border-t border-white/10 p-3"
                    >
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(event) => {
                                setInput(event.target.value);
                                const el = event.target;
                                el.style.height = "auto";
                                el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
                            }}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            placeholder="Ask a question…"
                            aria-label="Ask about Minn"
                            className={cn(
                                "max-h-24 min-h-9 flex-1 resize-none rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-sm text-white break-words placeholder:text-slate-500 focus:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                                SCROLLBAR_CLASS
                            )}
                        />
                        {isBusy ? (
                            <Button type="button" size="sm" variant="secondary" onClick={() => stop()}>
                                Stop
                            </Button>
                        ) : (
                            <Button type="submit" size="sm" disabled={!input.trim()}>
                                Send
                            </Button>
                        )}
                    </form>
                </div>
            )}
        </>
    );
}
