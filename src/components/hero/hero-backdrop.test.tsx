import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HeroBackdrop } from "./hero-backdrop";

// jsdom has no WebGL, so the real scene can't run here. This stand-in keeps the
// contract HeroBackdrop relies on: it announces itself via `onReady`, and shows
// text so tests can see it mounted. `scene.loads` counts mounts so tests can
// prove the scene is *not* fetched when it shouldn't be.
const scene = vi.hoisted(() => ({ loads: 0, shouldThrow: false }));

vi.mock("./hero-scene", () => ({
    default: function FakeScene({ active, onReady }: { active: boolean; onReady?: () => void }) {
        if (scene.shouldThrow) throw new Error("WebGL is not available");
        scene.loads += 1;
        useEffect(() => onReady?.(), [onReady]);
        return <p>Scene {active ? "running" : "paused"}</p>;
    },
}));

function stubDevice({
    reducedMotion = false,
    saveData = false,
    deviceMemory = 8,
    hardwareConcurrency = 8,
    phone = false,
} = {}) {
    const listeners = new Set<() => void>();
    const query = {
        matches: reducedMotion,
        addEventListener: (_: string, fn: () => void) => listeners.add(fn),
        removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    };
    // Only the phone query (a narrow screen) answers to `phone`.
    const phoneQuery = { matches: phone, addEventListener: () => {}, removeEventListener: () => {} };
    vi.stubGlobal("matchMedia", (media: string) => (media.includes("max-width") ? phoneQuery : query));
    vi.stubGlobal("navigator", {
        ...navigator,
        connection: { saveData },
        deviceMemory,
        hardwareConcurrency,
    });
    return {
        setReducedMotion(matches: boolean) {
            query.matches = matches;
            listeners.forEach((fn) => fn());
        },
    };
}

const renderHero = () =>
    render(
        <HeroBackdrop>
            <h1>Hero copy</h1>
        </HeroBackdrop>
    );

// The caption only appears once the live scene is up, so it doubles as the
// user-visible signal that 3D is running.
const pushHint = () => screen.queryByText(/to push them/i);

