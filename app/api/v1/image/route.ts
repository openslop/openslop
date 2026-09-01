import { createAssetRouteHandlers } from "@/lib/api/asset-routes";
import { bodySchema, IMAGE_FIELDS } from "@/lib/api/generation-schema";

export const { POST } = createAssetRouteHandlers({
	connectorType: "image",
	schema: bodySchema("image", "hosted", IMAGE_FIELDS),
	label: "Image generation",
});
