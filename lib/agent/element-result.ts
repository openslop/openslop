import compact from "lodash/compact";
import { z } from "zod";
import { referenceUrls } from "@/lib/canvas/assets";
import { isGenerated, type CanvasElement } from "@/lib/canvas/types";
import { ASSET_URL_FIELDS } from "@/lib/connectors/asset-url";
import { type AssetResult, CaptionSchema } from "@/lib/connectors/types";
import { captureFrames } from "@/lib/connectors/video/capture-frames";
import { FRAME_KEYS, FRAMES } from "@/lib/connectors/video/start-frame";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { elementState, type ElementState } from "./element-state";

/** `at` is seconds into the video a frame sits; a still has none. */
const PictureSchema = z.object({ url: z.string(), at: z.number().optional() });

export const ResultViewSchema = z.object({
	durationSec: z.number(),
	pictures: z.array(PictureSchema),
	words: z.array(CaptionSchema),
});

export type ResultView = z.infer<typeof ResultViewSchema>;

export type ElementResult =
	| { ok: true; view: ResultView }
	| { ok: false; reason: string };

const NO_RESULT: Record<ElementState["state"], string> = {
	ungenerated: "has not been generated yet",
	queued: "is waiting to generate",
	generating: "is still generating",
	failed: "failed to generate",
	generated: "generated an empty result",
	stale: "generated an empty result",
	uploaded: "has an empty upload",
};

const holdsMedia = (result: AssetResult) =>
	ASSET_URL_FIELDS.some((field) => result[field]);

/** Browser only for a video, whose frames are decoded and hosted for the model to fetch. */
async function pictures(result: AssetResult): Promise<ResultView["pictures"]> {
	if (result.imageUrl) return [{ url: result.imageUrl }];
	if (!result.videoUrl) return [];
	const urls = await captureFrames(result.videoUrl, FRAME_KEYS);
	return FRAME_KEYS.map((key, index) => ({
		url: urls[index],
		at: FRAMES[key].at * result.durationSec,
	}));
}

/** Browser only. What a stored result shows the model: its pictures, length and words. */
export const resultView = async (result: AssetResult): Promise<ResultView> => ({
	durationSec: result.durationSec,
	pictures: await pictures(result),
	words: result.textTimestamps ?? [],
});

export async function elementResult(
	element: CanvasElement,
	snapshot: ElementSnapshot,
): Promise<ElementResult> {
	if (element.type === "asset_references") {
		const urls = referenceUrls([element]);
		return urls.length > 0
			? {
					ok: true,
					view: {
						durationSec: 0,
						pictures: urls.map((url) => ({ url })),
						words: [],
					},
				}
			: { ok: false, reason: "has no reference images uploaded" };
	}
	if (!isGenerated(element))
		return {
			ok: false,
			reason: `is of type ${element.type}, which generates nothing`,
		};
	const { result } = snapshot;
	if (!result || !holdsMedia(result)) {
		const { state, detail } = elementState(element.id, snapshot, null);
		return {
			ok: false,
			reason: compact([NO_RESULT[state], detail]).join(": "),
		};
	}
	return { ok: true, view: await resultView(result) };
}
