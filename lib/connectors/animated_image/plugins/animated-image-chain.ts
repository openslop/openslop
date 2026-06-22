import set from "lodash/fp/set";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { createConnector } from "@/lib/connectors/factory";
import { buildImagePlugins } from "@/lib/connectors/image/plugins/imageChain";
import type {
	AnimatedImageGenerateParams,
	AssetResult,
	ConnectorPlugin,
} from "@/lib/connectors/types";

const STASH_KEY = "videoChain";

type Stashed = {
	videoPrompt: string;
	videoWidth?: number;
	videoHeight?: number;
	duration?: number;
};

export function createVideoChainPlugin(
	registry: ConnectorRegistry,
): ConnectorPlugin<AnimatedImageGenerateParams, AssetResult> {
	return {
		name: "video-chain",
		beforeGenerate(params, ctx) {
			const { videoPrompt, videoWidth, videoHeight, duration, ...rest } =
				params;
			if (videoPrompt && ctx) {
				ctx.data ??= {};
				ctx.data[STASH_KEY] = {
					videoPrompt,
					videoWidth,
					videoHeight,
					duration,
				} satisfies Stashed;
			}
			return rest as AnimatedImageGenerateParams;
		},
		async afterGenerate(result, ctx) {
			const stashed = ctx?.data?.[STASH_KEY] as Stashed | undefined;
			if (!stashed?.videoPrompt) {
				throw new Error(
					"animated_image element is missing required videoPrompt attribute",
				);
			}
			if (!result.imageUrl) {
				throw new Error(
					"animated_image chain expected an imageUrl from the still-image generation",
				);
			}
			const { provider, config } = getDefaultConnector(registry, "video");
			const video = createConnector(
				"video",
				provider,
				set("plugins", [], config),
			);
			const videoResult = await video.generate({
				prompt: stashed.videoPrompt,
				frameImages: [result.imageUrl],
				width: stashed.videoWidth,
				height: stashed.videoHeight,
				duration: stashed.duration,
			});
			return {
				imageUrl: result.imageUrl,
				videoUrl: videoResult.videoUrl,
				durationSec: videoResult.durationSec,
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
