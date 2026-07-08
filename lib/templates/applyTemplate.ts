import { getProjectStore } from "@/lib/project/store";
import { getTemplateById } from "./templates";

export function applyTemplate(projectId: string, templateId: string) {
	const template = getTemplateById(templateId);
	if (!template) return;
	const project = getProjectStore(projectId).getState();
	const userUploadedImages = project.referenceImages.filter(
		(url) => !project.templateReferenceImages.includes(url),
	);
	project.reset();
	project.setReferenceImages([
		...userUploadedImages,
		...template.referenceImages,
	]);
	project.setTemplateReferenceImages(template.referenceImages);
	project.updateMetadata({
		style: template.style,
		characters: template.characters,
		narration: template.narration,
	});
}
