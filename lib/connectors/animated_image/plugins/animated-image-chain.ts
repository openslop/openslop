import { createDimensionsPlugin } from "@/lib/connectors/plugins/dimensions";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { createStillFramePlugin } from "./still-frame";

export function buildAnimatedImagePlugins(): ConnectorPlugin[] {
	return [createStillFramePlugin(), createDimensionsPlugin("video")];
}
