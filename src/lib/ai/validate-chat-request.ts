import type { UIMessage } from "ai";

export const CHAT_REQUEST_LIMITS = {
    maxMessages: 24,
    maxTextLengthPerMessage: 4000,
    maxTotalTextLength: 16000,
};

export type ChatRequestValidation =
    | { ok: true; messages: UIMessage[] }
    | { ok: false; error: string };

function textLength(message: UIMessage): number {
    return message.parts.reduce(
        (total, part) => total + (part.type === "text" ? part.text.length : 0),
        0
    );
}

function hasParts(message: unknown): message is UIMessage {
    return (
        typeof message === "object" &&
        message !== null &&
        Array.isArray((message as { parts?: unknown }).parts)
    );
}

export function validateChatRequest(body: unknown): ChatRequestValidation {
    if (
        typeof body !== "object" ||
        body === null ||
        !("messages" in body) ||
        !Array.isArray((body as { messages: unknown }).messages)
    ) {
        return { ok: false, error: "Malformed request." };
    }

    const messages = (body as { messages: unknown[] }).messages;

    if (messages.length === 0) {
        return { ok: false, error: "Malformed request." };
    }

    if (messages.length > CHAT_REQUEST_LIMITS.maxMessages) {
        return {
            ok: false,
            error: "This conversation has gotten long — refresh the chat to keep going.",
        };
    }

    if (!messages.every(hasParts)) {
        return { ok: false, error: "Malformed request." };
    }

    let totalLength = 0;
    for (const message of messages) {
        const length = textLength(message);
        if (length > CHAT_REQUEST_LIMITS.maxTextLengthPerMessage) {
            return { ok: false, error: "That message is too long. Try asking something shorter." };
        }
        totalLength += length;
    }

    if (totalLength > CHAT_REQUEST_LIMITS.maxTotalTextLength) {
        return {
            ok: false,
            error: "This conversation has gotten long — refresh the chat to keep going.",
        };
    }

    return { ok: true, messages };
}
