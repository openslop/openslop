import { describe, expect, it } from "vitest";
import type { ContentElement, Scene } from "../types";
import { countSpokenWords, estimateSpeechLengths } from "../spoken-words";
import { element } from "./_assets";

const words = (count: number) => Array(count).fill("word").join(" ");

const scene = (...children: ContentElement[]): Scene => ({
	id: "s",
	type: "scene",
	children,
});

describe("countSpokenWords", () => {
	it("counts speech and nothing else", () => {
		const nodes = [
			scene(
				element("n", "speech", "The sun was setting in the west."),
				element("c", "speech", "Truce?"),
				element("i", "image", "A dark forest with a clearing in the center."),
				element("m", "music", "Soft, slow, sad piano music."),
				element("s", "sound", "Wind"),
			),
		];

		expect(countSpokenWords(nodes)).toBe(8);
	});

	it("counts across scenes", () => {
		const nodes = [
			scene(element("n", "speech", "One two three.")),
			scene(element("c", "speech", "Four five.")),
		];

		expect(countSpokenWords(nodes)).toBe(5);
	});

	it("counts an empty canvas as zero", () => {
		expect(countSpokenWords([])).toBe(0);
		expect(countSpokenWords([scene(element("n", "speech", "  "))])).toBe(0);
	});
});

describe("estimateSpeechLengths", () => {
	it("estimates each line from its words and skips everything that isn't spoken", () => {
		const nodes = [
			scene(
				element("n", "speech", words(90)),
				element("i", "image", "A dark forest."),
			),
			scene(element("c", "speech", words(3))),
		];

		expect(estimateSpeechLengths(nodes)).toEqual([
			{ id: "n", words: 90, seconds: 30 },
			{ id: "c", words: 3, seconds: 1 },
		]);
	});
});
