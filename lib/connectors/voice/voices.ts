import { findAsset } from "@/lib/canvas/assets";
import type { CanvasElement } from "@/lib/canvas/types";
import type { Dependency } from "@/lib/generation/declare";
import type { AssetResult, PluginContext } from "../types";

const voiceLabel = (name: string) => `${name}'s voice`;

/** The speakers' voices, generated first so each has found one. */
export const speakerVoices =
	(speakers: (element: CanvasElement) => string[]): Dependency =>
	(element, { canvas }) =>
		Object.fromEntries(
			speakers(element).map((name) => [
				voiceLabel(name),
				findAsset(canvas, "asset_voice", name),
			]),
		);

export const foundVoice = (
	ctx: PluginContext,
	name: string,
): AssetResult | undefined => ctx.dependencies?.[voiceLabel(name)];
