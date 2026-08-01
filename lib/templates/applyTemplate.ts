import { forCharacterAvatar } from "@/lib/connectors/image/plugins/characterAvatarNode";
import { nodeBuilder } from "@/lib/generation/resolveGraph";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type { GenerationQueue } from "@/lib/generation/queue";
import { getProjectStore } from "@/lib/project/store";
import { getTemplate } from "./templates";

export function applyTemplate(
	projectId: string,
	templateId: string,
	queue: GenerationQueue,
	registry: ConnectorRegistry,
) {
	const template = getTemplate(templateId);
	const project = getProjectStore(projectId).getState();
	project.reset();
	project.setReferenceImages(template.referenceImages);
	project.updateMetadata({
		style: template.style,
		characters: template.characters,
		narration: template.narration,
	});

	// Seeded against the avatar's own inputs so a prebuilt avatar starts fresh.
	const buildNode = nodeBuilder(
		registry,
		getProjectStore(projectId).getState(),
	);
	for (const [name, imageUrl] of Object.entries(
		template.characterAvatars ?? {},
	)) {
		queue.commitResult(
			buildNode(forCharacterAvatar(name)),
			{ imageUrl, durationSec: 0 },
			{ pinned: true },
		);
	}
}
