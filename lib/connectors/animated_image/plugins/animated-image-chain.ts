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

const STILL_IMAGE_FAILED_MESSAGE =
	"Couldn't animate: the video provider couldn't use the still image. Try regenerating the image.";

/** Shape of a failed Runware task response — see IErrorResponse in @runware/sdk-js. */
type RunwareApiError = {
	error?: {
		code?: string;
		parameter?: string;
	};
};

// Marks a video-provider failure as belonging to the still-image frame we
// handed it, rather than an unrelated video-generation failure (rate limit,
// auth, model outage, ...) that shouldn't be misattributed to the image step.
// Matches Runware's structured error.code/error.parameter directly rather
// than string-matching the serialized error, which is sturdier against
// unrelated fields that happen to mention "frameImages" in passing.
function isFrameImageFailure(err: unknown): boolean {
	if (typeof err !== "object" || err === null) return false;
	const apiError = (err as RunwareApiError).error;
	return (
		apiError?.parameter === "inputs.frameImages" ||
		apiError?.code === "invalidValueUploadFailed"
	);
}

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
			let videoResult;
			try {
				videoResult = await video.generate({
					prompt: stashed.videoPrompt,
					frameImages: [result.imageUrl],
					width: stashed.videoWidth,
					height: stashed.videoHeight,
					duration: stashed.duration,
				});
			} catch (err) {
				if (isFrameImageFailure(err)) {
					// Raw provider detail is kept on `cause` (surfaced in server/console
					// logs via handleJobError's console.error) rather than appended to
					// the user-facing message, which the red banner renders verbatim.
					throw new Error(STILL_IMAGE_FAILED_MESSAGE, { cause: err });
				}
				throw err;
			}
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
