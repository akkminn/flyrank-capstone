import { describe, expect, it } from "vitest";

import { buildMailtoHref } from "./build-mailto-href";

describe("buildMailtoHref", () => {
    it("addresses Minn's real inbox", () => {
        expect(buildMailtoHref("Jane", "jane@example.com", "Hi")).toMatch(
            /^mailto:maungkokominn@gmail\.com\?/
        );
    });

    it("encodes the subject and body so special characters survive the URL", () => {
        const href = buildMailtoHref("Jane & Bob", "jane@example.com", "Line one\nLine two? #hi");
        const [, query] = href.split("?");
        const params = new URLSearchParams(query);

        expect(params.get("subject")).toBe("Portfolio message from Jane & Bob");
        expect(params.get("body")).toBe("Line one\nLine two? #hi\n\n— Jane & Bob (jane@example.com)");
    });

    it("still produces a usable link when the name or email is blank", () => {
        const href = buildMailtoHref("", "", "Just a note.");
        const params = new URLSearchParams(href.split("?")[1]);

        expect(params.get("subject")).toBe("Portfolio message from a visitor");
        expect(params.get("body")).toBe("Just a note.\n\n— a visitor");
    });
});
