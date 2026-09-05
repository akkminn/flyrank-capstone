import { tool, type InferUITools, type UIDataTypes, type UIMessage } from "ai";
import { z } from "zod";

import { PROJECTS } from "@/lib/ai/projects-data";

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const portfolioChatTools = {
    getProjects: tool({
        description:
            'Look up Minn\'s real, currently-listed projects. Call this whenever asked about his projects, what he\'s built, or work examples — never answer from memory, since project details can change independently of this prompt. Pass a specific `name` to look up one project, or omit it to list all of them.',
        inputSchema: z.object({
            name: z
                .string()
                .optional()
                .describe(
                    'A specific project name to look up, e.g. "Study Buddy". Omit to list every project.'
                ),
        }),
        execute: async ({ name }) => {
            // Simulates realistic data-fetch latency so the tool's loading
            // state is actually visible in the UI, instead of resolving
            // instantly every time.
            await delay(600);

            if (!name) {
                return { projects: PROJECTS };
            }

            const match = PROJECTS.find(
                (project) => project.name.toLowerCase() === name.toLowerCase()
            );

            if (!match) {
                throw new Error(
                    `No project named "${name}" was found. Known projects: ${PROJECTS.map((project) => project.name).join(", ")}.`
                );
            }

            return { projects: [match] };
        },
    }),
};

export type PortfolioChatTools = InferUITools<typeof portfolioChatTools>;
export type PortfolioUIMessage = UIMessage<unknown, UIDataTypes, PortfolioChatTools>;
