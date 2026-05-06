import { getMusicProvider } from "@/lib/api/providers";
import { optionalDurationSeconds } from "@/lib/api/request-schema-fields";
import { bodySchema, createRouteHandler } from "@/lib/api/route-handler";
import { MUSIC_MODELS } from "@/lib/connectors/music/openslop/models";

const schema = bodySchema(MUSIC_MODELS, optionalDurationSeconds);

export const POST = createRouteHandler({
	schema,
	getProvider: getMusicProvider,
	label: "Music generation",
});
