import isEqual from "lodash/isEqual";
import { BaseAssetConnector } from "../asset-base";
import type { AttributeSchema } from "../attributes/schema";
import { ANIMATED_IMAGE_ATTRIBUTES } from "./attributes";
import { stillParamsFor } from "./params";
import type {
	AnimatedImageGenerateParams,
	AssetResult,
	PriorGeneration,
} from "../types";

function reusableStill(
	params: AnimatedImageGenerateParams,
	prior?: PriorGeneration,
): string | undefined {
	const imageUrl = prior?.result?.imageUrl;
	const inputs = prior?.resultInputs;
	if (!imageUrl || !inputs) return undefined;
	// The prior inherits the request's base model; a per-element model override
	// in its own attributes still wins, so a model change invalidates the still.
	const priorStill = stillParamsFor(params.model, {
		model: params.model,
		prompt: inputs.prompt,
		...inputs.attributes,
	});
	return isEqual(stillParamsFor(params.model, params), priorStill)
		? imageUrl
		: undefined;
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
