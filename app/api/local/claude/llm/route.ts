import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionRouteHandler } from "@/lib/api/route-handler";
import { badRequest } from "@/lib/api/response";
import { formatSSE } from "@/lib/api/sse";
import { errorMessage } from "@/lib/errors";
import { localOnly } from "@/lib/local-claude/access";
import { generateWithClaude } from "@/lib/local-claude/generate";
import { LocalClaudeModelSchema } from "@/lib/local-claude/schema";

export const POST = localOnly(
	createSessionRouteHandler({
		schema: LocalClaudeModelSchema.extend({
			prompt: z.string().min(1).max(200_000),
			systemPrompt: z
				.string()
				.max(100_000)
				.default("Return the requested text."),
			stream: z.boolean().default(false),
		}),
		label: "Local Claude generation",
		handle: async ({ user, input, request }) => {
			try {
				const text = await generateWithClaude(
					user.id,
					input.prompt,
					input.systemPrompt,
					request.signal,
				);
				return input.stream
					? new Response(formatSSE({ text, done: true }), {
							headers: {
								"Content-Type": "text/event-stream",
								"Cache-Control": "no-store",
							},
						})
					: NextResponse.json({ text, model: input.model });
			} catch (error) {
				return badRequest(errorMessage(error));
			}
		},
	}),
);
