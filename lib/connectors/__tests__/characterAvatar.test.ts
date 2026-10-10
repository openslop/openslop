import { describe, expect, it } from "vitest";
import { createCharacterAvatarPlugin } from "@/lib/connectors/image/plugins/characterAvatar";

describe("character-avatar plugin", () => {
	it("frames the character's appearance as their portrait, named after them, beside the other params", () => {
		const { beforeGenerate } = createCharacterAvatarPlugin();
		const params = {
			prompt: "A young girl with red hair",
			name: "Alice",
			model: "Slop Image v1",
		};
		expect(beforeGenerate?.(params, {})).toEqual({
			prompt:
				'Character portrait of Alice. A young girl with red hair. A small rectangular nameplate at the bottom of the frame reads "Alice" in clean sans-serif lettering. Plain solid white background, with no scenery, objects or location behind them',
			model: "Slop Image v1",
		});
	});
});
