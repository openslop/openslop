import { badRequest } from "./response";

const DATA_URI_PATTERN = /^data:[a-z]+\/[a-z+.-]+;base64,/i;
const HTTP_URL_PATTERN = /^https?:\/\//i;

type UnknownBody = Record<string, unknown>;

export function validateRequiredString(
	body: UnknownBody,
	key: string,
	label = key,
): Response | null {
	const value = body[key];
	if (typeof value === "string" && value.length > 0) {
		return null;
	}
	return badRequest(`${label} is required`);
}

export function validateReferenceImages(
	body: UnknownBody,
	key = "referenceImages",
): Response | null {
	const value = body[key];
	if (value === undefined) {
		return null;
	}
	if (!Array.isArray(value)) {
		return badRequest(`${key} must be an array`);
	}

	for (const entry of value) {
		if (typeof entry !== "string") {
			return badRequest(`Each ${key} entry must be a string`);
		}
		if (!DATA_URI_PATTERN.test(entry) && !HTTP_URL_PATTERN.test(entry)) {
			return badRequest(
				`Each ${key} entry must be a data URI or an HTTP(S) URL`,
			);
		}
	}

	return null;
}
