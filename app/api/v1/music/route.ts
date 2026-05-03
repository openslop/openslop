import { z } from "zod";
import { getMusicProvider } from "@/lib/api/providers";
import { bodySchema, createRouteHandler } from "@/lib/api/route-handler";
import { MUSIC_MODELS } from "@/lib/connectors/music/openslop/models";

const schema = bodySchema(MUSIC_MODELS, {
	durationSeconds: z.number().optional(),
});

export const POST = createRouteHandler({
	schema,
	getProvider: getMusicProvider,
	label: "Music generation",
});
