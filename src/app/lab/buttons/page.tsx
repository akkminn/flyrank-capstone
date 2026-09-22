"use client";

import { useState } from "react";

import { PageContainer } from "@/components/page-container";
import { AsyncActionButton } from "@/components/ui/async-action-button";
import { cn } from "@/lib/utils";

type ForcedOutcome = "random" | "success" | "error";

const OUTCOMES: { value: ForcedOutcome; label: string }[] = [
    { value: "random", label: "Random (20% fail)" },
    { value: "success", label: "Force success" },
    { value: "error", label: "Force error" },
];

export default function ButtonLabPage() {
    const [outcome, setOutcome] = useState<ForcedOutcome>("random");
    const [disabled, setDisabled] = useState(false);
    const [simulateReducedMotion, setSimulateReducedMotion] = useState(false);

    async function runSimulatedAction() {
        const delay = 700 + Math.random() * 900;
        await new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                const shouldFail =
                    outcome === "error" || (outcome === "random" && Math.random() < 0.2);
                if (shouldFail) reject(new Error("Simulated failure"));
                else resolve();
            }, delay);
        });
    }

    return (
        <PageContainer>
            <h1 className="text-3xl font-bold tracking-tight">Buttons with a Brain</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
                One button component, one state machine: idle → loading →
                success or error, and back. Every change below is a
                transition, not a swap — use the controls to force each
                outcome on demand.
            </p>

            <div className="mt-10 flex flex-col gap-4">
                <div>
                    <p className="mb-2 text-sm font-medium text-slate-400">
                        Force next result
                    </p>
                    <div role="group" aria-label="Force next result" className="flex flex-wrap gap-2">
                        {OUTCOMES.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                aria-pressed={outcome === item.value}
                                onClick={() => setOutcome(item.value)}
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                                    outcome === item.value
                                        ? "border-white/20 bg-white/10 text-white"
                                        : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                        <input
                            type="checkbox"
                            checked={disabled}
                            onChange={(event) => setDisabled(event.target.checked)}
                            className="size-4 rounded border-white/20 bg-transparent"
                        />
                        Disabled state
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                        <input
                            type="checkbox"
                            checked={simulateReducedMotion}
                            onChange={(event) => setSimulateReducedMotion(event.target.checked)}
                            className="size-4 rounded border-white/20 bg-transparent"
                        />
                        Simulate prefers-reduced-motion
                    </label>
                </div>
            </div>

            <div
                data-force-reduced-motion={simulateReducedMotion || undefined}
                className="mt-10 flex flex-wrap items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-8"
            >
                <AsyncActionButton
                    idleLabel="Send"
                    successLabel="Sent"
                    errorLabel="Retry"
                    onActivate={runSimulatedAction}
                    disabled={disabled}
                />
                <AsyncActionButton
                    idleLabel="Generate"
                    successLabel="Generated"
                    errorLabel="Retry"
                    onActivate={runSimulatedAction}
                    disabled={disabled}
                />
            </div>

            <section className="mt-10 max-w-2xl space-y-3 text-sm leading-relaxed text-slate-400">
                <h2 className="text-base font-semibold text-white">
                    Duration &amp; easing choices
                </h2>
                <p>
                    Hover and press use 150ms / 80ms ease-out — short enough
                    to feel immediate, since those are direct reactions to
                    something the user is doing right now. The state content
                    (label ↔ spinner ↔ check ↔ retry) cross-fades over 200ms
                    with a small vertical drift, and the spinner is staggered
                    75ms behind the label leaving so the two never visually
                    collide mid-swap. Everything settles in with ease-out,
                    since every one of these transitions is arriving at a new
                    resting state, not accelerating away from one.
                </p>
                <p>
                    Success holds for 1.4 seconds — long enough to register as
                    a deliberate confirmation, short enough to not block the
                    next action. The error shake is the one intentionally
                    &ldquo;unsettled&rdquo; motion (ease-in-out, oscillating)
                    specifically so it reads as distinct from every calmer
                    transition around it — and it&apos;s also the first thing
                    dropped under reduced motion, since the color change, icon
                    swap, and &ldquo;Retry&rdquo; label already carry the same
                    information without it.
                </p>
                <p>
                    Only <code className="text-slate-300">transform</code>,{" "}
                    <code className="text-slate-300">opacity</code>, and{" "}
                    <code className="text-slate-300">background-color</code>{" "}
                    ever animate — nothing here resizes the button or reflows
                    the page, so a spam-click or a hover mid-transition just
                    retargets the same transition instead of snapping or
                    breaking it.
                </p>
            </section>
        </PageContainer>
    );
}
