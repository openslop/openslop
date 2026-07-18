import { getProjectStore } from "@/lib/project/store";
import { getTemplate } from "./templates";

export function applyTemplate(projectId: string, templateId: string) {
	const template = getTemplate(templateId);
	const project = getProjectStore(projectId).getState();
	project.reset();
	project.setReferenceImages(template.referenceImages);
	project.updateMetadata({
		style: template.style,
		characters: template.characters,
		narration: template.narration,
	});
}
