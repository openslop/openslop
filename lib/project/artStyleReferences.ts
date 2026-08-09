import compact from "lodash/compact";
import type { NodeResults } from "@/lib/generation/graph";
import { characterAvatarUrl } from "./characterAvatar";
import type { ProjectData } from "./store";

/** Generated avatars already carry the style, so reading them back is circular. */
export function artStyleReferences(
	state: ProjectData,
	results: NodeResults,
): string[] {
	return compact([
		...state.referenceImages,
		...Object.entries(state.metadata.characters).map(([name, character]) =>
			character.avatarUploaded ? characterAvatarUrl(results, name) : undefined,
		),
	]);
}
