import { dedent } from "@/lib/dedent";
import { nameRef } from "@/lib/connectors/name-refs";

export const NAME_REFS_RULE = dedent`
	Write each character, location and prop in an <image> or <video> prompt as ${nameRef("Name")}, with its exact name, like ${nameRef("Red")} or ${nameRef("Cottage")}. Never describe how one looks, since the model sees it. Speech elements and every other prompt name them plainly.
`;
