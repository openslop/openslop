import { describe, expect, it } from "vitest";
import { createCharacterAvatarPlugin } from "@/lib/connectors/image/plugins/character-avatar";

describe("character-avatar plugin", () => {
	it("frames the character's appearance as their turnaround sheet, with no text drawn on it, beside the other params", () => {
		const { beforeGenerate } = createCharacterAvatarPlugin();
		const params = {
			prompt: "A young girl with red hair",
			name: "Alice",
			model: "Seedream 5 Lite",
		};
		expect(beforeGenerate?.(params, {})).toEqual({
			prompt:
				"Character turnaround sheet of Alice: a close-up of the face, plus full-body front, side and three-quarter views. A young girl with red hair. Same look and outfit in every view. Plain light gray background with nothing else on it. No text",
			model: "Seedream 5 Lite",
		});
	});

	it("refuses to draw a sheet of nobody rather than one of 'undefined'", () => {
		const { beforeGenerate } = createCharacterAvatarPlugin();
		expect(() =>
			beforeGenerate?.({ prompt: "A young girl with red hair" }, {}),
		).toThrow("needs the character's name");
	});
});
