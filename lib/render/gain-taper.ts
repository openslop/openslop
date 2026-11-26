import { clamp } from "@/lib/utils";

/** How far below unity the taper's lowest audible position sits, spread evenly over 0–1. */
export const TAPER_RANGE_DB = 30;

export const gainToDb = (gain: number) => 20 * Math.log10(gain);

export const dbToGain = (db: number) => 10 ** (db / 20);

/** A 0–1 control position as gain on a decibel taper: 1 is unity, 0 is silent. */
export function positionToGain(position: number): number {
	if (position <= 0) return 0;
	return dbToGain(TAPER_RANGE_DB * (Math.min(position, 1) - 1));
}

/** The control position that plays at `gain`, the inverse of `positionToGain`. */
export function gainToPosition(gain: number): number {
	if (gain <= 0) return 0;
	return clamp(1 + gainToDb(gain) / TAPER_RANGE_DB, 0, 1);
}
