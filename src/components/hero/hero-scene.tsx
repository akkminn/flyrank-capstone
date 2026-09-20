"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture, ExtrudeGeometry, MathUtils, MeshStandardMaterial, Object3D, Shape, SRGBColorSpace } from "three";
import type { InstancedMesh } from "three";

import { TECH, type Tech } from "./hero-config";

const CAMERA_Z = 10;
const TILE_COUNT = { desktop: 24, phone: 14 };
const PHONE_MAX_WIDTH = 640;
const DEPTH_RANGE = [-5, 2] as const;

// A block is a square with rounded corners and a little thickness.
const BLOCK_THICKNESS = 0.14;
const CORNER_RADIUS = 0.2;

// Cursor / touch interaction: nearby tiles are shoved away, then spring back.
const PUSH_RADIUS = 1.6; 
const PUSH_FORCE = 45;
const SPRING = 6;
const DAMPING = 3;

type Tile = {
    tech: number;
    slot: number;
    z: number;
    size: number;
    nx: number; // -1..1 across the visible width at this depth
    progress: number; // 0 = top of screen, 1 = bottom
    speed: number; // world units per second
    swayAmp: number;
    swayFreq: number;
    phase: number;
    tiltAmp: number; // how far the tile rocks toward / away from the viewer
    tiltFreq: number;
    turn: number; // current rotation in the tile's own plane
    spin: number; // how fast it turns there, rad/s
    // Displacement from the cursor push, and its velocity.
    ox: number;
    oy: number;
    ovx: number;
    ovy: number;
};

