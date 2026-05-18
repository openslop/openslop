import set from "lodash/fp/set";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { createConnector } from "../factory";
import type {
	AnimatedImageGenerateParams,
	AssetResult,
	ConnectorPlugin,
} from "../types";
import { buildImagePlugins } from "./imageChain";

const STASH_KEY = "videoPrompt";

export function createVideoChainPlugin(
	registry: ConnectorRegistry,
): ConnectorPlugin<AnimatedImageGenerateParams, AssetResult> {
	return {
		name: "video-chain",
		beforeGenerate(params, ctx) {
			const { videoPrompt, ...rest } = params;
			if (videoPrompt && ctx) {
				ctx.data ??= {};
				ctx.data[STASH_KEY] = videoPrompt;
			}
			return rest as AnimatedImageGenerateParams;
		},
		async afterGenerate(result, ctx) {
			const videoPrompt = ctx?.data?.[STASH_KEY] as string | undefined;
			if (!videoPrompt) {
				throw new Error(
					"animated_image element is missing required videoPrompt attribute",
				);
			}
			const { provider, config } = getDefaultConnector(registry, "video");
			const video = createConnector(
				"video",
				provider,
				set("plugins", [], config),
			);
			const videoResult = await video.generate({
				prompt: videoPrompt,
				frameImages: [result.url],
			});
			return {
				url: videoResult.url,
				durationSec: videoResult.durationSec,
				previewUrl: result.url,
			};
		},
	};
}

export function buildAnimatedImagePlugins(
	projectId: string,
	registry: ConnectorRegistry,
): ConnectorPlugin[] {
	return [...buildImagePlugins(projectId), createVideoChainPlugin(registry)];
}
