import { expect, test, type Page } from "@playwright/test";

import { TECH } from "../src/components/hero/hero-config";

// Headless Chromium renders WebGL in software, so a live, animating scene is
// CPU-heavy. Running these one at a time keeps each page fast enough that the
// assertions measure the app rather than a starved worker.
test.describe.configure({ mode: "serial" });

// The caption only appears once the live scene is up.
const pushHint = (page: Page) => page.getByText(/to push them/i);

test("the hero lists the tech stack and renders a live scene that can be switched off and on", async ({ page }) => {
    test.slow(); // software WebGL plus several full-hero screenshots

    // three logs "THREE.<Thing>: ..." for deprecations and misuse; none should appear.
    const threeWarnings: string[] = [];
    page.on("console", (message) => {
        if (message.text().startsWith("THREE.")) threeWarnings.push(message.text());
    });

    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Aung Ko Ko Minn" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Tech stack" }).getByRole("listitem")).toHaveCount(TECH.length);

    // The static tiles paint first; the scene swaps in once the browser is idle.
    await expect(pushHint(page)).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("canvas")).toHaveCount(1);

    // The scene must actually be drawing and moving: a mounted-but-blank or
    // frozen canvas would give two identical frames a second apart.
    const hero = page.locator("section").first();
    const secondApart = async () => {
        const first = await hero.screenshot();
        await page.waitForTimeout(1000);
        return first.equals(await hero.screenshot());
    };
    expect(await secondApart()).toBe(false);

    // Off removes the canvas altogether (that is what releases the GPU), leaving
    // the static tiles; on brings a live scene back.
    const animation = page.getByRole("switch", { name: "Animation" });
    await expect(animation).toHaveAttribute("aria-checked", "true");
    await animation.click();
    await expect(animation).toHaveAttribute("aria-checked", "false");
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(pushHint(page)).toHaveCount(0);
    await page.waitForTimeout(500);
    expect(await secondApart()).toBe(true);

    await animation.click();
    await expect(animation).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("canvas")).toHaveCount(1);
    await expect(pushHint(page)).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(500);
    expect(await secondApart()).toBe(false);

    // Switching off releases the GPU context on purpose, and three logs that as
    // "Context Lost" — proof the teardown really happened. Anything else from
    // three (deprecations, misuse) is a problem.
    const contextLost = "THREE.WebGLRenderer: Context Lost.";
    expect(threeWarnings).toContain(contextLost);
    expect(threeWarnings.filter((warning) => warning !== contextLost)).toEqual([]);
});

test("animation turned off is remembered, and the 3D code is never downloaded", async ({ page }) => {
    // Every script the page pulls in; the 3D chunk is the one that contains the renderer.
    const scriptBodies: Promise<string>[] = [];
    page.on("response", (response) => {
        if (response.url().endsWith(".js")) scriptBodies.push(response.text().catch(() => ""));
    });
    await page.addInitScript(() => window.localStorage.setItem("hero-animation", "off"));
    await page.goto("/");

    const animation = page.getByRole("switch", { name: "Animation" });
    await expect(animation).toHaveAttribute("aria-checked", "false");

    // Wait past the idle-callback window, then confirm nothing 3D was loaded.
    await page.waitForTimeout(2500);
    await expect(page.locator("canvas")).toHaveCount(0);
    const scripts = await Promise.all(scriptBodies);
    expect(scripts.some((body) => body.includes("WebGLRenderer"))).toBe(false);
});

test("reduced motion gets static tiles and never loads a canvas", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Aung Ko Ko Minn" })).toBeVisible();

    // Wait past the idle-callback window, then confirm nothing 3D showed up.
    await page.waitForTimeout(2000);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(pushHint(page)).toHaveCount(0);
});

test("a low-memory device gets the static tiles", async ({ page }) => {
    await page.addInitScript(() => {
        Object.defineProperty(navigator, "deviceMemory", { get: () => 1 });
    });
    await page.goto("/");

    await page.waitForTimeout(2000);
    await expect(page.getByRole("heading", { name: "Aung Ko Ko Minn" })).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(pushHint(page)).toHaveCount(0);
});

test("if WebGL is unavailable the hero stays usable with static tiles", async ({ page }) => {
    await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
            this: HTMLCanvasElement,
            type: string,
            ...rest: unknown[]
        ) {
            if (type.startsWith("webgl") || type === "experimental-webgl") return null;
            return Reflect.apply(original, this, [type, ...rest]);
        } as typeof original;
    });
    await page.goto("/");

    await page.waitForTimeout(2500);
    await expect(page.getByRole("heading", { name: "Aung Ko Ko Minn" })).toBeVisible();
    await expect(pushHint(page)).toHaveCount(0);
});
