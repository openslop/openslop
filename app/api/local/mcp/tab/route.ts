import type { NextRequest } from "next/server";
import { z } from "zod";
import { answer, attachTab, BridgeOutcomeSchema } from "@/lib/agent/mcp/relay";
import { localOnly } from "@/lib/api/local-only";
import { createSessionRouteHandler } from "@/lib/api/route-handler";
import { formatSSE, SSE_HEADERS } from "@/lib/api/sse";
import { withSession } from "@/lib/api/with-auth";

export const GET = localOnly((request: NextRequest) =>
	withSession("Agent bridge", async () => {
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				const detach = attachTab((call) =>
					controller.enqueue(encoder.encode(formatSSE(call))),
				);
				request.signal.addEventListener("abort", detach);
			},
		});
		return new Response(stream, { headers: SSE_HEADERS });
	}),
);

export const POST = localOnly(
	createSessionRouteHandler({
		schema: z.object({ id: z.uuid(), outcome: BridgeOutcomeSchema }),
		label: "Agent bridge answer",
		handle: async ({ input }) => {
			answer(input.id, input.outcome);
			return new Response(null, { status: 204 });
		},
	}),
);
