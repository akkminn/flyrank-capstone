import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";

import { PortfolioChat } from "@/components/portfolio-chat";
import {
    createControlledSseResponse,
    errorReplyChunks,
    projectsReplyChunks,
    sseResponse,
    textReplyChunks,
} from "@/test/chat-stream";
import { lastUserText, mockChatRoute } from "@/test/mock-chat-route";

// The conversation is a lazy chunk, and its first import (the AI SDK plus the
// icon package) is slow to transform under parallel test load. Load it once up
// front so each test waits on behaviour, not on a cold import.
beforeAll(async () => {
    await import("@/components/portfolio-chat-conversation");
}, 60_000);

async function openChat() {
    const user = userEvent.setup();
    render(<PortfolioChat />);
    await user.click(screen.getByRole("button", { name: "Ask about me" }));
    // The conversation is a lazy chunk, so wait for it to arrive.
    await screen.findByRole("textbox", { name: "Ask about Minn" });
    return user;
}

const composer = () => screen.getByRole("textbox", { name: "Ask about Minn" });
const sendButton = () => screen.getByRole("button", { name: "Send" });

const studyBuddy = {
    id: "study-buddy",
    name: "StudyBuddy",
    summary: "Turns class notes into quizzes.",
    stack: ["React"],
    status: "live",
    href: "/projects/studybuddy",
};

