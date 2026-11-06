import { describe, expect, it } from "vitest";
import type { ContentElement, Scene } from "../types";
import { countSpokenWords } from "../spoken-words";
import { element } from "./_assets";

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
