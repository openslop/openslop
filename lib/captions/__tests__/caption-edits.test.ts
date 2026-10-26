import { describe, expect, it } from "vitest";
import { editCaption, replaceCaptions, resetCaptions } from "../caption-edits";
import { secondsCaption } from "@/lib/providers/word-captions";

const song = ["the", "quick", "fox", "ran", "over", "the", "lazy", "dog"].map(
	(text, at) => secondsCaption(text, at, at + 1),
);
const generated = { durationSec: 8, textTimestamps: song };

describe("editCaption", () => {
	it("replaces one word's text and keeps its timing", () => {
		expect(editCaption(generated, 2, " cat ").textTimestamps).toEqual([
			...song.slice(0, 2),
			secondsCaption("cat", 2, 3),
			...song.slice(3),
		]);
	});

	it("deletes a word cleared of its text", () => {
		expect(editCaption(generated, 1, " ").textTimestamps).toEqual(
			song.toSpliced(1, 1),
		);
	});

	it("keeps the words as generated through every edit, and resets to them", () => {
		const once = editCaption(generated, 0, "a");
		const twice = editCaption(once, 2, "cat");
		expect(twice.generatedTextTimestamps).toBe(song);
		expect(resetCaptions(twice)).toEqual(generated);
	});
});

describe("resetCaptions", () => {
	it("refuses to reset captions nobody edited", () => {
		expect(() => resetCaptions(generated)).toThrow();
	});
});

describe("replaceCaptions", () => {
	const edited = editCaption(generated, 0, "a");

	it("replaces the words, edits and all", () => {
		const heard = [secondsCaption("hey", 0, 1)];
		expect(replaceCaptions(edited, heard)).toEqual({
			durationSec: 8,
			textTimestamps: heard,
		});
	});

	it("removes the words and their edits without any, and keeps the rest of the result", () => {
		expect(replaceCaptions(edited)).toEqual({ durationSec: 8 });
		expect(replaceCaptions({ durationSec: 8 })).toEqual({ durationSec: 8 });
	});
});
