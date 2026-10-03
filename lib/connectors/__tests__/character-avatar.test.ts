import { describe, expect, it } from "vitest";
import { createCharacterAvatarPlugin } from "@/lib/connectors/image/plugins/character-avatar";

describe("character-avatar plugin", () => {
	it("frames the character's appearance as their portrait, named after them", () => {
		const { beforeGenerate } = createCharacterAvatarPlugin();
		expect(
			beforeGenerate?.(
				{
					prompt: "A young girl with red hair",
					name: "Alice",
				},
				{},
			),
		).toEqual({
			prompt:
				'Character portrait of Alice. A young girl with red hair. A small rectangular nameplate at the bottom of the frame reads "Alice" in clean sans-serif lettering. Plain solid white background, with no scenery, objects or location behind them',
		});
	});

	it("keeps the other params, such as the model, beside the portrait", () => {
		const { beforeGenerate } = createCharacterAvatarPlugin();
		expect(
			beforeGenerate?.(
				{ prompt: "Tall", name: "Bob", model: "Slop Image v1" } as {
					prompt: string;
					name: string;
				},
				{},
			),
		).toMatchObject({ model: "Slop Image v1" });
	});
});
