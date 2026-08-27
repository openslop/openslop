import { derivedFrom, resultIdentity } from "./graph";
import type { ElementHistory } from "./history";
import type { GenerationQueue } from "./queue";
import type { ElementVersion } from "./versions";

/** The dependencies that exist only to serve this element, and their identities. */
const ownedDependencies = ({ elementId, inputs }: ElementVersion) =>
	Object.entries(inputs.dependencies).filter(
		([id, identity]) => identity && derivedFrom(id) === elementId,
	);

/**
 * A version restores the nodes it owns alongside it: the still behind an
 * animated image has no card of its own, so restoring the animation without it
 * leaves the pair mismatched and the element stale on arrival. Shared nodes —
 * character avatars, project style — are state other elements read, and a
 * restore here must never move them.
 */
export async function restoreElementVersion(
	queue: GenerationQueue,
	history: ElementHistory,
	version: ElementVersion,
): Promise<void> {
	queue.restoreResult(version);
	await Promise.all(
		ownedDependencies(version).map(async ([id, identity]) => {
			await history.load(id);
			const match = history
				.get(id)
				.find((candidate) => resultIdentity(candidate.result) === identity);
			if (match) await restoreElementVersion(queue, history, match);
		}),
	);
}
