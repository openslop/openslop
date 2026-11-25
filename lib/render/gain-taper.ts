import { clamp } from "@/lib/utils";

/** Loudness change between adjacent steps of the 0–10 volume scale. */
export const DB_PER_VOLUME_STEP = 3;

const RANGE_DB = DB_PER_VOLUME_STEP * 10;

/** A 0–1 control position as gain on a decibel taper: 1 is unity, 0 is silent. */
export function positionToGain(position: number): number {
	if (position <= 0) return 0;
	return 10 ** ((RANGE_DB * (Math.min(position, 1) - 1)) / 20);
}

/** The control position that plays at `gain`, the inverse of `positionToGain`. */
export function gainToPosition(gain: number): number {
	if (gain <= 0) return 0;
	return clamp(1 + (20 * Math.log10(gain)) / RANGE_DB, 0, 1);
}
