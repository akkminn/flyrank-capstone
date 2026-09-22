"use client";

import { useState, type FormEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, GithubIcon, LinkedinIcon, Mail01Icon, MailSend01Icon } from "@hugeicons/core-free-icons";

import { PageContainer } from "@/components/page-container";
import { AsyncActionButton } from "@/components/ui/async-action-button";
import { buildMailtoHref } from "@/lib/build-mailto-href";
import { openTerminal } from "@/lib/terminal-events";

const EMAIL = "maungkokominn@gmail.com";
const GITHUB_HANDLE = "akkminn";
const LINKEDIN_URL = "https://www.linkedin.com/in/aung-ko-ko-minn-b283b4214";

export default function ContactPage() {
    const [name, setName] = useState("");
    const [replyTo, setReplyTo] = useState("");
    const [message, setMessage] = useState("");

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        window.location.href = buildMailtoHref(name, replyTo, message);
    }

    return (
        <PageContainer className="pb-16 sm:pb-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
                {/* Left: how to reach Minn directly. */}
                <div className="space-y-6">
                    <div>
                        <div className="mb-2 flex items-center gap-2 font-mono text-xs text-slate-400">
                            <HugeiconsIcon icon={Mail01Icon} size={14} aria-hidden="true" />
                            Initiate contact
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Let&apos;s build something worth shipping.
                        </h1>
                    </div>

                    <p className="max-w-md text-sm leading-relaxed text-slate-300">
                        Have an internship, a collaboration, or a project in mind? Reach
                        out directly — I read every message myself.
                    </p>

                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
                                <HugeiconsIcon icon={Mail01Icon} size={16} aria-hidden="true" />
                            </div>
                            <div className="overflow-hidden">
                                <span className="block font-mono text-[11px] text-slate-400">
                                    Direct inbox
                                </span>
                                <a
                                    href={`mailto:${EMAIL}`}
                                    className="block truncate text-sm font-medium text-white hover:underline"
                                >
                                    {EMAIL}
                                </a>
                            </div>
                        </div>

                        <AsyncActionButton
                            idleLabel="Copy"
                            successLabel="Copied!"
                            errorLabel="Retry"
                            successHoldMs={1600}
                            variant="subtle"
                            idleIcon={<HugeiconsIcon icon={Copy01Icon} size={14} aria-hidden="true" />}
                            className="shrink-0"
                            onActivate={() => navigator.clipboard.writeText(EMAIL)}
                        />
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
                        <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />
                        Open to internships &amp; collaboration
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={`https://github.com/${GITHUB_HANDLE}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="GitHub profile"
                            aria-label="GitHub profile"
                            className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:text-white"
                        >
                            <HugeiconsIcon icon={GithubIcon} size={16} aria-hidden="true" />
                        </a>
                        <a
                            href={LINKEDIN_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="LinkedIn profile"
                            aria-label="LinkedIn profile"
                            className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:text-white"
                        >
                            <HugeiconsIcon icon={LinkedinIcon} size={16} aria-hidden="true" />
                        </a>
                    </div>

                    <p className="max-w-md text-sm text-slate-400">
                        Or ask the chat, or run{" "}
                        <button
                            type="button"
                            onClick={openTerminal}
                            className="font-mono text-slate-300 underline underline-offset-2 hover:text-white"
                        >
                            contact
                        </button>{" "}
                        in the terminal.
                    </p>
                </div>

                {/* Right: a message field that opens the visitor's own mail app,
                    pre-filled — there's no backend to deliver the message itself. */}
                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                    <h2 className="text-lg font-semibold text-white">Send a message</h2>
                    <p className="mt-1 text-xs text-slate-400">
                        Opens in your email app, filled in and ready to send.
                    </p>

                    <div className="mt-5 space-y-4">
                        <div>
                            <label htmlFor="contact-name" className="mb-1.5 block font-mono text-xs text-slate-400">
                                Your name
                            </label>
                            <input
                                id="contact-name"
                                type="text"
                                required
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Jane Doe"
                                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="contact-email" className="mb-1.5 block font-mono text-xs text-slate-400">
                                Your email
                            </label>
                            <input
                                id="contact-email"
                                type="email"
                                required
                                value={replyTo}
                                onChange={(event) => setReplyTo(event.target.value)}
                                placeholder="jane@example.com"
                                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="contact-message" className="mb-1.5 block font-mono text-xs text-slate-400">
                                Message
                            </label>
                            <textarea
                                id="contact-message"
                                rows={3}
                                required
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                placeholder="What are you working on?"
                                className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200"
                        >
                            <HugeiconsIcon icon={MailSend01Icon} size={16} aria-hidden="true" />
                            Open in email app
                        </button>
                    </div>
                </form>
            </div>
        </PageContainer>
    );
}
