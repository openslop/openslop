import type { GenerationQueue } from "@/lib/generation/queue";
import { characterAvatarElementId } from "./ensureCharacterAvatars";
import { getProjectStore } from "./store";

export function deleteCharacter(
	projectId: string,
	queue: GenerationQueue,
	name: string,
) {
	queue.discard(characterAvatarElementId(name));
	getProjectStore(projectId).getState().removeCharacter(name);
}
