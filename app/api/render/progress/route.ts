import { NextResponse } from "next/server";
import { createSessionRouteHandler } from "@/lib/api/route-handler";
import { RenderHandle, type RenderProgress } from "@/lib/render/render-api";
import { renderBackend } from "@/lib/render/render-backend";

export const POST = createSessionRouteHandler({
	schema: RenderHandle,
	label: "render/progress",
	handle: async ({ input }) => {
		const backend = await renderBackend();
		return NextResponse.json<RenderProgress>(await backend.progress(input));
	},
});
