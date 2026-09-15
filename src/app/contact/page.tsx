"use client";

import { PageContainer } from "@/components/page-container";
import { AsyncActionButton } from "@/components/ui/async-action-button";

const EMAIL = "maungkokominn@gmail.com";

export default function ContactPage() {
    return (
        <PageContainer>
            <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
                Reach out for internships, collaboration, or anything else — email is
                the fastest way to get to me.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                    href={`mailto:${EMAIL}`}
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/10"
                >
                    {EMAIL}
                </a>
                {/* Real action, real outcome — this is the FE-AA1 button:
                    navigator.clipboard.writeText actually resolves or
                    rejects (permission denied, insecure context, ...),
                    unlike the simulated calls on the /lab/buttons demo. */}
                <AsyncActionButton
                    idleLabel="Copy email"
                    successLabel="Copied!"
                    errorLabel="Retry"
                    successHoldMs={1600}
                    className="w-36 shrink-0"
                    onActivate={() => navigator.clipboard.writeText(EMAIL)}
                />
                <a
                    href="https://github.com/akkminn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/10"
                >
                    github.com/akkminn
                </a>
            </div>

            <p className="mt-8 max-w-2xl text-sm text-slate-400">
                Or ask the &ldquo;Ask about me&rdquo; chat in the corner of this
                page — it can point you to the right place for most questions.
            </p>
        </PageContainer>
    );
}
