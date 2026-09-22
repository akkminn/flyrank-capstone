"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, RefreshIcon, Tick02Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

export type AsyncButtonStatus = "idle" | "loading" | "success" | "error";

type AsyncActionButtonProps = {
    onActivate: () => Promise<void>;
    idleLabel: string;
    successLabel?: string;
    errorLabel?: string;
    successHoldMs?: number;
    disabled?: boolean;
    className?: string;
    variant?: "solid" | "subtle";
    idleIcon?: ReactNode;
};

export function AsyncActionButton({
    onActivate,
    idleLabel,
    successLabel = "Done",
    errorLabel = "Retry",
    successHoldMs = 1400,
    disabled,
    className,
    variant = "solid",
    idleIcon,
}: AsyncActionButtonProps) {
    const [status, setStatus] = useState<AsyncButtonStatus>("idle");
    const revertTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => () => clearTimeout(revertTimer.current), []);

    async function handleClick() {
        if (status === "loading") return;
        clearTimeout(revertTimer.current);
        // Retrying from "error" always passes through "loading" first, which
        // removes the shake keyframe's class before a second failure can
        // re-add it — that alone is enough for the browser to replay the
        // animation from scratch, so no key-remount trick is needed here
        // (remounting the button would also drop keyboard focus on retry).
        setStatus("loading");
        try {
            await onActivate();
            setStatus("success");
            revertTimer.current = setTimeout(() => setStatus("idle"), successHoldMs);
        } catch {
            setStatus("error");
        }
    }

    const iconSize = variant === "solid" ? 18 : 14;

    const statusText =
        status === "loading"
            ? `${idleLabel}, working…`
            : status === "success"
              ? successLabel
              : status === "error"
                ? `${errorLabel} — the last attempt failed`
                : idleLabel;

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled || status === "loading"}
            aria-label={statusText}
            className={cn(
                "relative inline-flex shrink-0 items-center justify-center font-medium",
                "transition-[transform,background-color,box-shadow] duration-150 ease-out",
                "motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.96]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100",
                variant === "solid"
                    ? "h-10 w-32 rounded-full text-sm"
                    : "h-9 w-28 rounded-xl border text-xs",
                variant === "solid" &&
                    status === "idle" &&
                    "bg-white text-slate-900",
                variant === "solid" &&
                    status === "loading" &&
                    "bg-slate-700 text-white",
                variant === "solid" &&
                    status === "success" &&
                    "bg-emerald-500 text-white",
                variant === "solid" &&
                    status === "error" &&
                    "bg-red-500 text-white",
                variant === "subtle" &&
                    (status === "idle" || status === "loading") &&
                    "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white",
                variant === "subtle" &&
                    status === "success" &&
                    "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
                variant === "subtle" &&
                    status === "error" &&
                    "border-red-500/30 bg-red-500/10 text-red-300",
                status === "error" && "motion-safe:[animation:button-shake_0.4s_ease-in-out]",
                className
            )}
        >
            {/* Each state is a full-size absolutely-positioned layer that
                only ever animates opacity/transform, so switching between
                them never resizes the button or reflows the page. */}
            <span
                aria-hidden={status !== "idle"}
                className={cn(
                    "absolute inset-0 flex items-center justify-center gap-1.5 transition-[opacity,transform] duration-200 ease-out",
                    status === "idle"
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none -translate-y-1.5 opacity-0"
                )}
            >
                {idleIcon}
                {idleLabel}
            </span>

            <span
                aria-hidden={status !== "loading"}
                className={cn(
                    "absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-200 ease-out",
                    status === "loading"
                        ? "translate-y-0 opacity-100 delay-75"
                        : "pointer-events-none translate-y-1.5 opacity-0"
                )}
            >
                <HugeiconsIcon
                    icon={Loading03Icon}
                    size={iconSize}
                    className="motion-safe:animate-spin"
                />
            </span>

            <span
                aria-hidden={status !== "success"}
                className={cn(
                    "absolute inset-0 flex items-center justify-center gap-1.5 transition-opacity duration-200 ease-out",
                    status === "success" ? "opacity-100" : "pointer-events-none opacity-0"
                )}
            >
                <HugeiconsIcon
                    icon={Tick02Icon}
                    size={iconSize}
                    className={status === "success" ? "motion-safe:[animation:button-pop_0.35s_ease-out]" : ""}
                />
                {successLabel}
            </span>

            <span
                aria-hidden={status !== "error"}
                className={cn(
                    "absolute inset-0 flex items-center justify-center gap-1.5 transition-[opacity,transform] duration-200 ease-out",
                    status === "error"
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-1.5 opacity-0"
                )}
            >
                <HugeiconsIcon icon={RefreshIcon} size={iconSize - 2} />
                {errorLabel}
            </span>
        </button>
    );
}
