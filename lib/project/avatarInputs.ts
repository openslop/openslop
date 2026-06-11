/**
 * Serializes everything that actually drives avatar image generation: the
 * character's appearance, the project art style, and the project reference
 * images. Persisted alongside a generated avatar so a change in any of them
 * (not just the appearance) is detected as stale. Art style and reference
 * images are injected by plugins at generation time, so they are not part of
 * the queue's GenerationInputs and have to be captured here.
 */
export function avatarInputsSignature(
	appearance: string,
	style: string | undefined,
	referenceImages: readonly string[],
): string {
	return JSON.stringify({
		appearance,
		style: style?.trim() ?? "",
		referenceImages: [...referenceImages].sort(),
	});
}
