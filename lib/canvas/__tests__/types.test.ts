import { describe, expect, it } from "vitest";
import {
	captionSourceOf,
	CONTENT_TYPES,
	isSpeechType,
	type ContentType,
} from "../types";

describe("isSpeechType", () => {
	it.each(Object.keys(CONTENT_TYPES) as ContentType[])(
		"%s is captioned from speech exactly when it is speech",
		(type) => {
			expect(captionSourceOf(type) === "speech").toBe(isSpeechType(type));
		},
	);
});
