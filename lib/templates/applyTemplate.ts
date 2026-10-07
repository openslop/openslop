import { Editor } from "slate";
import { findAsset, NARRATOR, voiceAttrs } from "@/lib/canvas/assets";
import {
	removeAssets,
	setAsset,
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
	project.updateScriptSettings({
		template: template.id,
		length: template.length,
	});

	const characters = Object.entries(template.characters ?? {});
	Editor.withoutNormalizing(editor, () => {
		removeAssets(editor);

		setAsset(editor, "asset_style", undefined, {
			text: template.style.description,
		});
		setAsset(editor, "asset_character", NARRATOR, {
			attrs: voiceAttrs(template.narration),
		});
		setReferenceImages(editor, template.referenceImages);
		for (const [name, { appearance, avatar: _, ...voice }] of characters) {
			setAsset(editor, "asset_character", name, {
				text: appearance,
				attrs: voiceAttrs(voice),
			});
		}
	});

	// Built after the reset and the characters land, so each avatar records what the template set.
	const context = { ...buildContext(), state: store.getState() };
	for (const [name, { avatar }] of characters) {
		const character = findAsset(editor.children, "asset_character", name);
		if (avatar && character)
			queue.commitResult(
				buildNode(character, context),
				{ imageUrl: avatar, durationSec: 0 },
				{ pinned: true },
			);
	}
}