// Seeded so the layout is the same on every visit (and in tests).
function mulberry32(seed: number) {
    return () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Tiles cycle through the technology list, so a small count shows the first
// technologies and a larger one wraps around to give some of them a second tile.
function createTiles(count: number, rand: () => number): Tile[] {
    const tiles: Tile[] = [];
    for (let i = 0; i < count; i++) {
        tiles.push({
            tech: i % TECH.length,
            slot: Math.floor(i / TECH.length), // index within that technology's mesh
            z: MathUtils.lerp(DEPTH_RANGE[0], DEPTH_RANGE[1], rand()),
            size: 0.28 + rand() * 0.22,
            nx: rand() * 2 - 1,
            progress: rand(),
            speed: 0.3 + rand() * 0.3,
            swayAmp: 0.15 + rand() * 0.3,
            swayFreq: 0.4 + rand() * 0.6,
            phase: rand() * Math.PI * 2,
            tiltAmp: 0.35 + rand() * 0.35,
            tiltFreq: 0.4 + rand() * 0.5,
            turn: (rand() - 0.5) * Math.PI,
            spin: (rand() - 0.5) * 0.7,
            ox: 0,
            oy: 0,
            ovx: 0,
            ovy: 0,
        });
    }
    return tiles;
}

// A unit-square block with rounded corners, centred on the origin. The shape
// spans 0..1, which ExtrudeGeometry uses directly as the UVs of the front and
// back faces, so a square texture maps onto them exactly. Group 0 is those two
// faces, group 1 the edges.
function createBlockGeometry() {
    const r = CORNER_RADIUS;
    const shape = new Shape();
    shape.moveTo(r, 0);
    shape.lineTo(1 - r, 0);
    shape.absarc(1 - r, r, r, -Math.PI / 2, 0, false);
    shape.lineTo(1, 1 - r);
    shape.absarc(1 - r, 1 - r, r, 0, Math.PI / 2, false);
    shape.lineTo(r, 1);
    shape.absarc(r, 1 - r, r, Math.PI / 2, Math.PI, false);
    shape.lineTo(0, r);
    shape.absarc(r, r, r, Math.PI, (3 * Math.PI) / 2, false);

    const geometry = new ExtrudeGeometry(shape, {
        depth: BLOCK_THICKNESS,
        bevelEnabled: false,
        curveSegments: 5,
    });
    geometry.translate(-0.5, -0.5, -BLOCK_THICKNESS / 2);
    return geometry;
}

// The face of one technology's block: its colour with the logo centred, drawn
// once into an in-memory canvas.
function createTexture({ bg, fg, icon }: Tech) {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    // Simple Icons paths live on a 24x24 grid.
    const scale = (size * 0.56) / 24;
    ctx.translate((size - 24 * scale) / 2, (size - 24 * scale) / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = fg;
    ctx.fill(new Path2D(icon));

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
}

// Cursor / finger position as -1..1 across the canvas, kept in a ref so moving
// the pointer never triggers a React render.
function usePointer(element: HTMLElement) {
    const pointer = useRef({ x: 0, y: 0, active: false });

    useEffect(() => {
        let releaseTimer: number | undefined;

        const track = (event: PointerEvent) => {
            const rect = element.getBoundingClientRect();
            pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.current.y = 1 - ((event.clientY - rect.top) / rect.height) * 2;
            pointer.current.active = true;
            window.clearTimeout(releaseTimer);
        };
        // A tap is only a few frames long, so let it finish pushing before the
        // touch is treated as gone. A mouse stays "active" while it hovers.
        const release = (event: PointerEvent) => {
            if (event.pointerType === "mouse") return;
            releaseTimer = window.setTimeout(() => (pointer.current.active = false), 150);
        };
        const leave = () => (pointer.current.active = false);

        window.addEventListener("pointermove", track, { passive: true });
        window.addEventListener("pointerdown", track, { passive: true });
        window.addEventListener("pointerup", release);
        window.addEventListener("pointercancel", release);
        document.documentElement.addEventListener("pointerleave", leave);
        return () => {
            window.clearTimeout(releaseTimer);
            window.removeEventListener("pointermove", track);
            window.removeEventListener("pointerdown", track);
            window.removeEventListener("pointerup", release);
            window.removeEventListener("pointercancel", release);
            document.documentElement.removeEventListener("pointerleave", leave);
        };
    }, [element]);

    return pointer;
}

function Snow({ count }: { count: number }) {
    const domElement = useThree((state) => state.gl.domElement);
    const pointer = usePointer(domElement);

    const rand = useMemo(() => mulberry32(2026), []);
    const tiles = useMemo(() => createTiles(count, rand), [count, rand]);
    // How many tiles each technology got; technologies with none aren't drawn.
    const perTech = useMemo(() => TECH.map((_, i) => tiles.filter((tile) => tile.tech === i).length), [tiles]);
    const geometry = useMemo(createBlockGeometry, []);
    // One [face, edge] pair per shown technology, matching the geometry's two groups.
    const materials = useMemo(
        () =>
            TECH.map((tech, i) =>
                perTech[i] === 0
                    ? null
                    : [
                          new MeshStandardMaterial({ map: createTexture(tech), roughness: 0.55, metalness: 0 }),
                          new MeshStandardMaterial({ color: tech.bg, roughness: 0.55, metalness: 0 }),
                      ]
            ),
        [perTech]
    );
    const meshes = useRef<(InstancedMesh | null)[]>([]);
    const dummy = useMemo(() => new Object3D(), []);
    const clock = useRef(0);

    // Geometry, materials and textures are passed in by hand, so free them by hand.
    useEffect(
        () => () => {
            geometry.dispose();
            materials.flat().forEach((material) => {
                if (!material) return;
                material.map?.dispose();
                material.dispose();
            });
        },
        [geometry, materials]
    );

    useFrame((state, delta) => {
        // A backgrounded tab can hand us a huge delta; don't let tiles teleport.
        const dt = Math.min(delta, 0.05);
        clock.current += dt;
        const time = clock.current;

        const { width, height } = state.viewport; // world size at z = 0
        const push = pointer.current;
        const damping = Math.exp(-DAMPING * dt);

        for (const tile of tiles) {
            // Farther tiles cover more world per screen pixel, so scale by depth.
            const depth = (CAMERA_Z - tile.z) / CAMERA_Z;
            const halfW = (width / 2) * depth;
            const halfH = (height / 2) * depth;
            const travel = halfH * 2 + tile.size * 2;

            tile.progress += (tile.speed * dt) / travel;
            if (tile.progress > 1) {
                tile.progress -= 1;
                tile.nx = rand() * 2 - 1;
            }

            const x = tile.nx * halfW + Math.sin(time * tile.swayFreq + tile.phase) * tile.swayAmp;
            const y = halfH + tile.size - tile.progress * travel;

            if (push.active) {
                const dx = x + tile.ox - push.x * halfW;
                const dy = y + tile.oy - push.y * halfH;
                const distance = Math.hypot(dx, dy);
                const radius = PUSH_RADIUS * depth;
                if (distance < radius && distance > 1e-4) {
                    const force = (1 - distance / radius) ** 2 * PUSH_FORCE * dt;
                    tile.ovx += (dx / distance) * force;
                    tile.ovy += (dy / distance) * force;
                }
            }
            tile.ovx = (tile.ovx - tile.ox * SPRING * dt) * damping;
            tile.ovy = (tile.ovy - tile.oy * SPRING * dt) * damping;
            tile.ox += tile.ovx * dt;
            tile.oy += tile.ovy * dt;

            // Rock gently toward / away from the viewer while turning slowly in
            // place, so the logo stays readable instead of flipping edge-on.
            tile.turn += tile.spin * dt;
            const tiltX = Math.sin(time * tile.tiltFreq + tile.phase) * tile.tiltAmp;
            const tiltY = Math.cos(time * tile.tiltFreq * 0.8 + tile.phase * 1.3) * tile.tiltAmp;

            dummy.position.set(x + tile.ox, y + tile.oy, tile.z);
            dummy.rotation.set(tiltX, tiltY, tile.turn);
            dummy.scale.setScalar(tile.size);
            dummy.updateMatrix();
            meshes.current[tile.tech]?.setMatrixAt(tile.slot, dummy.matrix);
        }

        for (const mesh of meshes.current) {
            if (mesh) mesh.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <>
            {TECH.map((tech, i) => {
                const material = materials[i];
                if (!material) return null;
                return (
                    <instancedMesh
                        key={tech.id}
                        ref={(mesh) => {
                            meshes.current[i] = mesh;
                        }}
                        args={[geometry, material, perTech[i]]}
                        // Instances move far outside the geometry's own bounds.
                        frustumCulled={false}
                    />
                );
            })}
        </>
    );
}

export type HeroSceneProps = {
    /** False while the hero is scrolled off-screen: stops the render loop. */
    active: boolean;
    onReady?: () => void;
};

export default function HeroScene({ active, onReady }: HeroSceneProps) {
    // Decided once, on the client (this chunk is never server-rendered).
    const count = useMemo(
        () => (window.innerWidth < PHONE_MAX_WIDTH ? TILE_COUNT.phone : TILE_COUNT.desktop),
        []
    );

    return (
        <Canvas
            frameloop={active ? "always" : "never"}
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, CAMERA_Z], fov: 45 }}
            gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
            onCreated={onReady}
        >
            {/* Far blocks fade into the page background instead of competing with the text. */}
            <fog attach="fog" args={["#020617", 9, 19]} />
            {/* Two cheap lights: the ambient keeps every face readable, the
                directional one shades the edges so the thickness shows. */}
            <ambientLight intensity={1.3} />
            <directionalLight position={[3, 4, 6]} intensity={2.2} />
            <Snow count={count} />
        </Canvas>
    );
}
