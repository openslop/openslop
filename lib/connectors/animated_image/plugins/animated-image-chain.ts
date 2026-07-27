import {
	createDefaultConnector,
	type ConnectorRegistry,
} from "@/lib/connectors/registry";
import { buildImagePlugins } from "@/lib/connectors/image/plugins/imageChain";
import type {
	AnimatedImageGenerateParams,
	AssetResult,
	ConnectorPlugin,
} from "@/lib/connectors/types";
import { stillParamsFor, videoParamsFor, type VideoParams } from "../params";

const STASH_KEY = "videoChain";

export function createVideoChainPlugin(
	registry: ConnectorRegistry,
): ConnectorPlugin<AnimatedImageGenerateParams, AssetResult> {
	return {
		name: "video-chain",
		beforeGenerate(params, ctx) {
			const video = videoParamsFor(params.model, params);
			if (video.videoPrompt && ctx) {
				ctx.data ??= {};
				ctx.data[STASH_KEY] = video;
			}
			return stillParamsFor(params.model, params);
		},
		async afterGenerate(result, ctx) {
			const stashed = ctx?.data?.[STASH_KEY] as VideoParams | undefined;
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
			const video = createDefaultConnector(registry, "video", []);
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
