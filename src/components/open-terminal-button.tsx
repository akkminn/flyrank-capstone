"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ComputerTerminal01Icon } from "@hugeicons/core-free-icons";

import { buttonVariants } from "@/components/ui/button";
import { openTerminal } from "@/lib/terminal-events";
import { cn } from "@/lib/utils";

export function OpenTerminalButton() {
    return (
        <button
            type="button"
            onClick={openTerminal}
            aria-haspopup="dialog"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }), "font-mono")}
        >
            <HugeiconsIcon icon={ComputerTerminal01Icon} size={16} aria-hidden="true" />
            Try the terminal
        </button>
    );
}
