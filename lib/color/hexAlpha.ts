/** Opacity lives in the trailing pair of an 8-digit hex; a 6-digit one is opaque. */
const OPAQUE = "ff";

/**
 * Shorthand hex to its long form, doubling each digit (`#fb0` → `#ffbb00`). Hex
 * entry accepts both, so everything downstream can count digits from a fixed
 * position.
 */
const expand = (color: string): string =>
	color.length > 5
		? color
		: `#${Array.from(color.slice(1), (digit) => digit + digit).join("")}`;

export const alphaPercent = (color: string): number => {
	const hex = expand(color);
	const pair = hex.length === 9 ? hex.slice(7) : OPAQUE;
	return Math.round((Number.parseInt(pair, 16) / 255) * 100);
};

/** Returns the color unchanged for a percentage the field can't supply yet. */
export const withAlphaPercent = (color: string, percent: number): string => {
	if (Number.isNaN(percent)) return color;

	const clamped = Math.min(100, Math.max(0, percent));
	const pair = Math.round((clamped / 100) * 255)
		.toString(16)
		.padStart(2, "0");
	return `${expand(color).slice(0, 7)}${pair}`;
};
