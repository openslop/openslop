import { Editor } from "slate";
import { findAsset } from "@/lib/canvas/assets";
import {
	removeAssets,
	setAsset,
	setProjectSettings,
	setReferenceImages,
} from "@/lib/canvas/assetOps";
import { buildNode } from "@/lib/generation/generationGraph";
import type { BuildContext } from "@/lib/generation/graph";
import type { GenerationQueue } from "@/lib/generation/queue";
import type { ProjectStore } from "@/lib/project/store";
import { getTemplate } from "./templates";

/** Starts the project over on a template: its settings, and its assets on the canvas. */
export function applyTemplate(
	editor: Editor,
	store: ProjectStore,
	queue: GenerationQueue,
	buildContext: () => BuildContext,
	templateId: string,
) {
	const template = getTemplate(templateId);
	const project = store.getState();
	project.reset();

	const characters = Object.entries(template.characters ?? {});
	Editor.withoutNormalizing(editor, () => {
		removeAssets(editor);
		setProjectSettings(editor, {
			template: template.id,
			length: template.length,
		});
		setAsset(editor, "style", undefined, {
			text: template.style.description,
		});
		setAsset(editor, "voice", undefined, { attrs: template.narration });
		setReferenceImages(editor, template.referenceImages);
		for (const [name, { appearance, avatar: _, ...voice }] of characters) {
			setAsset(editor, "cast", name, { text: appearance });
			setAsset(editor, "voice", name, { attrs: voice });
		}
	});

	// Built after the reset and the cast land, so each avatar records what the template set.
	const context = { ...buildContext(), state: store.getState() };
	for (const [name, { avatar }] of characters) {
		const cast = findAsset(editor.children, "cast", name);
		if (avatar && cast)
			queue.commitResult(
				buildNode(cast, context),
				{ imageUrl: avatar, durationSec: 0 },
				{ pinned: true },
			);
	}
}
