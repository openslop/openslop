import { describe, expect, it } from "vitest";
import {
	captionsEdited,
	editCaption,
	replaceCaptions,
	resetCaptions,
} from "../caption-edits";
import { toCaption } from "../word-captions";

const song = ["the", "quick", "fox", "ran", "over", "the", "lazy", "dog"].map(
	(text, at) => toCaption(text, at, at + 1),
);
const generated = {
	durationSec: 8,
	textTimestamps: song,
	originalTextTimestamps: song,
};

describe("editCaption", () => {
	it("replaces one word's text and keeps its timing", () => {
		expect(editCaption(generated, 2, " cat ").textTimestamps).toEqual([
			...song.slice(0, 2),
			toCaption("cat", 2, 3),
			...song.slice(3),
		]);
	});

	it("deletes a word cleared of its text", () => {
		expect(editCaption(generated, 1, " ").textTimestamps).toEqual(
			song.toSpliced(1, 1),
		);
	});

	it("keeps the original words through every edit, and resets to them", () => {
		const twice = editCaption(editCaption(generated, 0, "a"), 2, "cat");
		expect(twice.originalTextTimestamps).toBe(song);
		expect(resetCaptions(twice)).toEqual(generated);
	});
});

describe("captionsEdited", () => {
	it("is edited while the words differ from the original", () => {
		expect(captionsEdited(generated)).toBe(false);
		const edited = editCaption(generated, 0, "a");
		expect(captionsEdited(edited)).toBe(true);
		expect(captionsEdited(editCaption(edited, 0, "the"))).toBe(false);
	});

	it("is never edited without captions", () => {
		expect(captionsEdited({ durationSec: 8 })).toBe(false);
	});
});

describe("replaceCaptions", () => {
	const edited = editCaption(generated, 0, "a");

	it("replaces the words and the original they reset to", () => {
		const heard = [toCaption("hey", 0, 1)];
		expect(replaceCaptions(edited, heard)).toEqual({
			durationSec: 8,
			textTimestamps: heard,
			originalTextTimestamps: heard,
		});
	});

	it("removes the words and their original without any, and keeps the rest of the result", () => {
		expect(replaceCaptions(edited)).toEqual({ durationSec: 8 });
		expect(replaceCaptions({ durationSec: 8 })).toEqual({ durationSec: 8 });
	});
});
