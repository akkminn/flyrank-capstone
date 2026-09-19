import { vi } from "vitest";

/**
 * Replaces `fetch` with a stand-in for the /api/portfolio-chat route.
 * `respond` runs once per request (receiving the request's abort signal) and
 * returns what the route would send back — or throws/rejects to simulate the
 * network failing. Returns the mock so tests can assert on what was sent.
 */
export function mockChatRoute(
    respond: (signal?: AbortSignal | null) => Response | Promise<Response>
) {
    const fetchMock = vi.fn(async (_input: unknown, init?: RequestInit) => respond(init?.signal));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

/** The parsed JSON body of the Nth request the mocked route received. */
export function sentBody(fetchMock: ReturnType<typeof mockChatRoute>, call = 0) {
    const init = (fetchMock.mock.calls[call] as unknown as [string, RequestInit])[1];
    return JSON.parse(init.body as string) as {
        messages: { role: string; parts: { type: string; text?: string }[] }[];
    };
}

/** Text of the last user message the client sent in the Nth request. */
export function lastUserText(fetchMock: ReturnType<typeof mockChatRoute>, call = 0) {
    const messages = sentBody(fetchMock, call).messages;
    const last = [...messages].reverse().find((message) => message.role === "user");
    return last?.parts.find((part) => part.type === "text")?.text;
}
