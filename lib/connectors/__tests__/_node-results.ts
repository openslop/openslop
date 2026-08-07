import type { NodeResults } from "@/lib/generation/graph";
import { characterAvatarElementId } from "@/lib/project/characterAvatar";
import type { ElementSnapshot } from "@/lib/generation/snapshots";

const EMPTY: ElementSnapshot = {
	status: "idle",
	seconds: 0,
	result: null,
	error: null,
	resultInputs: null,
	connectorType: null,
	pinned: false,
};

/** Stands in for the queue when a plugin only reads committed avatar results. */
export function stubAvatarResults(
	avatars: Record<string, string>,
): NodeResults {
	const byId = new Map(
		Object.entries(avatars).map(([name, imageUrl]) => [
			characterAvatarElementId(name),
			{ ...EMPTY, result: { imageUrl, durationSec: 0 } },
		]),
	);
	return {
		getElementSnapshot: (id) => (id ? byId.get(id) : undefined) ?? EMPTY,
	};
}
