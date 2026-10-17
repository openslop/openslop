import compact from "lodash/compact";
import type { ResultKind } from "@/lib/canvas/types";
import type { AssetResult } from "./types";

const ASSET_KIND_URL_FIELD = {
	image: "imageUrl",
	audio: "audioUrl",
	video: "videoUrl",
} as const satisfies Record<ResultKind, keyof AssetResult>;

export const ASSET_URL_FIELDS = Object.values(ASSET_KIND_URL_FIELD);

const IDENTITY_FIELDS = [...ASSET_URL_FIELDS, "voiceId"] as const;

export const resultIdentity = (result: AssetResult): string =>
	compact(IDENTITY_FIELDS.map((field) => result[field])).join("|");

export function assetUrlField(kind: ResultKind) {
	return ASSET_KIND_URL_FIELD[kind];
}

export function getPrimaryUrl(
	result: AssetResult | null | undefined,
	kind: ResultKind,
): string | undefined {
	return result?.[assetUrlField(kind)];
}
