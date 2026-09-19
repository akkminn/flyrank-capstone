import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AsyncActionButton } from "@/components/ui/async-action-button";

// The button's accessible name *is* its state, so these read state through the
// same role/name a screen-reader user would get.
const idle = { name: "Send" };
const loading = { name: "Send, working…" };
const success = { name: "Sent" };
const failed = { name: "Retry — the last attempt failed" };

function deferred() {
    let resolve!: () => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

function setup(onActivate: () => Promise<void>, props: { disabled?: boolean; successHoldMs?: number } = {}) {
    render(
        <AsyncActionButton
            idleLabel="Send"
            successLabel="Sent"
            errorLabel="Retry"
            onActivate={onActivate}
            {...props}
        />
    );
}

const click = (name: { name: string }) => fireEvent.click(screen.getByRole("button", name));

// Lets a promise settle and React re-render, then (optionally) moves the clock.
async function settle(action: () => void = () => {}, advanceMs = 0) {
    await act(async () => {
        action();
        if (advanceMs) vi.advanceTimersByTime(advanceMs);
    });
}

describe("AsyncActionButton", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("moves idle → loading → success → back to idle", async () => {
        const request = deferred();
        setup(() => request.promise);

        click(idle);
        expect(screen.getByRole("button", loading)).toBeDisabled();

        await settle(request.resolve);
        expect(screen.getByRole("button", success)).toBeEnabled();

        await settle(() => {}, 1400);
        expect(screen.getByRole("button", idle)).toBeEnabled();
    });

    it("holds the success state for exactly as long as successHoldMs says", async () => {
        setup(() => Promise.resolve(), { successHoldMs: 3000 });

        click(idle);
        await settle();
        expect(screen.getByRole("button", success)).toBeInTheDocument();

        await settle(() => {}, 2999);
        expect(screen.getByRole("button", success)).toBeInTheDocument();

        await settle(() => {}, 1);
        expect(screen.getByRole("button", idle)).toBeInTheDocument();
    });

    it("lands on a persistent, retryable error state when the action fails", async () => {
        const request = deferred();
        setup(() => request.promise);

        click(idle);
        await settle(() => request.reject(new Error("nope")));

        expect(screen.getByRole("button", failed)).toBeEnabled();
        // An error waits for the visitor; it must not quietly revert itself.
        await settle(() => {}, 10_000);
        expect(screen.getByRole("button", failed)).toBeInTheDocument();
    });

    it("runs the action again from the error state and can recover", async () => {
        const first = deferred();
        const second = deferred();
        const onActivate = vi
            .fn<() => Promise<void>>()
            .mockReturnValueOnce(first.promise)
            .mockReturnValueOnce(second.promise);
        setup(onActivate);

        click(idle);
        await settle(() => first.reject(new Error("first try fails")));
        click(failed);
        await settle(second.resolve);

        expect(screen.getByRole("button", success)).toBeInTheDocument();
        expect(onActivate).toHaveBeenCalledTimes(2);
    });

    it("ignores spam-clicks while a request is in flight", async () => {
        const request = deferred();
        const onActivate = vi.fn(() => request.promise);
        setup(onActivate);

        click(idle);
        click(loading);
        click(loading);
        click(loading);

        expect(onActivate).toHaveBeenCalledTimes(1);
    });

    it("lets a new click during the success hold take over instead of reverting mid-request", async () => {
        const second = deferred();
        const onActivate = vi
            .fn<() => Promise<void>>()
            .mockResolvedValueOnce(undefined)
            .mockReturnValueOnce(second.promise);
        setup(onActivate);

        click(idle);
        await settle();
        expect(screen.getByRole("button", success)).toBeInTheDocument();

        click(success);
        expect(screen.getByRole("button", loading)).toBeInTheDocument();

        // The first run's pending revert-to-idle must not fire mid-request.
        await settle(() => {}, 5000);
        expect(screen.getByRole("button", loading)).toBeInTheDocument();

        await settle(second.resolve);
        expect(screen.getByRole("button", success)).toBeInTheDocument();
    });

    it("does nothing when disabled", () => {
        const onActivate = vi.fn(() => Promise.resolve());
        setup(onActivate, { disabled: true });

        click(idle);

        expect(screen.getByRole("button", idle)).toBeDisabled();
        expect(onActivate).not.toHaveBeenCalled();
    });
});
