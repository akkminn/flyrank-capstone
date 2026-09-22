export interface RateLimiter {
    check(key: string): boolean;
}

export function createRateLimiter({
    windowMs,
    maxRequests,
    now = () => Date.now(),
}: {
    windowMs: number;
    maxRequests: number;
    now?: () => number;
}): RateLimiter {
    const hitsByKey = new Map<string, number[]>();

    function sweep(windowStart: number) {
        for (const [key, hits] of hitsByKey) {
            if (hits[hits.length - 1] <= windowStart) {
                hitsByKey.delete(key);
            }
        }
    }

    return {
        check(key) {
            const currentTime = now();
            const windowStart = currentTime - windowMs;

            sweep(windowStart);

            const recentHits = (hitsByKey.get(key) ?? []).filter((hit) => hit > windowStart);

            if (recentHits.length >= maxRequests) {
                hitsByKey.set(key, recentHits);
                return false;
            }

            recentHits.push(currentTime);
            hitsByKey.set(key, recentHits);
            return true;
        },
    };
}
