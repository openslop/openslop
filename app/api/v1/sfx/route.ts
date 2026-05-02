import { z } from "zod";
import { getSFXProvider } from "@/lib/api/providers";
import { bodySchema, createRouteHandler } from "@/lib/api/route-handler";
import { SFX_MODELS } from "@/lib/connectors/sfx/openslop/models";

const schema = bodySchema(SFX_MODELS, {
	durationSeconds: z.number().optional(),
});

export const POST = createRouteHandler({
	schema,
	getProvider: getSFXProvider,
	label: "SFX generation",
});
