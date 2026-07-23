import isEqual from "lodash/isEqual";
import omit from "lodash/omit";
import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { ANIMATED_IMAGE_ATTRIBUTES } from "./attributes";
import type {
	AnimatedImageGenerateParams,
	AssetResult,
	PriorGeneration,
} from "../types";

/** Params that drive only the video step; the still image is independent of them. */
export const VIDEO_ONLY_KEYS = [
	"videoPrompt",
	"videoWidth",
	"videoHeight",
	"duration",
] as const;

// The still is a pure function of the non-video params.
const stillParams = (params: Record<string, unknown>) =>
	omit(params, VIDEO_ONLY_KEYS);

function reusableStill(
	params: AnimatedImageGenerateParams,
	prior?: PriorGeneration,
): string | undefined {
	const imageUrl = prior?.result?.imageUrl;
	const inputs = prior?.resultInputs;
	if (!imageUrl || !inputs) return undefined;
	// The prior inherits the request's base model; a per-element model override
	// in its own attributes still wins, so a model change invalidates the still.
	const priorStill = stillParams({
		model: params.model,
		prompt: inputs.prompt,
		...inputs.attributes,
	});
	return isEqual(stillParams(params), priorStill) ? imageUrl : undefined;
}

export abstract class BaseAnimatedImageConnector extends BaseAssetConnector<
	AnimatedImageGenerateParams,
	AssetResult
> {
	readonly type = "animated_image" as const;
	readonly assetKey = "image" as const;

	static attributesFor(_model?: string): AttributeSchema {
		return ANIMATED_IMAGE_ATTRIBUTES;
	}

	async generate(
		params: AnimatedImageGenerateParams,
		prior?: PriorGeneration,
	): Promise<AssetResult> {
		const reuseImageUrl = reusableStill(params, prior);
		return super.generate(
			reuseImageUrl ? { ...params, reuseImageUrl } : params,
		);
	}

	// The video chain animates whatever still `_generate` returns, so reusing a
	// prior frame here skips still generation without touching the video step.
	protected async _generate(
		params: AnimatedImageGenerateParams,
	): Promise<AssetResult> {
		if (params.reuseImageUrl) {
			return { imageUrl: params.reuseImageUrl, durationSec: 0 };
		}
		return super._generate(params);
	}
}