beforeEach(() => {
    scene.loads = 0;
    scene.shouldThrow = false;
    window.localStorage.clear();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("HeroBackdrop", () => {
    it("always renders the hero copy, before any 3D has loaded", () => {
        stubDevice();
        renderHero();

        expect(screen.getByRole("heading", { name: "Hero copy" })).toBeInTheDocument();
        expect(pushHint()).not.toBeInTheDocument();
        expect(scene.loads).toBe(0);
    });

    it("lazy-loads the 3D scene, then tells the visitor they can push the tiles", async () => {
        stubDevice();
        renderHero();

        expect(await screen.findByText(/to push them/i)).toBeInTheDocument();
        expect(screen.getByText("Scene running")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Hero copy" })).toBeInTheDocument();
    });

    it("turns the whole animation off and on: the scene is torn down, not just paused", async () => {
        stubDevice();
        const user = userEvent.setup();
        renderHero();

        const toggle = await screen.findByRole("switch", { name: "Animation" });
        await screen.findByText("Scene running");
        expect(toggle).toHaveAttribute("aria-checked", "true");

        await user.click(toggle);

        // Off unmounts the scene entirely (that is what frees the GPU), and the
        // "push them" hint no longer applies.
        expect(toggle).toHaveAttribute("aria-checked", "false");
        expect(screen.queryByText(/Scene (running|paused)/)).not.toBeInTheDocument();
        expect(pushHint()).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Hero copy" })).toBeInTheDocument();

        const loadsWhileOn = scene.loads;
        await user.click(toggle);

        expect(toggle).toHaveAttribute("aria-checked", "true");
        expect(await screen.findByText("Scene running")).toBeInTheDocument();
        expect(scene.loads).toBeGreaterThan(loadsWhileOn); // a fresh scene, not a resumed one
        expect(await screen.findByText(/to push them/i)).toBeInTheDocument();
    });

    it("remembers the choice, so an off visitor never loads the 3D scene until they turn it on", async () => {
        stubDevice();
        window.localStorage.setItem("hero-animation", "off");
        const user = userEvent.setup();
        renderHero();

        const toggle = await screen.findByRole("switch", { name: "Animation" });
        // Give the idle callback every chance to (wrongly) mount the scene.
        await new Promise((resolve) => setTimeout(resolve, 400));
        expect(toggle).toHaveAttribute("aria-checked", "false");
        expect(scene.loads).toBe(0);
        expect(pushHint()).not.toBeInTheDocument();

        await user.click(toggle);

        expect(await screen.findByText("Scene running")).toBeInTheDocument();
        expect(window.localStorage.getItem("hero-animation")).toBe("on");

        await user.click(toggle);
        expect(window.localStorage.getItem("hero-animation")).toBe("off");
    });

    it("starts phones on the static hero, and lets them opt in to the scene", async () => {
        stubDevice({ phone: true });
        const user = userEvent.setup();
        renderHero();

        const toggle = await screen.findByRole("switch", { name: "Animation" });
        await new Promise((resolve) => setTimeout(resolve, 400));
        expect(toggle).toHaveAttribute("aria-checked", "false");
        expect(scene.loads).toBe(0); // the 3D code is not even requested

        await user.click(toggle);

        expect(await screen.findByText("Scene running")).toBeInTheDocument();
        expect(window.localStorage.getItem("hero-animation")).toBe("on");
    });

    it("honours a phone visitor's saved choice to have the animation on", async () => {
        stubDevice({ phone: true });
        window.localStorage.setItem("hero-animation", "on");
        renderHero();

        expect(await screen.findByText("Scene running")).toBeInTheDocument();
        expect(screen.getByRole("switch", { name: "Animation" })).toHaveAttribute("aria-checked", "true");
    });

    it("still works for the visit when storage is blocked", async () => {
        stubDevice();
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new Error("storage blocked");
        });
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new Error("storage blocked");
        });
        const user = userEvent.setup();
        renderHero();

        const toggle = await screen.findByRole("switch", { name: "Animation" });
        await screen.findByText("Scene running");

        await user.click(toggle);
        expect(toggle).toHaveAttribute("aria-checked", "false");
        expect(screen.queryByText("Scene running")).not.toBeInTheDocument();
    });

    it.each([
        ["prefers reduced motion", { reducedMotion: true }],
        ["has data-saver on", { saveData: true }],
    ])("offers no switch at all when the visitor %s", async (_, device) => {
        stubDevice(device);
        renderHero();

        await new Promise((resolve) => setTimeout(resolve, 400));

        expect(screen.queryByRole("switch", { name: "Animation" })).not.toBeInTheDocument();
    });

    it.each([
        ["prefers reduced motion", { reducedMotion: true }],
        ["has data-saver on", { saveData: true }],
        ["reports low memory", { deviceMemory: 1 }],
        ["reports few CPU cores", { hardwareConcurrency: 2 }],
    ])("stays static, and never loads the scene, when the visitor %s", async (_, device) => {
        stubDevice(device);
        renderHero();

        // Give the idle callback every chance to (wrongly) mount the scene.
        await new Promise((resolve) => setTimeout(resolve, 400));

        expect(screen.getByRole("heading", { name: "Hero copy" })).toBeInTheDocument();
        expect(pushHint()).not.toBeInTheDocument();
        expect(scene.loads).toBe(0);
    });

    it("drops back to static when reduced motion is switched on mid-visit", async () => {
        const device = stubDevice();
        renderHero();
        await screen.findByText(/to push them/i);

        device.setReducedMotion(true);

        await vi.waitFor(() => expect(pushHint()).not.toBeInTheDocument());
        expect(screen.queryByText(/Scene (running|paused)/)).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Hero copy" })).toBeInTheDocument();
    });

    it("stays usable, without the caption, if the scene fails to start", async () => {
        stubDevice();
        scene.shouldThrow = true;
        // React logs the caught render error; that noise is expected here.
        vi.spyOn(console, "error").mockImplementation(() => {});
        renderHero();

        await new Promise((resolve) => setTimeout(resolve, 400));

        expect(screen.getByRole("heading", { name: "Hero copy" })).toBeInTheDocument();
        expect(pushHint()).not.toBeInTheDocument();
    });
});
