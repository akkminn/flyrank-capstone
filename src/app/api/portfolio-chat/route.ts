import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { portfolioChatModel, portfolioChatSystemPrompt } from "@/lib/ai/config";

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
        model: portfolioChatModel,
        system: portfolioChatSystemPrompt,
        messages: await convertToModelMessages(messages),
        abortSignal: req.signal,
    });

    return result.toUIMessageStreamResponse();
}
