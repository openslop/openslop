/** Opacity lives in the trailing pair of an 8-digit hex; a 6-digit one is opaque. */
const OPAQUE = "ff";

export const alphaPercent = (color: string): number => {
	const pair = color.length === 9 ? color.slice(7) : OPAQUE;
	return Math.round((Number.parseInt(pair, 16) / 255) * 100);
};

/** Returns the color unchanged for a percentage the field can't supply yet. */
export const withAlphaPercent = (color: string, percent: number): string => {
	if (Number.isNaN(percent)) return color;

	const clamped = Math.min(100, Math.max(0, percent));
	const pair = Math.round((clamped / 100) * 255)
		.toString(16)
		.padStart(2, "0");
	return `${color.slice(0, 7)}${pair}`;
};
