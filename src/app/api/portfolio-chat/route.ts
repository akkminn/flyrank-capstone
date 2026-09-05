import {
    convertToModelMessages,
    createUIMessageStream,
    createUIMessageStreamResponse,
    streamText,
    type UIMessage,
} from "ai";

import { portfolioChatModels, portfolioChatSystemPrompt } from "@/lib/ai/config";

// Allow streaming responses up to 30 seconds instead of Vercel's default 10s.
export const maxDuration = 30;

function toFriendlyErrorMessage(error: unknown): string {
    console.error("[portfolio-chat]", error);
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
            abortSignal: req.signal,
        });

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
                if (part.type === "text-delta") break;
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

        return result.toUIMessageStreamResponse({ onError: toFriendlyErrorMessage });
    }

    return createUIMessageStreamResponse({
        stream: createUIMessageStream({
            execute: () => {
                throw lastError;
            },
            onError: toFriendlyErrorMessage,
        }),
    });
}
