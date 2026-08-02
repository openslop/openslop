"use client";

import { useMemo } from "react";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { isNodeStale } from "@/lib/generation/graph";
import { isGenerationActive } from "@/lib/generation/queue";
import { useNodeBuilder } from "@/lib/generation/useNodeBuilder";
import { forCharacterAvatar } from "@/lib/connectors/image/plugins/characterAvatarNode";
import { characterAvatarElementId } from "@/lib/project/characterAvatar";
import { useProject } from "@/lib/project/useProject";

/**
 * One character's avatar node: its live status and the three writes that can
 * change it. `avatarUploaded` tracks whether the current image came from the
 * user, so uploading pins the result and regenerating releases the pin.
 */
export function useAvatarGeneration(name: string) {
	const queue = useGenerationQueue();
	const buildNode = useNodeBuilder();
	const updateCharacter = useProject((s) => s.updateCharacter);
	const uploaded = useProject(
		(s) => s.metadata.characters[name]?.avatarUploaded,
	);

	const elementId = characterAvatarElementId(name);
	const snapshot = useQueueSelector((q) => q.getElementSnapshot(elementId));
	const node = useMemo(
		() => buildNode(forCharacterAvatar(name)),
		[buildNode, name],
	);

	return {
		url: snapshot.result?.imageUrl,
		status: snapshot.status,
		seconds: snapshot.seconds,
		error: snapshot.error,
		stale: isNodeStale(node, queue),
		generating: isGenerationActive(snapshot.status),
		/** The appearance the current image was generated from, for a revert. */
		generatedAppearance: snapshot.resultInputs?.attributes.appearance,
		regenerate: () => {
			if (uploaded) updateCharacter(name, { avatarUploaded: false });
			queue.enqueueGraph([node]);
		},
		commitUpload: (imageUrl: string) => {
			queue.commitResult(node, { imageUrl, durationSec: 0 }, { pinned: true });
			updateCharacter(name, { avatarUploaded: true });
		},
		discard: () => queue.discard(elementId),
	};
}
