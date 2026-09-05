import {
    AISDKError,
    convertToModelMessages,
    createUIMessageStream,
    createUIMessageStreamResponse,
    stepCountIs,
    streamText,
    type UIMessage,
} from "ai";

import { portfolioChatModels, portfolioChatSystemPrompt } from "@/lib/ai/config";
import { portfolioChatTools } from "@/lib/ai/tools";

// Allow streaming responses up to 30 seconds instead of Vercel's default 10s.
export const maxDuration = 30;

// This one `onError` handles both top-level stream failures (rate limits,
// provider outages — SDK-generated `AISDKError`s) and our own tools'
// `execute` throwing. Only the former needs hiding: those can carry request
// bodies, stack traces, or which model/quota was hit. A tool's own thrown
// `Error` is something we wrote ourselves (e.g. "no project named X"), so
// it's already safe and useful to show as-is.
function toFriendlyErrorMessage(error: unknown): string {
    console.error("[portfolio-chat]", error);
    if (!AISDKError.isInstance(error) && error instanceof Error) {
        return error.message;
    }
    return "Ask about me can't reach Gemini right now. Please try again in a moment.";
}

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const modelMessages = await convertToModelMessages(messages);

    let lastError: unknown;

    for (const model of portfolioChatModels) {
        const result = streamText({
            model,
            system: portfolioChatSystemPrompt,
            messages: modelMessages,
            tools: portfolioChatTools,
            // Lets the model call a tool, see its result, and then write a
            // follow-up reply about it — a plain single step would stop
            // right after the tool call with no commentary.
            stopWhen: stepCountIs(3),
            abortSignal: req.signal,
        });

        // Peek parts before committing to this model's stream. An API-call
        // failure (rate limit, deprecated model, ...) doesn't reject the
        // reader — the AI SDK instead delivers it in-band as a `{ type:
        // "error" }` part — so we read past the synthetic step/start parts
        // looking for either real activity (text or a tool call starting —
        // success) or that error part (fall through to the next model),
        // instead of sending a half-broken response to the client.
        const reader = result.fullStream.getReader();
        let failed = false;
        try {
            while (true) {
                const { done, value: part } = await reader.read();
                if (done) break;
                if (part.type === "error") {
                    failed = true;
                    lastError = part.error;
                    break;
                }
                if (part.type === "text-delta" || part.type === "tool-input-start") break;
            }
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                throw error;
            }
            failed = true;
            lastError = error;
        } finally {
            reader.releaseLock();
        }

        if (failed) continue;

        // Covers the rare case where a model passes the peek above (it
        // started responding) but then fails partway through the stream.
        return result.toUIMessageStreamResponse({ onError: toFriendlyErrorMessage });
    }

    // Every model failed. Respond with a normal, well-formed UI message
    // stream containing one friendly error part, instead of throwing and
    // letting Next.js turn it into a generic, unstyled 500 page — the
    // client handles this exactly like a mid-stream error.
    return createUIMessageStreamResponse({
        stream: createUIMessageStream({
            execute: () => {
                throw lastError;
            },
            onError: toFriendlyErrorMessage,
        }),
    });
}
