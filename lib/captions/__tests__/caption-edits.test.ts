import { describe, expect, it } from "vitest";
import {
	editCaptions,
	removeCaptions,
	resetCaptions,
	reviseWords,
	withSTTResult,
} from "../caption-edits";

const song = ["the", "quick", "fox", "ran", "over", "the", "lazy", "dog"].map(
	(text, at) => ({ text, start: at, end: at + 1 }),
);

describe("editCaptions", () => {
	const generated = { durationSec: 8, textTimestamps: song };

	it("keeps the words as generated through every edit, and resets to them", () => {
		const once = editCaptions(generated, 0, 2, "a slow");
		const twice = editCaptions(once, 2, 4, "fox ran");
		expect(twice.generatedTextTimestamps).toBe(song);
		expect(resetCaptions(twice)).toEqual(generated);
	});

	it("refuses to reset captions nobody edited", () => {
		expect(() => resetCaptions(generated)).toThrow();
	});

	it("removes the words and their edits, and keeps the rest of the result", () => {
		const edited = editCaptions(generated, 0, 2, "a slow");
		expect(removeCaptions(edited)).toEqual({ durationSec: 8 });
		expect(() => removeCaptions({ durationSec: 8 })).toThrow();
	});

	it("lets speech to text replace the words, edits and all", () => {
		const edited = editCaptions(generated, 0, 2, "a slow");
		const heard = [{ text: "hey", start: 0, end: 1 }];
		expect(
			withSTTResult(edited, { durationSec: 8, textTimestamps: heard }),
		).toEqual({ durationSec: 8, textTimestamps: heard });
		expect(() => withSTTResult(edited, { durationSec: 8 })).toThrow();
	});
});

describe("reviseWords", () => {
	it("lays the typed words over the line's span, each timed by its length", () => {
		expect(reviseWords(song, 0, 2, "a slow")).toEqual([
			{ text: "a", start: 0, end: 0.4 },
			{ text: "slow", start: 0.4, end: 2 },
			...song.slice(2),
		]);
	});

	it("drops a line cleared of its words", () => {
		expect(reviseWords(song, 0, 4, " ")).toEqual(song.slice(4));
	});
});
