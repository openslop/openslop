const ANIMATE_IMAGE_PATTERN = /animate the image in scene \d+/i;

export const animateImagePrompt = (scene: number): string =>
	`Animate the image in scene ${scene}, reusing the frame it has already generated.`;

export const isAnimateImageRequest = (prompt: string): boolean =>
	ANIMATE_IMAGE_PATTERN.test(prompt);
