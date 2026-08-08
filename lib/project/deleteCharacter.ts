import type { GenerationQueue } from "@/lib/generation/queue";
import { characterAvatarElementId } from "./characterAvatar";
import type { ProjectStore } from "./store";

export function deleteCharacter(
	store: ProjectStore,
	queue: GenerationQueue,
	name: string,
) {
	queue.discard(characterAvatarElementId(name));
	store.getState().removeCharacter(name);
}
