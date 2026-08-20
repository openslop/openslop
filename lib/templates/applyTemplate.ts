import { seedCharacterAvatar } from "@/lib/connectors/image/plugins/characterAvatarNode";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type { GenerationQueue } from "@/lib/generation/queue";
import type { ProjectStore } from "@/lib/project/store";
import { getTemplate } from "./templates";

export function applyTemplate(
	store: ProjectStore,
	templateId: string,
	queue: GenerationQueue,
	registry: ConnectorRegistry,
) {
	const template = getTemplate(templateId);
	const project = store.getState();
	project.reset();
	project.setReferenceImages(template.referenceImages);
	project.updateMetadata({
		style: template.style?.description,
		characters: template.characters,
		narration: template.narration,
		videoSettings: { length: template.length },
	});
	project.setTemplate(template.id);

	for (const [name, imageUrl] of Object.entries(
		template.characterAvatars ?? {},
	)) {
		seedCharacterAvatar(store.getState(), queue, registry, name, imageUrl);
	}
}
