import { expect, test } from "@playwright/test";

// The hero's WebGL scene is beside the point here, and turning it off keeps
// these tests independent of the GPU.
test.use({ reducedMotion: "reduce" });

test("a visitor drives the terminal by keyboard: run, complete, recall, navigate", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Try the terminal" }).click();
    const dialog = page.getByRole("dialog", { name: "Terminal" });
    const prompt = dialog.getByRole("textbox", { name: "Terminal command" });
    await expect(prompt).toBeFocused();

    await page.keyboard.type("whoami");
    await page.keyboard.press("Enter");
    const log = dialog.getByRole("log", { name: "Terminal output" });
    await expect(log).toContainText("Bangkok, Thailand");
    await expect(prompt).toHaveValue("");

    await page.keyboard.type("proj");
    await page.keyboard.press("Tab");
    await expect(prompt).toHaveValue("projects");
    await expect(prompt).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(log).toContainText("StudyBuddy");
    await page.keyboard.press("ArrowUp");
    await expect(prompt).toHaveValue("projects");
    await page.keyboard.press("ArrowUp");
    await expect(prompt).toHaveValue("whoami");

    // `open` is a Next.js client-side navigation and closes the terminal.
    await page.keyboard.press("Control+a");
    await page.keyboard.type("open studybuddy");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/projects\/studybuddy$/);
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("heading", { name: "StudyBuddy", level: 1 })).toBeVisible();
});

test("Escape closes the terminal and hands focus back to the launcher", async ({ page }) => {
    await page.goto("/about");

    const launcher = page.getByRole("button", { name: "Open terminal" });
    await launcher.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Terminal" });
    await expect(dialog).toBeVisible();

    for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
        expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(launcher).toBeFocused();
});
