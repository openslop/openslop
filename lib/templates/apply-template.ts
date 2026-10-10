import { Editor } from "slate";
import { findAsset, NARRATOR } from "@/lib/canvas/assets";
import {
	removeAssets,
	setAsset,
	setReferenceImages,
} from "@/lib/canvas/asset-ops";
import { buildNode } from "@/lib/generation/generation-graph";
import type { BuildContext } from "@/lib/generation/graph";
import type { GenerationQueue } from "@/lib/generation/queue";
import type { ProjectStore } from "@/lib/project/store";
import { getTemplate } from "./templates";

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
		setAsset(editor, "asset_voice", NARRATOR, { attrs: template.narration });
		setReferenceImages(editor, template.referenceImages);
		for (const [name, { appearance, avatar: _, ...voice }] of characters) {
			setAsset(editor, "asset_avatar", name, { text: appearance });
			setAsset(editor, "asset_voice", name, { attrs: voice });
		}
	});

	const context = buildContext();
	for (const [name, { avatar }] of characters) {
		const asset = findAsset(editor.children, "asset_avatar", name);
		if (avatar && asset)
			queue.commitResult(
				buildNode(asset, context),
				{ imageUrl: avatar, durationSec: 0 },
				{ pinned: true },
			);
	}
}
