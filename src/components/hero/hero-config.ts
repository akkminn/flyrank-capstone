
import {
    siDjango,
    siFirebase,
    siFlask,
    siGit,
    siGooglecloud,
    siGooglegemini,
    siJavascript,
    siMongodb,
    siMysql,
    siNextdotjs,
    siOpenjdk,
    siPostgresql,
    siPython,
    siReact,
    siSpringboot,
    siTailwindcss,
    siTypescript,
    siVercel,
    siVuedotjs,
} from "simple-icons";

export type Tech = {
    id: string;
    name: string;
    icon: string;
    bg: string;
    fg: string;
};

// Relative luminance (WCAG): 0 = black, 1 = white.
function luminance(hex: string) {
    const [r, g, b] = [0, 2, 4].map((i) => {
        const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const PAGE_DARK = 0.05; // brand colours darker than this vanish against the page
const LIGHT_BRAND = 0.3; // brand colours lighter than this need a dark logo

// Tile in the brand colour with a logo that stays readable on it. A brand
// colour too dark to see on the page (Next.js is pure black) flips: a light
// tile carrying the logo in its brand colour.
function toTech(id: string, { title, hex, path }: { title: string; hex: string; path: string }, name = title): Tech {
    const brightness = luminance(hex);
    if (brightness < PAGE_DARK) return { id, name, icon: path, bg: "#f5f5f5", fg: `#${hex}` };
    return { id, name, icon: path, bg: `#${hex}`, fg: brightness > LIGHT_BRAND ? "#0f172a" : "#ffffff" };
}

export const TECH: readonly Tech[] = [
    toTech("typescript", siTypescript),
    toTech("react", siReact),
    toTech("nextjs", siNextdotjs),
    toTech("tailwind", siTailwindcss),
    toTech("vue", siVuedotjs, "Vue"),
    toTech("spring", siSpringboot),
    toTech("python", siPython),
    toTech("firebase", siFirebase),
    toTech("javascript", siJavascript),
    toTech("java", siOpenjdk, "Java"),
    toTech("django", siDjango),
    toTech("flask", siFlask),
    toTech("postgresql", siPostgresql),
    toTech("mysql", siMysql),
    toTech("mongodb", siMongodb),
    toTech("git", siGit),
    toTech("googlecloud", siGooglecloud),
    toTech("vercel", siVercel),
    toTech("gemini", siGooglegemini),
];