describe("PortfolioChat: opening and the empty state", () => {
    it("starts closed and opens a dialog offering suggested questions", async () => {
        render(<PortfolioChat />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Ask about me" }));

        expect(screen.getByRole("dialog", { name: "Ask about Minn" })).toBeInTheDocument();
        expect(
            await screen.findByRole("button", { name: "What has Minn built?" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "What's Minn working on right now?" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "What's this site built with?" })
        ).toBeInTheDocument();
    });

    it("sends a suggestion as the visitor's message when it's clicked", async () => {
        const fetchMock = mockChatRoute(() => sseResponse(textReplyChunks("He built two apps.")));
        const user = await openChat();

        await user.click(screen.getByRole("button", { name: "What has Minn built?" }));

        expect(await screen.findByText("He built two apps.")).toBeInTheDocument();
        expect(lastUserText(fetchMock)).toBe("What has Minn built?");
        // The empty state gives way to the conversation.
        expect(screen.queryByText(/or try one of these/)).not.toBeInTheDocument();
    });

    it("closes from the panel's close button", async () => {
        const user = await openChat();

        await user.click(screen.getByRole("button", { name: "Close chat" }));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});

describe("PortfolioChat: composer form validation", () => {
    it("keeps Send disabled for empty and whitespace-only input, enabling it for real text", async () => {
        const user = await openChat();
        expect(sendButton()).toBeDisabled();

        await user.type(composer(), "   ");
        expect(sendButton()).toBeDisabled();

        await user.type(composer(), "hello");
        expect(sendButton()).toBeEnabled();
    });

    it("sends the trimmed text and clears the field", async () => {
        const fetchMock = mockChatRoute(() => sseResponse(textReplyChunks("Hi there.")));
        const user = await openChat();

        await user.type(composer(), "  Where does Minn study?  ");
        await user.click(sendButton());

        expect(await screen.findByText("Hi there.")).toBeInTheDocument();
        expect(lastUserText(fetchMock)).toBe("Where does Minn study?");
        expect(composer()).toHaveValue("");
    });

    it("submits on Enter but treats Shift+Enter as a line break", async () => {
        const fetchMock = mockChatRoute(() => sseResponse(textReplyChunks("Sure.")));
        const user = await openChat();

        await user.type(composer(), "first line{Shift>}{Enter}{/Shift}second line");
        expect(fetchMock).not.toHaveBeenCalled();
        expect(composer()).toHaveValue("first line\nsecond line");

        await user.keyboard("{Enter}");
        expect(await screen.findByText("Sure.")).toBeInTheDocument();
        expect(lastUserText(fetchMock)).toBe("first line\nsecond line");
    });

    it("won't send a second message while a reply is still in flight", async () => {
        const controlled = createControlledSseResponse();
        const fetchMock = mockChatRoute(() => controlled.response);
        const user = await openChat();

        await user.type(composer(), "first question");
        await user.click(sendButton());
        await screen.findByRole("button", { name: "Stop" });

        await user.type(composer(), "second question{Enter}");

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});

describe("PortfolioChat: pending, streaming and finished states", () => {
    it("shows a thinking indicator and a Stop button until the first token arrives", async () => {
        const controlled = createControlledSseResponse();
        mockChatRoute(() => controlled.response);
        const user = await openChat();

        await user.type(composer(), "Hello?");
        await user.click(sendButton());

        expect(await screen.findByRole("status")).toHaveTextContent("Assistant is thinking.");
        expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Send" })).not.toBeInTheDocument();
        expect(screen.getByText("Hello?")).toBeInTheDocument();
    });

    it("renders text as it streams in, then hands the composer back when done", async () => {
        const controlled = createControlledSseResponse();
        mockChatRoute(() => controlled.response);
        const user = await openChat();

        await user.type(composer(), "Tell me about Minn");
        await user.click(sendButton());
        expect(await screen.findByRole("status")).toHaveTextContent("Assistant is thinking.");

        await act(async () => {
            controlled.push([
                { type: "start" },
                { type: "start-step" },
                { type: "text-start", id: "t1" },
                { type: "text-delta", id: "t1", delta: "Minn builds" },
            ]);
        });

        expect(await screen.findByText("Minn builds")).toBeInTheDocument();
        await waitFor(() =>
            expect(screen.getByRole("status")).toHaveTextContent("Assistant is replying.")
        );
        // Still streaming: the reply is partial and can still be stopped.
        expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();

        await act(async () => {
            controlled.push([{ type: "text-delta", id: "t1", delta: " web apps." }]);
        });
        expect(await screen.findByText("Minn builds web apps.")).toBeInTheDocument();

        await act(async () => {
            controlled.push([
                { type: "text-end", id: "t1" },
                { type: "finish-step" },
                { type: "finish", finishReason: "stop" },
            ]);
            controlled.finish();
        });

        expect(await screen.findByRole("button", { name: "Send" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Stop" })).not.toBeInTheDocument();
    });

    it("keeps the partial reply and returns to a usable state when the visitor stops generation", async () => {
        const controlled = createControlledSseResponse();
        mockChatRoute((signal) => {
            controlled.bindSignal(signal);
            return controlled.response;
        });
        const user = await openChat();

        await user.type(composer(), "Write a long answer");
        await user.click(sendButton());
        await act(async () => {
            controlled.push([
                { type: "start" },
                { type: "start-step" },
                { type: "text-start", id: "t1" },
                { type: "text-delta", id: "t1", delta: "Here is the start" },
            ]);
        });
        await screen.findByText("Here is the start");

        await user.click(screen.getByRole("button", { name: "Stop" }));

        expect(await screen.findByRole("button", { name: "Send" })).toBeInTheDocument();
        expect(screen.getByText("Here is the start")).toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
});

describe("PortfolioChat: error states", () => {
    it("shows the route's message as an alert and retries the same question on 'Try again'", async () => {
        let attempt = 0;
        const fetchMock = mockChatRoute(() =>
            attempt++ === 0
                ? sseResponse(
                      errorReplyChunks(
                          "Ask about me can't reach Gemini right now. Please try again in a moment."
                      )
                  )
                : sseResponse(textReplyChunks("Back online."))
        );
        const user = await openChat();

        await user.type(composer(), "Are you there?");
        await user.click(sendButton());

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Ask about me can't reach Gemini right now."
        );

        await user.click(screen.getByRole("button", { name: "Try again" }));

        expect(await screen.findByText("Back online.")).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(lastUserText(fetchMock, 1)).toBe("Are you there?");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("replaces a raw browser network error with a plain-language message", async () => {
        mockChatRoute(() => {
            throw new TypeError("Failed to fetch");
        });
        const user = await openChat();

        await user.type(composer(), "Hello");
        await user.click(sendButton());

        const alert = await screen.findByRole("alert");
        expect(alert).toHaveTextContent("Couldn't reach the server. Check your connection");
        expect(alert).not.toHaveTextContent("Failed to fetch");
        expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    });

    it("never dumps an HTML error page into the conversation", async () => {
        mockChatRoute(
            () =>
                new Response("<!DOCTYPE html><html><body><h1>404</h1></body></html>", {
                    status: 404,
                    headers: { "content-type": "text/html" },
                })
        );
        const user = await openChat();

        await user.type(composer(), "Hello");
        await user.click(sendButton());

        const alert = await screen.findByRole("alert");
        expect(alert).toHaveTextContent("Couldn't reach the server.");
        expect(alert).not.toHaveTextContent("DOCTYPE");
    });
});

describe("PortfolioChat: tool calls inside a reply", () => {
    it("walks a getProjects call from lookup to project cards, then the follow-up text", async () => {
        const controlled = createControlledSseResponse();
        mockChatRoute(() => controlled.response);
        const user = await openChat();

        await user.click(screen.getByRole("button", { name: "What has Minn built?" }));
        await act(async () => {
            controlled.push([
                { type: "start" },
                { type: "start-step" },
                { type: "tool-input-start", toolCallId: "call-1", toolName: "getProjects" },
            ]);
        });
        expect(await screen.findByText("Preparing to look up projects…")).toBeInTheDocument();

        await act(async () => {
            controlled.push([
                {
                    type: "tool-input-available",
                    toolCallId: "call-1",
                    toolName: "getProjects",
                    input: {},
                },
            ]);
        });
        expect(await screen.findByText("Looking up Minn's projects…")).toBeInTheDocument();

        await act(async () => {
            controlled.push([
                {
                    type: "tool-output-available",
                    toolCallId: "call-1",
                    output: { projects: [studyBuddy] },
                },
            ]);
        });
        expect(await screen.findByRole("link", { name: /StudyBuddy/ })).toHaveAttribute(
            "href",
            "/projects/studybuddy"
        );
        expect(screen.queryByText("Looking up Minn's projects…")).not.toBeInTheDocument();

        await act(async () => {
            controlled.push([
                { type: "finish-step" },
                { type: "start-step" },
                { type: "text-start", id: "t2" },
                { type: "text-delta", id: "t2", delta: "That's the one he built." },
                { type: "text-end", id: "t2" },
                { type: "finish-step" },
                { type: "finish", finishReason: "stop" },
            ]);
            controlled.finish();
        });
        expect(await screen.findByText("That's the one he built.")).toBeInTheDocument();
    });

    it("renders a complete tool reply (cards plus commentary) in one go", async () => {
        mockChatRoute(() =>
            sseResponse(
                projectsReplyChunks({}, { projects: [studyBuddy] }, "He built StudyBuddy.")
            )
        );
        const user = await openChat();

        await user.click(screen.getByRole("button", { name: "What has Minn built?" }));

        expect(await screen.findByText("He built StudyBuddy.")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /StudyBuddy/ })).toBeInTheDocument();
    });
});

describe("PortfolioChat: keyboard and screen-reader behaviour", () => {
    it("moves focus into the composer when opened, and Escape closes it and returns focus to the launcher", async () => {
        const user = await openChat();
        expect(composer()).toHaveFocus();

        await user.keyboard("{Escape}");

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Ask about me" })).toHaveFocus();
    });

    it("keeps the conversation when the dialog is closed and reopened", async () => {
        mockChatRoute(() => sseResponse(textReplyChunks("He built two apps.")));
        const user = await openChat();
        await user.type(composer(), "What has Minn built?{Enter}");
        expect(await screen.findByText("He built two apps.")).toBeInTheDocument();

        await user.keyboard("{Escape}");
        await user.click(screen.getByRole("button", { name: "Ask about me" }));

        expect(screen.getByText("He built two apps.")).toBeInTheDocument();
        expect(composer()).toHaveFocus();
    });

    it("reaches Stop with Tab from the composer and stops with the keyboard, without losing focus", async () => {
        const controlled = createControlledSseResponse();
        mockChatRoute(() => controlled.response);
        const user = await openChat();
        await user.type(composer(), "Tell me about Minn{Enter}");
        await screen.findByRole("button", { name: "Stop" });

        await user.tab();
        expect(screen.getByRole("button", { name: "Stop" })).toHaveFocus();

        await user.keyboard("{Enter}");

        expect(await screen.findByRole("button", { name: "Send" })).toBeInTheDocument();
        // The button that had focus became a disabled Send; focus must not fall to <body>.
        expect(composer()).toHaveFocus();
        expect(screen.getByRole("status")).toHaveTextContent("Stopped.");
    });

    it("announces the state politely and the finished reply once, not every streamed token", async () => {
        const controlled = createControlledSseResponse();
        mockChatRoute(() => controlled.response);
        const user = await openChat();

        const status = screen.getByRole("status");
        expect(status).toHaveAttribute("aria-live", "polite");
        // The message list is a log, but it must not itself announce each token.
        expect(screen.getByRole("log", { name: "Conversation" })).toHaveAttribute("aria-live", "off");

        await user.type(composer(), "Hello?{Enter}");
        await waitFor(() => expect(status).toHaveTextContent("Assistant is thinking."));

        await act(async () => {
            controlled.push([
                { type: "start" },
                { type: "start-step" },
                { type: "text-start", id: "t1" },
                { type: "text-delta", id: "t1", delta: "Minn builds " },
            ]);
        });
        await waitFor(() => expect(status).toHaveTextContent("Assistant is replying."));
        expect(status).not.toHaveTextContent("Minn builds");

        await act(async () => {
            controlled.push([
                { type: "text-delta", id: "t1", delta: "web apps." },
                { type: "text-end", id: "t1" },
                { type: "finish-step" },
                { type: "finish", finishReason: "stop" },
            ]);
            controlled.finish();
        });
        await waitFor(() => expect(status).toHaveTextContent("Assistant replied: Minn builds web apps."));
    });
});
