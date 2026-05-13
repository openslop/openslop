import { getVideoProvider } from "@/lib/api/providers";
import {
	optionalFrameImages,
	optionalImageDimensions,
	optionalReferenceImages,
	optionalVideoDuration,
} from "@/lib/api/request-schema-fields";
import { bodySchema, createRouteHandler } from "@/lib/api/route-handler";
import { VIDEO_MODELS } from "@/lib/connectors/video/openslop/models";

const schema = bodySchema(VIDEO_MODELS, {
	...optionalReferenceImages,
	...optionalFrameImages,
	...optionalVideoDuration,
	...optionalImageDimensions,
});

export const POST = createRouteHandler({
	schema,
	getProvider: getVideoProvider,
	label: "Video submission",
});
