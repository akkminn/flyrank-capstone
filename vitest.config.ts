import { defineConfig } from "vitest/config";

// No React plugin: tests don't need Fast Refresh, and the JSX transform comes
// from tsconfig's `"jsx": "react-jsx"`. Playwright specs live in `e2e/` and are
// deliberately outside `include`, so Vitest never tries to run them.
export default defineConfig({
    resolve: { tsconfigPaths: true },
    test: {
        environment: "jsdom",
        setupFiles: ["./vitest.setup.ts"],
        include: ["src/**/*.test.{ts,tsx}"],
        css: false,
    },
});
