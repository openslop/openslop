import type { ResultKind } from "@/lib/canvas/types";
import type { AssetResult } from "./types";

const ASSET_KIND_URL_FIELD = {
	image: "imageUrl",
	audio: "audioUrl",
	video: "videoUrl",
} as const satisfies Record<ResultKind, keyof AssetResult>;

export function assetUrlField(kind: ResultKind) {
	return ASSET_KIND_URL_FIELD[kind];
}

export function getPrimaryUrl(
	result: AssetResult | null | undefined,
	kind: ResultKind,
): string | undefined {
	return result?.[assetUrlField(kind)];
}
