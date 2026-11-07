import { describe, expect, it } from "vitest";
import type { ContentElement, Scene } from "../types";
import { countSpokenWords, measureDialogueLengths } from "../spoken-words";
import { element } from "./_assets";

const words = (count: number) => Array(count).fill("word").join(" ");

const scene = (...children: ContentElement[]): Scene => ({
	id: "s",
	type: "scene",
	children,
});

describe("countSpokenWords", () => {
	it("counts narration and dialogue and nothing else", () => {
		const nodes = [
			scene(
				element("n", "narration", "The sun was setting in the west."),
				element("c", "character", "Truce?"),
				element("i", "image", "A dark forest with a clearing in the center."),
				element("m", "music", "Soft, slow, sad piano music."),
				element("s", "sound", "Wind"),
			),
		];

		expect(countSpokenWords(nodes)).toBe(8);
	});

	it("counts across scenes", () => {
		const nodes = [
			scene(element("n", "narration", "One two three.")),
			scene(element("c", "character", "Four five.")),
		];

		expect(countSpokenWords(nodes)).toBe(5);
	});

	it("counts an empty canvas as zero", () => {
		expect(countSpokenWords([])).toBe(0);
		expect(countSpokenWords([scene(element("n", "narration", "  "))])).toBe(0);
	});
});

describe("measureDialogueLengths", () => {
	it("estimates each line from its words and skips everything that isn't spoken", () => {
		const nodes = [
			scene(
				element("n", "narration", words(90)),
				element("i", "image", "A dark forest."),
			),
			scene(element("c", "character", words(3))),
		];

		expect(measureDialogueLengths(nodes)).toEqual([
			{ id: "n", type: "narration", words: 90, seconds: 30 },
			{ id: "c", type: "character", words: 3, seconds: 1 },
		]);
	});
});
