import { dedent } from "@/lib/dedent";
import { characterRef } from "@/lib/connectors/character-refs";

export const CHARACTER_REFS_RULE = dedent`
	Write each character in an <image> or <video> prompt as ${characterRef("Name")}, with their exact character name, like ${characterRef("Red")}. Never describe how a character with an avatar looks, since the model sees them. A character with no avatar has nothing for the model to see: still write ${characterRef("Name")}, so a video model can give them their voice, and describe how they look. Speech elements and every other prompt name characters plainly.
`;
