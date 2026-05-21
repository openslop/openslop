import type { ResultKind } from "@/lib/canvas/types";
import type { AssetResult } from "./types";

export function getPrimaryUrl(
	result: AssetResult | null | undefined,
	outputKind: ResultKind,
): string | undefined {
	if (!result) return undefined;
	if (outputKind === "image") return result.imageUrl;
	if (outputKind === "audio") return result.audioUrl;
	return result.videoUrl;
}
