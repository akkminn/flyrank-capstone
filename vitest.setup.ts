import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// jsdom doesn't implement element scrolling; the chat panel calls it to pin
// the latest message into view.
Element.prototype.scrollTo = () => {};

// Safety net: the chat talks to a paid model, so a test must never reach the
// network by accident. Every test starts with `fetch` rejecting; tests that
// need the chat route opt in explicitly by stubbing it (see
// src/test/chat-route.ts).
beforeEach(() => {
    vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.reject(new Error("Unmocked fetch call in a test.")))
    );
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});
