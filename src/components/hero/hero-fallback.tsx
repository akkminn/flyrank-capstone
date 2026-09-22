import { cn } from "@/lib/utils";

import { TECH } from "./hero-config";

// Pure HTML/SVG/CSS, so it costs no JavaScript and can be server-rendered.
const TILES = [
    { tech: 0, left: 78, top: 14, size: 44, turn: 12 },
    { tech: 1, left: 90, top: 40, size: 38, turn: -14 },
    { tech: 2, left: 66, top: 54, size: 48, turn: 8 },
    { tech: 3, left: 84, top: 74, size: 40, turn: -8 },
    { tech: 4, left: 55, top: 22, size: 32, turn: -18 },
    { tech: 5, left: 93, top: 88, size: 36, turn: 16 },
    { tech: 6, left: 70, top: 86, size: 44, turn: -10 },
    { tech: 7, left: 62, top: 66, size: 34, turn: 14 },
    { tech: 8, left: 60, top: 8, size: 34, turn: 18 },
    { tech: 9, left: 3, top: 40, size: 36, turn: -12 },
    { tech: 10, left: 96, top: 24, size: 32, turn: 10 },
    { tech: 11, left: 45, top: 92, size: 32, turn: -16 },
];

export function HeroFallback({ className }: { className?: string }) {
    return (
        <div className={cn("absolute inset-0 overflow-hidden", className)}>
            {TILES.map(({ tech, left, top, size, turn }) => {
                const { id, bg, fg, icon } = TECH[tech];
                return (
                    <div
                        key={id}
                        className="absolute grid place-items-center rounded-[20%] opacity-60 shadow-[0_3px_0_rgb(0_0_0/0.35)]"
                        style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            width: size,
                            height: size,
                            background: bg,
                            transform: `rotate(${turn}deg)`,
                        }}
                    >
                        <svg viewBox="0 0 24 24" width="56%" height="56%" fill={fg} focusable="false">
                            <path d={icon} />
                        </svg>
                    </div>
                );
            })}
        </div>
    );
}
