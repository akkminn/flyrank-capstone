type NavigatorHints = Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
};

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// A phone-sized screen. The scene costs roughly 0.4-0.8 s of main-thread blocking
// on a mid-range phone (measured under Lighthouse's mobile throttling), so these
// visitors start on the static hero and can switch the animation on. Tablets and
// desktops get it automatically.
//
// This keys on width alone, not on a coarse pointer, deliberately: Chrome
// DevTools' Lighthouse panel emulates a phone's width but not its touch input,
// so a pointer-based rule would never fire there (measured: it left the scene
// on and Home at 77).
const PHONE_QUERY = "(max-width: 767px)";

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
// site data off), in which case the default applies and nothing throws. With
// no saved choice the default is "on", except on phones (see PHONE_QUERY).
export function readAnimationPref(): boolean {
    let saved: string | null = null;
    try {
        saved = window.localStorage.getItem(ANIMATION_PREF_KEY);
    } catch {
        // localStorage can throw in a private window or with site data blocked.
    }
    if (saved === "on") return true;
    if (saved === "off") return false;
    return !window.matchMedia?.(PHONE_QUERY).matches;
}

export function writeAnimationPref(on: boolean) {
    try {
        window.localStorage.setItem(ANIMATION_PREF_KEY, on ? "on" : "off");
    } catch {
        // localStorage can throw in a private window or with site data blocked.
    }
}
