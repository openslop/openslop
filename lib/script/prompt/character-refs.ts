import { dedent } from "@/lib/dedent";

export const CHARACTER_REFS_RULE = dedent`
	Write each character in an <image> or <video> prompt as {{Name}}, with their exact name from Characters, like {{Red}}. Never describe how they look, since the model sees them. Speech elements and every other prompt name characters plainly.
`;
