import { NextResponse } from "next/server";
import { createSessionRouteHandler } from "@/lib/api/route-handler";
import { RenderRequest, type RenderHandle } from "@/lib/render/render-api";
import { renderBackend } from "@/lib/render/render-backend";

export const POST = createSessionRouteHandler({
	schema: RenderRequest,
	label: "render",
	handle: async ({ input }) => {
		const backend = await renderBackend();
		return NextResponse.json<RenderHandle>(await backend.start(input));
	},
});
