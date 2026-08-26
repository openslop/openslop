const ANIMATE_IMAGE_PATTERN = /animate the image in scene (\d+)/i;

export const animateImagePrompt = (scene: number): string =>
	`Animate the image in scene ${scene}, reusing the frame it has already generated.`;

/** The scene an animate request names, or null when it is not one. */
export const animateImageScene = (prompt: string): number | null => {
	const scene = ANIMATE_IMAGE_PATTERN.exec(prompt)?.[1];
	return scene === undefined ? null : Number(scene);
};
