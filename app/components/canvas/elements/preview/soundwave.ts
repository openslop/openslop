export const AUDIO_BAR_COUNT = 60;

const BAR_W = 100 / AUDIO_BAR_COUNT;
const BAR_GAP = BAR_W * 0.3;

export function buildSoundwaveMask(bars: number[]) {
	const rects = bars
		.map(
			(h, i) =>
				`<rect x="${i * BAR_W + BAR_GAP / 2}" y="${(100 - h) / 2}" width="${BAR_W - BAR_GAP}" height="${h}" rx="1" fill="white"/>`,
		)
		.join("");
	return `url("data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">${rects}</svg>`,
	)}")`;
}
