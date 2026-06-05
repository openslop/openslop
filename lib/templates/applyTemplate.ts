import { getProjectStore } from "@/lib/project/store";
import { getTemplateById } from "./templates";

export function applyTemplate(projectId: string, templateId: string) {
	const template = getTemplateById(templateId);
	if (!template) return;
	const project = getProjectStore(projectId).getState();
	project.reset();
	project.setReferenceImages(template.referenceImages);
	project.updateMetadata({
		style: template.style,
		characters: template.characters,
		narration: template.narration,
	});
}

export function clearTemplate(projectId: string) {
	getProjectStore(projectId).getState().reset();
}
