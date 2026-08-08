import { seedCharacterAvatar } from "@/lib/connectors/image/plugins/characterAvatarNode";
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
		videoSettings: { length: template.length },
	});

	for (const [name, imageUrl] of Object.entries(
		template.characterAvatars ?? {},
	)) {
		seedCharacterAvatar(projectId, queue, registry, name, imageUrl);
	}
}
