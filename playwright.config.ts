import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// Runs against a production build (`next build` + `next start`) — the closest
// thing to what a visitor gets — on its own port so it can't collide with a
// `npm run dev` session on 3000. The AI route is mocked inside each spec, so
// no API key or network access is needed.
export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI
        ? [["github"], ["html", { open: "never" }]]
        : [["list"], ["html", { open: "never" }]],
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: "on-first-retry",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
        command: `npm run build && npm run start -- --port ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
    },
});
