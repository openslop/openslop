import { describe, expect, it } from "vitest";
import {
	editCaptions,
	removeCaptions,
	resetCaptions,
	reviseWord,
	withSTTResult,
} from "../caption-edits";
import { caption } from "./_captions";

const song = ["the", "quick", "fox", "ran", "over", "the", "lazy", "dog"].map(
	(text, at) => caption(text, at, at + 1),
);

describe("editCaptions", () => {
	const generated = { durationSec: 8, textTimestamps: song };

	it("keeps the words as generated through every edit, and resets to them", () => {
		const once = editCaptions(generated, 0, "a");
		const twice = editCaptions(once, 2, "cat");
		expect(twice.generatedTextTimestamps).toBe(song);
		expect(resetCaptions(twice)).toEqual(generated);
	});

	it("refuses to reset captions nobody edited", () => {
		expect(() => resetCaptions(generated)).toThrow();
	});

	it("removes the words and their edits, and keeps the rest of the result", () => {
		const edited = editCaptions(generated, 0, "a");
		expect(removeCaptions(edited)).toEqual({ durationSec: 8 });
		expect(() => removeCaptions({ durationSec: 8 })).toThrow();
	});

	it("lets speech to text replace the words, edits and all", () => {
		const edited = editCaptions(generated, 0, "a");
		const heard = [caption("hey", 0, 1)];
		expect(
			withSTTResult(edited, { durationSec: 8, textTimestamps: heard }),
		).toEqual({ durationSec: 8, textTimestamps: heard });
		expect(() => withSTTResult(edited, { durationSec: 8 })).toThrow();
	});
});

describe("reviseWord", () => {
	it("replaces one word's text and keeps its timing", () => {
		expect(reviseWord(song, 2, " cat ")).toEqual([
			...song.slice(0, 2),
			caption("cat", 2, 3),
			...song.slice(3),
		]);
	});

	it("keeps a caption that continues a word joined to it", () => {
		const joined = [
			caption("Remotion", 0, 1),
			{ ...caption("'s", 1, 2), text: "'s" },
		];
		expect(reviseWord(joined, 1, "s")[1].text).toBe("s");
	});

	it("deletes a word cleared of its text", () => {
		expect(reviseWord(song, 1, " ")).toEqual(song.toSpliced(1, 1));
	});
});
