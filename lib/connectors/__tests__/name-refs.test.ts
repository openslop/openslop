import { describe, expect, it } from "vitest";
import {
	renderPrompt,
	nameRef,
	findNameRef,
	referencedNames,
	seats,
} from "../name-refs";

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
		expect(findNameRef("Hi {{Red}}!")).toEqual({
			name: "Red",
			start: 3,
			end: 10,
		});
		expect(findNameRef("Hi Red")).toBeUndefined();
	});

	it("puts each seated character as the provider's token, and anyone else by name", () => {
		const cast = [{ name: "Red" }, { name: "Granny" }];
		expect(
			renderPrompt(
				"{{Granny}} and {{Wolf}}",
				seats(cast, (seat) => `<<<element_${seat}>>>`),
			),
		).toBe("<<<element_2>>> and Wolf");
	});

	it("names characters plainly by default, and round trips what it writes", () => {
		const prompt = `${nameRef("Red")}'s basket`;
		expect(referencedNames(prompt)).toEqual(["Red"]);
		expect(renderPrompt(prompt)).toBe("Red's basket");
	});
});
