"use client";

import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
    canRender3D,
    readAnimationPref,
    REDUCED_MOTION_QUERY,
    whenIdle,
    writeAnimationPref,
} from "@/lib/hero-3d-support";
import { cn } from "@/lib/utils";

import { HeroFallback } from "./hero-fallback";

const HeroScene = lazy(() => import("./hero-scene"));

class SceneErrorBoundary extends Component<
    { onError: () => void; children: ReactNode },
    { failed: boolean }
> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    // Covers both a failed chunk download and WebGL being unavailable.
    componentDidCatch() {
        this.props.onError();
    }

    render() {
        return this.state.failed ? null : this.props.children;
    }
}

/**
 * Full-height hero section: the falling-tiles scene sits behind `children`
 * (the hero copy), which is always rendered so the page never waits on 3D.
 *
 * Two separate questions decide whether the scene runs:
 *   - `capable`: can this device / visitor take it at all (reduced motion,
 *     data-saver, weak hardware)? If not, there is no scene and no switch.
 *   - `enabled`: does the visitor want it? Off means the scene is torn down
 *     completely (WebGL context and GPU memory released, nothing rendering)
 *     and the 3D code is never downloaded.
 */
export function HeroBackdrop({ children }: { children: ReactNode }) {
    // `null` is what the server and the first client render show, so hydration
    // always matches; the effect below then fills these in.
    const [capable, setCapable] = useState<boolean | null>(null);
    const [enabled, setEnabled] = useState(true);
    const [idle, setIdle] = useState(false);
    const [failed, setFailed] = useState(false);
    const [ready, setReady] = useState(false);
    const [inView, setInView] = useState(true);
    const section = useRef<HTMLElement>(null);

    useEffect(() => {
        let cancelIdle = () => {};
        const check = () => {
            cancelIdle();
            const ok = canRender3D();
            setCapable(ok);
            // Wait for an idle moment so loading the scene never competes with
            // hydration or the first paint.
            if (ok) cancelIdle = whenIdle(() => setIdle(true));
            else setIdle(false);
        };

        setEnabled(readAnimationPref()); // once: later changes come from the switch
        check();
        // Follow the OS setting live: turning reduced motion on swaps the scene
        // for the static tiles without a reload.
        const query = window.matchMedia?.(REDUCED_MOTION_QUERY);
        query?.addEventListener("change", check);
        return () => {
            query?.removeEventListener("change", check);
            cancelIdle();
        };
    }, []);

    // Stop rendering while the hero is scrolled out of view.
    useEffect(() => {
        const element = section.current;
        if (!element || typeof IntersectionObserver === "undefined") return;
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const show3D = capable === true && enabled && idle && !failed;
    const showSwitch = capable === true && !failed;

    const toggle = () => {
        const next = !enabled;
        setEnabled(next);
        writeAnimationPref(next);
        // The scene is about to unmount (or mount fresh), so it isn't ready either way.
        setReady(false);
    };

    return (
        <section
            ref={section}
            className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden"
        >
            {/* Decorative only: the tech stack is also listed as real text in the copy. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                {/* Fades out once the scene is ready, but snaps straight back when the
                    scene goes away, so switching the animation off never leaves a blank gap. */}
                <HeroFallback
                    className={cn(show3D && ready && "opacity-0 transition-opacity duration-700")}
                />
                {show3D && (
                    <div
                        className={cn(
                            "absolute inset-0 transition-opacity duration-700",
                            ready ? "opacity-100" : "opacity-0"
                        )}
                    >
                        <SceneErrorBoundary
                            onError={() => {
                                setFailed(true);
                                setReady(false);
                            }}
                        >
                            <Suspense fallback={null}>
                                <HeroScene active={inView} onReady={() => setReady(true)} />
                            </Suspense>
                        </SceneErrorBoundary>
                    </div>
                )}
                {/* Keeps the copy readable wherever a tile drifts behind it. The
                    numbers are not arbitrary: measured over a full animation cycle,
                    the brightest tile pixel behind the copy has to stay dark enough
                    for slate-300 text to keep 4.5:1. Phones dim the whole scene,
                    since the copy spans the width. From lg up the scrim is a
                    soft-edged band that follows the text column, so tiles outside
                    it keep their full brightness and no box edge shows. */}
                <div className="absolute inset-0 bg-slate-950/75 lg:hidden" />
                <div
                    className="absolute inset-y-0 left-1/2 hidden w-[min(100%,64rem)] -translate-x-1/2 lg:block"
                    style={{
                        background:
                            "linear-gradient(to right, transparent, rgb(2 6 23 / 0.8) 4rem, rgb(2 6 23 / 0.8) calc(100% - 12rem), transparent)",
                    }}
                />
            </div>

            {children}

            {/* Space is always reserved, so the copy doesn't shift when the
                controls appear. The bottom padding also clears the floating
                "Ask about me" button on phones. */}
            <div className="mx-auto w-full max-w-4xl px-6 pb-20 md:pb-8">
                <div className="flex min-h-18 flex-wrap items-center gap-x-4 gap-y-2 sm:min-h-11">
                    {showSwitch && (
                        <Button
                            type="button"
                            role="switch"
                            aria-checked={enabled}
                            aria-label="Animation"
                            variant="outline"
                            size="lg"
                            className="h-11 gap-3 px-4"
                            onClick={toggle}
                        >
                            Animation
                            {/* State is shown by the thumb's position and the track colour,
                                not by extra words, so the button's visible label ("Animation")
                                is exactly its accessible name. */}
                            <span
                                aria-hidden="true"
                                className={cn(
                                    "relative h-5 w-9 rounded-full transition-colors",
                                    enabled ? "bg-emerald-400" : "bg-slate-600"
                                )}
                            >
                                <span
                                    className={cn(
                                        "absolute top-0.5 left-0.5 size-4 rounded-full bg-slate-950 transition-transform",
                                        enabled && "translate-x-4"
                                    )}
                                />
                            </span>
                        </Button>
                    )}
                    {show3D && ready && (
                        <p className="text-xs text-slate-300">Move your cursor, or tap, to push them.</p>
                    )}
                </div>
            </div>
        </section>
    );
}
