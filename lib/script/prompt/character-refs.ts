import { dedent } from "@/lib/dedent";
import { characterRef } from "@/lib/connectors/character-refs";

export const CHARACTER_REFS_RULE = dedent`
	Write each character in an <image> or <video> prompt as ${characterRef("Name")}, with their exact character name, like ${characterRef("Red")}. Never describe how they look, since the model sees them. Speech elements and every other prompt name characters plainly.
`;
