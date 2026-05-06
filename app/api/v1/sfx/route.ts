import { getSFXProvider } from "@/lib/api/providers";
import { optionalDurationSeconds } from "@/lib/api/request-schema-fields";
import { bodySchema, createRouteHandler } from "@/lib/api/route-handler";
import { SFX_MODELS } from "@/lib/connectors/sfx/openslop/models";

const schema = bodySchema(SFX_MODELS, optionalDurationSeconds);

export const POST = createRouteHandler({
	schema,
	getProvider: getSFXProvider,
	label: "SFX generation",
});
