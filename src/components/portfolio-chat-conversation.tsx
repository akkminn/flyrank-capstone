"use client";

import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type FormEvent,
    type KeyboardEvent,
} from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { ProjectsToolPart } from "@/components/projects-tool-part";
import type { PortfolioUIMessage } from "@/lib/ai/tools";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
    "What has Minn built?",
    "What's Minn working on right now?",
    "What's this site built with?",
];

const SCROLLBAR_CLASS =
    "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb:hover]:bg-white/25";

const ANNOUNCEMENT_LIFETIME_MS = 15_000;

const NETWORK_ERROR_FALLBACK = "Couldn't reach the server. Check your connection and try again.";

// The server-side route always sends a short, clean sentence as the error
// message (see toFriendlyErrorMessage in the route handler) — but a true
// network failure never reaches that code at all. If the request fails
// before getting a response (offline, DNS failure, a proxy/CDN returning an
// HTML error page instead of our stream), useChat's `error.message` ends up
// being something like a raw HTML document or a browser-internal string like
// "Failed to fetch". Never render that directly.
// What each engine's fetch() rejects with when the request never completes:
// Chrome "Failed to fetch", Safari "Load failed", Firefox "NetworkError when
// attempting to fetch resource."
const RAW_NETWORK_ERROR = /^(failed to fetch|load failed|networkerror|network request failed)/i;

function getDisplayErrorMessage(error: Error | undefined): string {
    const message = error?.message?.trim();
    if (
        !message ||
        message.length > 200 ||
        /[<>]/.test(message) ||
        RAW_NETWORK_ERROR.test(message)
    ) {
        return NETWORK_ERROR_FALLBACK;
    }
    return message;
}

function lastAssistantText(messages: PortfolioUIMessage[]): string {
    const reply = [...messages].reverse().find((message) => message.role === "assistant");
    return (
        reply?.parts
            .flatMap((part) => (part.type === "text" ? [part.text] : []))
            .join(" ")
            .trim() ?? ""
    );
}

/**
 * The chat itself: message list, suggestions and composer. It lives in its own
 * module because it is the only thing that needs the AI SDK, so the launcher in
 * `portfolio-chat.tsx` can stay tiny and load this on demand instead of shipping
 * it to every visitor on every page.
 */
export function ChatConversation({ isOpen }: { isOpen: boolean }) {
    const [input, setInput] = useState("");
    const { messages, sendMessage, status, stop, error } = useChat<PortfolioUIMessage>({
        transport: new DefaultChatTransport({ api: "/api/portfolio-chat" }),
    });

    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const actionRef = useRef<HTMLButtonElement>(null);
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

    useEffect(() => {
        if (isOpen) textareaRef.current?.focus();
    }, [isOpen]);

    const isBusy = status === "submitted" || status === "streaming";

    const [announcement, setAnnouncement] = useState("");
    const previousStatus = useRef(status);
    const stoppedByUser = useRef(false);
    const latestMessages = useRef(messages);
    useEffect(() => {
        latestMessages.current = messages;
    });
    useEffect(() => {
        const previous = previousStatus.current;
        previousStatus.current = status;
        if (status === "submitted") setAnnouncement("Assistant is thinking.");
        else if (status === "streaming") setAnnouncement("Assistant is replying.");
        else if (status === "error") setAnnouncement("");
        else if (status === "ready" && (previous === "submitted" || previous === "streaming")) {
            const text = lastAssistantText(latestMessages.current);
            setAnnouncement(
                stoppedByUser.current
                    ? "Stopped."
                    : text
                      ? `Assistant replied: ${text}`
                      : "Assistant replied."
            );
            stoppedByUser.current = false;
        }
    }, [status]);

    useEffect(() => {
        if (!announcement) return;
        const timer = setTimeout(() => setAnnouncement(""), ANNOUNCEMENT_LIFETIME_MS);
        return () => clearTimeout(timer);
    }, [announcement]);

    useLayoutEffect(() => {
        if (!isBusy && !input.trim() && document.activeElement === actionRef.current) {
            textareaRef.current?.focus();
        }
    }, [isBusy, input]);

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
        if (isBusy) {
            stoppedByUser.current = true;
            stop();
            return;
        }
        submitMessage();
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submitMessage();
        }
    }

    function retryLastMessage() {
        const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
        const text = lastUserMessage?.parts.find((part) => part.type === "text")?.text;
        if (text) sendMessage({ text });
    }

    function askSuggestion(text: string) {
        if (isBusy) return;
        sendMessage({ text });
        stickToBottomRef.current = true;
    }

    return (
        <>
            <div role="status" aria-live="polite" className="sr-only">
                {announcement}
            </div>

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                role="log"
                aria-label="Conversation"
                aria-live="off"
                className={cn("flex-1 space-y-3 overflow-y-auto px-4 py-4", SCROLLBAR_CLASS)}
            >
                {messages.length === 0 && (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-slate-300">
                            Ask me anything about Minn — or try one of these:
                        </p>
                        <div className="flex flex-col items-start gap-2">
                            {SUGGESTIONS.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => askSuggestion(suggestion)}
                                    className="rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:border-white/20 hover:bg-slate-800"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((message) => (
                    <div key={message.id} className="flex flex-col gap-2">
                        {message.parts.map((part, index) => {
                            if (part.type === "text") {
                                return (
                                    <div
                                        key={index}
                                        className={cn(
                                            "flex",
                                            message.role === "user" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word",
                                                message.role === "user"
                                                    ? "bg-white text-slate-900"
                                                    : "bg-slate-800 text-slate-100"
                                            )}
                                        >
                                            {part.text}
                                        </div>
                                    </div>
                                );
                            }

                            if (part.type === "tool-getProjects") {
                                return (
                                    <div key={index} className="flex justify-start">
                                        <div className="w-full max-w-[85%]">
                                            <ProjectsToolPart part={part} />
                                        </div>
                                    </div>
                                );
                            }

                            return null;
                        })}
                    </div>
                ))}

                {status === "submitted" && (
                    <div className="flex justify-start">
                        <div
                            aria-hidden="true"
                            className="flex items-center gap-1 rounded-2xl bg-slate-800 px-4 py-3"
                        >
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div
                        role="alert"
                        className="flex items-start gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3"
                    >
                        <HugeiconsIcon
                            icon={Alert01Icon}
                            size={18}
                            aria-hidden="true"
                            className="mt-0.5 shrink-0 text-red-300"
                        />
                        <div className="flex flex-col items-start gap-1.5">
                            <p className="text-sm leading-relaxed text-red-200">
                                {getDisplayErrorMessage(error)}
                            </p>
                            <button
                                type="button"
                                onClick={retryLastMessage}
                                className="text-xs font-semibold text-red-100 underline underline-offset-2 hover:text-white"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-white/10 p-3">
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
                        // text-base (16px) here, not text-sm: any smaller and
                        // iOS Safari auto-zooms the page in on focus, which is
                        // jarring inside a small fixed-position panel like this.
                        "max-h-24 min-h-9 flex-1 resize-none rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-base text-white wrap-break-word sm:text-sm",
                        SCROLLBAR_CLASS
                    )}
                />
                <Button
                    ref={actionRef}
                    type="submit"
                    size="sm"
                    variant={isBusy ? "secondary" : "default"}
                    disabled={!isBusy && !input.trim()}
                >
                    {isBusy ? "Stop" : "Send"}
                </Button>
            </form>
        </>
    );
}
