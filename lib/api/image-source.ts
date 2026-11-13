const HTTP_URL = /^https?:\/\//i;
const BASE64_DATA_URI = /^data:(image\/[a-z0-9+.-]+);base64,(.+)$/i;

export type ImageSource =
	| { kind: "url"; url: string }
	| { kind: "base64"; mediaType: string; data: string };

/**
 * The one contract for a caller-supplied image: an HTTP(S) URL or a base64
 * `image/*` data URI. Checked at the API boundary and parsed again by providers
 * that need the decoded parts, so both agree on what a legal image source is.
 */
export function parseImageSource(value: string): ImageSource | null {
	if (HTTP_URL.test(value)) return { kind: "url", url: value };

	const match = BASE64_DATA_URI.exec(value);
	if (!match) return null;

	const [, mediaType, data] = match;
	return { kind: "base64", mediaType: mediaType.toLowerCase(), data };
}
