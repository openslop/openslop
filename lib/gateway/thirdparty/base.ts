/**
 * Where generations that run on the user's own key are served from. These
 * routes are session-authenticated rather than API-access gated: they read the
 * key stored on the requesting account and never accept one from the client.
 */
export const THIRD_PARTY_API_PREFIX = "/api/third-party";
