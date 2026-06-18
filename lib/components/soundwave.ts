export const AUDIO_BAR_COUNT = 60;

/**
 * Builds an SVG `mask-image` of vertically-centered rounded bars (heights 0–100),
 * so a soundwave can be painted with a CSS background color instead of a canvas
 * fill — keeping it on the same theme tokens as the rest of the UI.
 */
export function buildSoundwaveMask(bars: number[]) {
	const barW = 100 / bars.length;
	const gap = barW * 0.3;
	const rects = bars
		.map(
			(h, i) =>
				`<rect x="${i * barW + gap / 2}" y="${(100 - h) / 2}" width="${barW - gap}" height="${h}" rx="1" fill="white"/>`,
		)
		.join("");
	return `url("data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">${rects}</svg>`,
	)}")`;
}
