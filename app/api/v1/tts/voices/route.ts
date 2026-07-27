import { NextResponse } from "next/server";
import { getTTSProvider } from "@/lib/api/providers";
import { createApiQueryRouteHandler } from "@/lib/api/route-handler";
import { voiceSearchParamsSchema } from "@/lib/project/types";

export const GET = createApiQueryRouteHandler({
	schema: voiceSearchParamsSchema,
	label: "Voice search",
	handle: async ({ input }) => {
		const voices = await getTTSProvider().search(input);
		return NextResponse.json({ voices });
	},
});
