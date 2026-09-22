import { describe, expect, it } from "vitest";

import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
    it("allows requests up to the limit, then rejects", () => {
        const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 3 });
        expect(limiter.check("a")).toBe(true);
        expect(limiter.check("a")).toBe(true);
        expect(limiter.check("a")).toBe(true);
        expect(limiter.check("a")).toBe(false);
    });

    it("tracks each key independently", () => {
        const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 1 });
        expect(limiter.check("a")).toBe(true);
        expect(limiter.check("b")).toBe(true);
        expect(limiter.check("a")).toBe(false);
        expect(limiter.check("b")).toBe(false);
    });

    it("forgets hits once they age out of the window", () => {
        let time = 0;
        const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 1, now: () => time });

        expect(limiter.check("a")).toBe(true);
        expect(limiter.check("a")).toBe(false);

        time = 1001;
        expect(limiter.check("a")).toBe(true);
    });

    it("stops recording hits for a key once it's over the limit", () => {
        let time = 0;
        const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 2, now: () => time });

        for (let i = 0; i < 20; i++) {
            limiter.check("a");
            time += 1;
        }

        time = 1002;
        expect(limiter.check("a")).toBe(true);
        expect(limiter.check("a")).toBe(true);
        expect(limiter.check("a")).toBe(false);
    });
});
