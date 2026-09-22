import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { SSE_HEADERS, sseBody, textReplyChunks } from "../src/test/chat-stream";

const ROUTES = [
    "/",
    "/about",
    "/experience",
    "/projects",
    "/projects/studybuddy",
    "/projects/menuchecker",
    "/contact",
    "/lab/buttons",
    "/health",
    "/does-not-exist",
];

// Everything axe can check against WCAG 2.2 AA, plus its best-practice rules.
async function scan(page: Page) {
    return new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .analyze();
}

function summarise(violations: Awaited<ReturnType<typeof scan>>["violations"]) {
    return violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.html.slice(0, 100)}`);
}

// The static hero: no WebGL, so nothing here depends on a GPU or on timing.
test.describe("axe, no violations", () => {
    test.use({ reducedMotion: "reduce" });

    for (const route of ROUTES) {
        test(`${route}`, async ({ page }) => {
            await page.goto(route);
            await page.waitForLoadState("networkidle");
            expect(summarise((await scan(page)).violations)).toEqual([]);
        });
    }

    test("/ with the chat dialog open", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("button", { name: "Ask about me" }).click();
        await expect(page.getByRole("textbox", { name: "Ask about Minn" })).toBeFocused();
        expect(summarise((await scan(page)).violations)).toEqual([]);
    });

    test("/ with the terminal open and a command run", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("button", { name: "Try the terminal" }).click();
        await expect(page.getByRole("textbox", { name: "Terminal command" })).toBeFocused();
        await page.keyboard.type("help");
        await page.keyboard.press("Enter");
        await expect(page.getByRole("log", { name: "Terminal output" })).toContainText("whoami");
        expect(summarise((await scan(page)).violations)).toEqual([]);
    });

    test("/ on a phone, with the mobile menu open", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto("/");
        await page.getByRole("button", { name: "Open menu" }).click();
        await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
        expect(summarise((await scan(page)).violations)).toEqual([]);
    });
});

test("the live 3D hero has no axe violations either", async ({ page }) => {
    test.slow(); // software WebGL
    await page.goto("/");
    await expect(page.getByText(/to push them/i)).toBeVisible({ timeout: 15_000 });
    expect(summarise((await scan(page)).violations)).toEqual([]);
});

test("the primary flow can be completed with the keyboard alone", async ({ page }) => {
    await page.route("**/api/portfolio-chat", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await route.fulfill({
            status: 200,
            headers: SSE_HEADERS,
            body: sseBody(textReplyChunks("Minn built StudyBuddy.")),
        });
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
    await expect(page.locator("main")).toBeFocused();

    await page.keyboard.press("Tab");
    const ring = await page.evaluate(() => {
        const style = getComputedStyle(document.activeElement as Element);
        return { style: style.outlineStyle, width: parseFloat(style.outlineWidth), color: style.outlineColor };
    });
    expect(ring.style).toBe("solid");
    expect(ring.width).toBeGreaterThanOrEqual(2);
    expect(ring.color).not.toMatch(/\/ 0?\.\d/);

    const launcher = page.getByRole("button", { name: "Ask about me" });
    await launcher.focus();
    await page.keyboard.press("Enter");
    const composer = page.getByRole("textbox", { name: "Ask about Minn" });
    await expect(composer).toBeFocused();

    await page.keyboard.type("What has Minn built?");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    const stop = page.getByRole("button", { name: "Stop" });
    await expect(stop).toBeFocused();

    await expect(page.getByRole("status")).toHaveAttribute("aria-live", "polite");
    const dialog = page.getByRole("dialog", { name: "Ask about Minn" });
    await expect(dialog.getByText("Minn built StudyBuddy.", { exact: true })).toBeVisible();
    await expect(page.getByRole("status")).toContainText("Assistant replied: Minn built StudyBuddy.");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(launcher).toBeFocused();
});
