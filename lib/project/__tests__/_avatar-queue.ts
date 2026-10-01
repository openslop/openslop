import { GenerationQueue } from "@/lib/generation/queue";
import { characterAvatarElementId } from "../characterAvatar";

/** A queue holding committed avatar results and nothing else. */
export function avatarQueue(
	avatars: Record<string, { imageUrl: string; pinned?: boolean }>,
): GenerationQueue {
	const queue = new GenerationQueue();
	for (const [name, { imageUrl, pinned = false }] of Object.entries(avatars))
		queue.restoreResult({
			elementId: characterAvatarElementId(name),
			inputs: { prompt: "", attributes: {}, dependencies: {} },
			result: { imageUrl, durationSec: 0 },
			connectorType: "image",
			pinned,
		});
	return queue;
}
