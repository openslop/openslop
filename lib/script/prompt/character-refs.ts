import { dedent } from "@/lib/dedent";
import { characterRef } from "@/lib/connectors/character-refs";

export const CHARACTER_REFS_RULE = dedent`
	Write each character, location and prop in an <image> or <video> prompt as ${characterRef("Name")}, with its exact name, like ${characterRef("Red")} or ${characterRef("Cottage")}. Never describe how one looks, since the model sees it. Speech elements and every other prompt name them plainly.
`;
