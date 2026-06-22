const ANIMATE_IMAGE_INSTRUCTION = "animate the image element with id";
const ANIMATE_IMAGE_PATTERN = new RegExp(
	`${ANIMATE_IMAGE_INSTRUCTION}="([^"]+)"`,
	"i",
);

export function animateImagePrompt(id: string): string {
	return `${ANIMATE_IMAGE_INSTRUCTION}="${id}"`;
}

export function matchAnimateImagePrompt(prompt: string): string | null {
	return ANIMATE_IMAGE_PATTERN.exec(prompt)?.[1] ?? null;
}
