"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { complete, runCommand } from "@/lib/terminal-commands";

type Entry = { id: number; command: string; lines: string[] };

const WELCOME = ["Minn's portfolio terminal.", 'Type "help" to see what you can do.'];

const SCROLLBAR_CLASS =
    "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15";

/**
 * The terminal's screen: output, prompt and the shell behaviour around it
 * (history, Tab completion). It lives in its own module so the launcher in
 * `portfolio-terminal.tsx` stays tiny and loads this on demand.
 */
export function TerminalSession({
    isOpen,
    onClose,
    onNavigate,
}: {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (href: string) => void;
}) {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [input, setInput] = useState("");
    const [historyIndex, setHistoryIndex] = useState<number | null>(null);
    const nextId = useRef(0);
    const screenRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const past = entries.map((entry) => entry.command);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    useEffect(() => {
        screenRef.current?.scrollTo({ top: screenRef.current.scrollHeight });
    }, [entries]);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const command = input.trim();
        if (!command) return;

        setInput("");
        setHistoryIndex(null);

        const result = runCommand(command);
        if (result.type === "clear") {
            setEntries([]);
            return;
        }
        if (result.type === "close") {
            onClose();
            return;
        }
        setEntries((current) => [...current, { id: nextId.current++, command, lines: result.lines }]);
        if (result.type === "navigate") onNavigate(result.href);
    }

    function recall(direction: "older" | "newer") {
        if (past.length === 0) return;
        if (direction === "older") {
            const index = historyIndex === null ? past.length - 1 : Math.max(historyIndex - 1, 0);
            setHistoryIndex(index);
            setInput(past[index]);
        } else if (historyIndex !== null) {
            const index = historyIndex + 1;
            setHistoryIndex(index < past.length ? index : null);
            setInput(index < past.length ? past[index] : "");
        }
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowUp") {
            event.preventDefault();
            recall("older");
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            recall("newer");
        } else if (event.key === "Tab" && !event.shiftKey && input.trim()) {
            const completed = complete(input);
            if (completed !== input) {
                event.preventDefault();
                setInput(completed);
                setHistoryIndex(null);
            }
        } else if (event.key === "l" && event.ctrlKey) {
            event.preventDefault();
            setEntries([]);
        }
    }

    return (
        <div
            ref={screenRef}
            onClick={() => {
                if (!window.getSelection()?.toString()) inputRef.current?.focus();
            }}
            className={`flex-1 cursor-text overflow-y-auto p-4 font-mono text-base leading-relaxed text-slate-300 sm:text-sm ${SCROLLBAR_CLASS}`}
        >
            <div role="log" aria-label="Terminal output" className="space-y-3">
                <div className="whitespace-pre-wrap text-slate-300">{WELCOME.join("\n")}</div>
                {entries.map((entry) => (
                    <div key={entry.id}>
                        <p className="text-white">
                            <span aria-hidden="true" className="mr-2 text-emerald-300 select-none">
                                $
                            </span>
                            {entry.command}
                        </p>
                        <div className="mt-1 border-l border-white/10 pl-3 whitespace-pre-wrap wrap-break-word">
                            {entry.lines.join("\n")}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={submit} className="mt-3 flex items-center gap-2">
                <span aria-hidden="true" className="text-emerald-300 select-none">
                    $
                </span>
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(event) => {
                        setInput(event.target.value);
                        setHistoryIndex(null);
                    }}
                    onKeyDown={handleKeyDown}
                    aria-label="Terminal command"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="min-w-0 flex-1 bg-transparent text-white caret-emerald-300 outline-none"
                />
            </form>
        </div>
    );
}
