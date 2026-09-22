import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";

import { CHAT_REQUEST_LIMITS, validateChatRequest } from "./validate-chat-request";

function textMessage(text: string): UIMessage {
    return { id: crypto.randomUUID(), role: "user", parts: [{ type: "text", text }] };
}

describe("validateChatRequest", () => {
    it("accepts a normal conversation", () => {
        const result = validateChatRequest({ messages: [textMessage("What has Minn built?")] });
        expect(result).toMatchObject({ ok: true });
    });

    it("rejects a body with no messages array", () => {
        expect(validateChatRequest({})).toMatchObject({ ok: false });
        expect(validateChatRequest(null)).toMatchObject({ ok: false });
        expect(validateChatRequest({ messages: [] })).toMatchObject({ ok: false });
    });

    it("rejects a conversation with too many messages", () => {
        const messages = Array.from({ length: CHAT_REQUEST_LIMITS.maxMessages + 1 }, () =>
            textMessage("hi")
        );
        const result = validateChatRequest({ messages });
        expect(result).toMatchObject({ ok: false });
    });

    it("rejects a single message longer than the per-message cap", () => {
        const message = textMessage("a".repeat(CHAT_REQUEST_LIMITS.maxTextLengthPerMessage + 1));
        const result = validateChatRequest({ messages: [message] });
        expect(result).toMatchObject({ ok: false });
    });

    it("rejects a conversation whose combined text exceeds the total cap", () => {
        const chunk = "a".repeat(CHAT_REQUEST_LIMITS.maxTextLengthPerMessage);
        const messagesNeeded = Math.ceil(CHAT_REQUEST_LIMITS.maxTotalTextLength / chunk.length) + 1;
        const messages = Array.from(
            { length: Math.min(messagesNeeded, CHAT_REQUEST_LIMITS.maxMessages) },
            () => textMessage(chunk)
        );
        const result = validateChatRequest({ messages });
        expect(result).toMatchObject({ ok: false });
    });

    it("rejects a message with no parts array instead of throwing", () => {
        const result = validateChatRequest({ messages: [{ id: "1", role: "user" }] });
        expect(result).toMatchObject({ ok: false });
    });

    it("rejects a messages array containing a non-object entry", () => {
        expect(validateChatRequest({ messages: [null] })).toMatchObject({ ok: false });
        expect(validateChatRequest({ messages: ["hi"] })).toMatchObject({ ok: false });
    });
});
