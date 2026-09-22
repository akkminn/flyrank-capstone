import { expect, test, type Page } from "@playwright/test";

import {
    SSE_HEADERS,
    errorReplyChunks,
    projectsReplyChunks,
    sseBody,
    textReplyChunks,
} from "../src/test/chat-stream";

const CHAT_ROUTE = "**/api/portfolio-chat";

const studyBuddy = {
    id: "study-buddy",
    name: "StudyBuddy",
    summary: "An AI-powered learning platform that turns class notes into quizzes.",
    stack: ["React", "Firebase"],
    status: "live",
    href: "/projects/studybuddy",
};

async function mockChatRoute(page: Page, replies: string[]) {
    const requests: { messages: { role: string; parts: { text?: string }[] }[] }[] = [];
    let call = 0;
    await page.route(CHAT_ROUTE, async (route) => {
        requests.push(route.request().postDataJSON());
        await route.fulfill({ status: 200, headers: SSE_HEADERS, body: replies[call++] });
    });
    return requests;
}

async function askAboutMe(page: Page, question: string) {
    await page.getByRole("button", { name: "Ask about me" }).click();
    await expect(page.getByRole("dialog", { name: "Ask about Minn" })).toBeVisible();
    await page.getByRole("textbox", { name: "Ask about Minn" }).fill(question);
    await page.getByRole("textbox", { name: "Ask about Minn" }).press("Enter");
}

test("a visitor asks about Minn's projects and follows a result to its page", async ({ page }) => {
    const requests = await mockChatRoute(page, [
        sseBody(
            projectsReplyChunks(
                {},
                { projects: [studyBuddy] },
                "He built StudyBuddy, an AI study platform."
            )
        ),
    ]);

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Aung Ko Ko Minn" })).toBeVisible();

    await askAboutMe(page, "What has Minn built?");

    const dialog = page.getByRole("dialog", { name: "Ask about Minn" });
    await expect(dialog.getByText("He built StudyBuddy, an AI study platform.", { exact: true })).toBeVisible();
    const card = dialog.getByRole("link", { name: /StudyBuddy/ });
    await expect(card).toHaveAttribute("href", "/projects/studybuddy");

    expect(requests).toHaveLength(1);
    expect(requests[0].messages.at(-1)?.parts[0].text).toBe("What has Minn built?");

    // Following the card is a Next.js client-side navigation, so the
    // conversation stays open on the destination page.
    await card.click();
    await expect(page).toHaveURL(/\/projects\/studybuddy$/);
    await expect(page.getByRole("heading", { name: "StudyBuddy", level: 1 })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Ask about Minn" })).toContainText(
        "He built StudyBuddy, an AI study platform."
    );
});

test("a failed reply shows a recoverable error, and retrying gets the answer", async ({ page }) => {
    const requests = await mockChatRoute(page, [
        sseBody(
            errorReplyChunks(
                "Ask about me can't reach Gemini right now. Please try again in a moment."
            )
        ),
        sseBody(textReplyChunks("Minn studies ICT at Rangsit University.")),
    ]);

    await page.goto("/");
    await askAboutMe(page, "Where does Minn study?");

    // Scoped to the chat: Next.js keeps its own role="alert" route announcer
    // on every page, so an unscoped lookup would match two elements.
    const chatAlert = page.getByRole("dialog", { name: "Ask about Minn" }).getByRole("alert");
    await expect(chatAlert).toContainText("can't reach Gemini right now");

    await page.getByRole("button", { name: "Try again" }).click();

    await expect(page.getByText("Minn studies ICT at Rangsit University.", { exact: true })).toBeVisible();
    await expect(chatAlert).toHaveCount(0);
    expect(requests).toHaveLength(2);
});
