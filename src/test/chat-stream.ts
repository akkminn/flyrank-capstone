// Builds the AI SDK's UI-message-stream wire format (server-sent events) so
// tests can stand in for /api/portfolio-chat without touching a real model.
// Deliberately free of Vitest imports: the Playwright spec reuses it too.

export type UiStreamChunk = { type: string } & Record<string, unknown>;

export const SSE_HEADERS = {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    "x-vercel-ai-ui-message-stream": "v1",
};

export function encodeChunk(chunk: UiStreamChunk | "[DONE]"): string {
    return `data: ${chunk === "[DONE]" ? chunk : JSON.stringify(chunk)}\n\n`;
}

export function sseBody(chunks: UiStreamChunk[]): string {
    return [...chunks.map(encodeChunk), encodeChunk("[DONE]")].join("");
}

const streamStart: UiStreamChunk[] = [{ type: "start" }, { type: "start-step" }];
const streamEnd: UiStreamChunk[] = [
    { type: "finish-step" },
    { type: "finish", finishReason: "stop" },
];

function textPart(id: string, text: string): UiStreamChunk[] {
    return [
        { type: "text-start", id },
        { type: "text-delta", id, delta: text },
        { type: "text-end", id },
    ];
}

export function textReplyChunks(text: string): UiStreamChunk[] {
    return [...streamStart, ...textPart("text-1", text), ...streamEnd];
}

export function errorReplyChunks(message: string): UiStreamChunk[] {
    return [{ type: "start" }, { type: "error", errorText: message }];
}

export function projectsReplyChunks(
    input: { name?: string },
    output: { projects: unknown[] },
    followUp: string
): UiStreamChunk[] {
    return [
        ...streamStart,
        { type: "tool-input-start", toolCallId: "call-1", toolName: "getProjects" },
        { type: "tool-input-available", toolCallId: "call-1", toolName: "getProjects", input },
        { type: "tool-output-available", toolCallId: "call-1", output },
        { type: "finish-step" },
        { type: "start-step" },
        ...textPart("text-2", followUp),
        ...streamEnd,
    ];
}

export function sseResponse(chunks: UiStreamChunk[]): Response {
    return new Response(sseBody(chunks), { status: 200, headers: SSE_HEADERS });
}

export function createControlledSseResponse() {
    const encoder = new TextEncoder();
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
        start(c) {
            controller = c;
        },
    });

    return {
        response: new Response(body, { status: 200, headers: SSE_HEADERS }),
        push(chunks: UiStreamChunk[]) {
            for (const chunk of chunks) {
                controller.enqueue(encoder.encode(encodeChunk(chunk)));
            }
        },
        finish() {
            controller.enqueue(encoder.encode(encodeChunk("[DONE]")));
            controller.close();
        },
        /** Mirrors real fetch: aborting the request errors the open body. */
        bindSignal(signal?: AbortSignal | null) {
            signal?.addEventListener("abort", () => {
                try {
                    controller.error(new DOMException("Aborted", "AbortError"));
                } catch {
                    // A closed ReadableStreamDefaultController throws on error().
                }
            });
        },
    };
}
