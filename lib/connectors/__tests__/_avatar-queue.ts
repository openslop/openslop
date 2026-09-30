import { characterAvatarElementId } from "@/lib/project/characterAvatar";
import { GenerationQueue } from "@/lib/generation/queue";

/** A queue holding committed avatar results and nothing else. */
export function avatarQueue(
	avatars: Record<string, { imageUrl: string; pinned?: boolean }>,
): GenerationQueue {
	return new GenerationQueue({
		initialState: Object.fromEntries(
			Object.entries(avatars).map(([name, { imageUrl, pinned = false }]) => [
				characterAvatarElementId(name),
				{
					status: "idle",
					seconds: 0,
					result: { imageUrl, durationSec: 0 },
					error: null,
					resultInputs: null,
					connectorType: "image",
					pinned,
				},
			]),
		),
	});
}
