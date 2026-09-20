type NavigatorHints = Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
};

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Devices at or below these numbers get the static hero. Both are Chromium
// hints (Safari/Firefox report neither), so they only ever *remove* the 3D
// scene for known-weak devices; everyone else falls through to the normal path.
const LOW_MEMORY_GB = 2;
const LOW_CORE_COUNT = 2;

/**
 * Whether this visitor should get the live 3D scene instead of the static
 * illustration: no reduced-motion preference, no data-saver, and not a device
 * that reports itself as low-memory or low-core.
 *
 * Browser-only — call it from an effect, never during render.
 */
export function canRender3D(): boolean {
    if (window.matchMedia?.(REDUCED_MOTION_QUERY).matches) return false;

    const nav = navigator as NavigatorHints;
    if (nav.connection?.saveData) return false;
    if (nav.deviceMemory !== undefined && nav.deviceMemory <= LOW_MEMORY_GB) return false;
    if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= LOW_CORE_COUNT) {
        return false;
    }
    return true;
}

// Runs `callback` once the main thread is idle, so loading the 3D chunk never
// competes with hydration or the first paint. Safari has no requestIdleCallback.
export function whenIdle(callback: () => void): () => void {
    if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(callback, { timeout: 1500 });
        return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(callback, 200);
    return () => window.clearTimeout(id);
}

const ANIMATION_PREF_KEY = "hero-animation";

// The visitor's own on/off choice for the hero animation. Remembered so it
// survives navigating away and back; storage can be blocked (private windows,
// site data off), in which case the default is simply "on" and nothing throws.
export function readAnimationPref(): boolean {
    try {
        return window.localStorage.getItem(ANIMATION_PREF_KEY) !== "off";
    } catch {
        return true;
    }
}

export function writeAnimationPref(on: boolean) {
    try {
        window.localStorage.setItem(ANIMATION_PREF_KEY, on ? "on" : "off");
    } catch {
        // Not remembered this time; the switch still works for this visit.
    }
}
