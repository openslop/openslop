import type { AssetConnectorType } from "../connectors/types";

/** How many jobs of a given media type may be in flight at once. */
export type ConcurrencyLimits = Record<AssetConnectorType, number>;

/**
 * Hardcoded until BYOK, where these become per-user settings: the limits exist
 * to keep our shared provider keys under their rate limits
 */
const DEFAULT_CONCURRENCY_LIMITS: ConcurrencyLimits = {
	video: 3,
	image: 3,
	animated_image: 3,
	tts: 1,
	music: 1,
	sfx: 1,
};

export const resolveConcurrencyLimits = (
	overrides: Partial<ConcurrencyLimits> = {},
): ConcurrencyLimits => ({ ...DEFAULT_CONCURRENCY_LIMITS, ...overrides });
