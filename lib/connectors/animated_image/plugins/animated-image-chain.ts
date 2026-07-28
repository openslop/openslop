import {
	createDefaultConnector,
	type ConnectorRegistry,
} from "@/lib/connectors/registry";
import type {
	AnimatedImageGenerateParams,
	AssetResult,
	ConnectorPlugin,
} from "@/lib/connectors/types";
import { createDimensionsPlugin } from "../../plugins/dimensions";
import { createStillFramePlugin } from "./still-frame";

const STASH_KEY = "videoChain";

type VideoParams = Pick<
	AnimatedImageGenerateParams,
	"videoPrompt" | "duration" | "width" | "height"
>;

/** Animates the still frame the element's `:still` dependency produced. */
export function createVideoChainPlugin(
	registry: ConnectorRegistry,
): ConnectorPlugin<AnimatedImageGenerateParams, AssetResult> {
	return {
		name: "video-chain",
		beforeGenerate(params, ctx) {
			if (ctx) {
				ctx.data ??= {};
				ctx.data[STASH_KEY] = {
					videoPrompt: params.videoPrompt,
					duration: params.duration,
					width: params.width,
					height: params.height,
				} satisfies VideoParams;
			}
			return params;
		},
		async afterGenerate(result, ctx) {
			const stashed = ctx?.data?.[STASH_KEY] as VideoParams | undefined;
			if (!stashed?.videoPrompt) {
				throw new Error(
					"animated_image element is missing required videoPrompt attribute",
				);
			}
			if (!result.imageUrl) {
				throw new Error("animated_image chain expected a still frame");
			}
			const video = createDefaultConnector(registry, "video", []);
			const videoResult = await video.generate({
				prompt: stashed.videoPrompt,
				frameImages: [result.imageUrl],
				width: stashed.width,
				height: stashed.height,
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
	registry: ConnectorRegistry,
): ConnectorPlugin[] {
	return [
		createStillFramePlugin(),
		createDimensionsPlugin("video"),
		createVideoChainPlugin(registry),
	];
}
