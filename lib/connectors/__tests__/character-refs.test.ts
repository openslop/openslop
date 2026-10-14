import { describe, expect, it } from "vitest";
import {
	renderCharacterRefs,
	characterRef,
	findCharacterRef,
	referencedNames,
	seats,
} from "../character-refs";

describe("character references", () => {
	it("reads each name once, in the order the prompt first names it", () => {
		expect(
			referencedNames("{{Red}} meets {{Big Bad Wolf}}, then {{Red}} runs"),
		).toEqual(["Red", "Big Bad Wolf"]);
	});

	it.each(["{{}}", "{{  }}", "{{ Red }}", "{Red}", "{{Red}", "{{Re{d}}"])(
		"reads no name in %s",
		(prompt) => {
			expect(referencedNames(prompt)).toEqual([]);
		},
	);

	it("finds where the first reference sits, braces included", () => {
		expect(findCharacterRef("Hi {{Red}}!")).toEqual({
			name: "Red",
			start: 3,
			end: 10,
		});
		expect(findCharacterRef("Hi Red")).toBeUndefined();
	});

	it("puts each seated character as the provider's token, and anyone else by name", () => {
		const cast = [{ name: "Red" }, { name: "Granny" }];
		expect(
			renderCharacterRefs(
				"{{Granny}} and {{Wolf}}",
				seats(cast, (seat) => `<<<element_${seat}>>>`),
			),
		).toBe("<<<element_2>>> and Wolf");
	});

	it("names characters plainly by default, and round trips what it writes", () => {
		const prompt = `${characterRef("Red")}'s basket`;
		expect(referencedNames(prompt)).toEqual(["Red"]);
		expect(renderCharacterRefs(prompt)).toBe("Red's basket");
	});
});
