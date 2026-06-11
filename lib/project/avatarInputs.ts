import type { MetadataCharacter } from "./types";

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

/**
 * Whether a character's generated avatar no longer matches its current inputs.
 * Compares the persisted signature (recorded when the avatar was generated)
 * against the current inputs, so it works across reloads — unlike the in-memory
 * generation-queue snapshot. Uploaded avatars are never stale (the user owns
 * them), and legacy avatars with no recorded signature read as not-stale since
 * their inputs are unknown (one manual regenerate stamps a signature and opts
 * them in).
 */
export function isAvatarStale(
	character: MetadataCharacter,
	style: string | undefined,
	referenceImages: readonly string[],
): boolean {
	if (character.avatarUploaded || !character.avatarUrl) return false;
	if (character.avatarInputsSignature === undefined) return false;
	return (
		character.avatarInputsSignature !==
		avatarInputsSignature(character.appearance, style, referenceImages)
	);
}

/**
 * Baseline signatures to stamp on avatars generated before signatures existed,
 * so staleness detection works for them without a manual regenerate. Treats a
 * loaded avatar as in sync with its current inputs (true unless it was edited
 * in an older session and never regenerated, which self-heals on the next
 * edit/regen). Returns name → signature only for avatars that need one;
 * signed, uploaded, and avatar-less characters are skipped. Idempotent.
 */
export function backfillAvatarSignatures(
	characters: Record<string, MetadataCharacter>,
	style: string | undefined,
	referenceImages: readonly string[],
): Record<string, string> {
	const stamped: Record<string, string> = {};
	for (const [name, ch] of Object.entries(characters)) {
		if (
			ch.avatarUrl &&
			!ch.avatarUploaded &&
			ch.avatarInputsSignature === undefined &&
			ch.appearance
		) {
			stamped[name] = avatarInputsSignature(
				ch.appearance,
				style,
				referenceImages,
			);
		}
	}
	return stamped;
}
