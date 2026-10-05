import { createEditor, type Descendant, type Editor } from "slate";
import { getScriptElements } from "@/lib/canvas/assets";
import type { ConnectorModels } from "@/lib/connectors/models";
import type { AssetResult } from "@/lib/connectors/types";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import type { BuildContext } from "@/lib/generation/graph";
import { GenerationQueue } from "@/lib/generation/queue";
import { createProjectStore, type ProjectData } from "../store";

export function makeEditor(defaultModels: ConnectorModels = {}): Editor {
	const editor = createEditor();
	editor.defaultModels = () => defaultModels;
	return editor;
}

export const buildContextOf = (
	nodes: Descendant[],
	state: ProjectData = createProjectStore().getState(),
): BuildContext => ({
	state,
	canvas: getScriptElements(nodes),
	registry: DEFAULT_CONNECTOR_REGISTRY,
	setAsset: () => {},
});

export function resultQueue(
	results: Record<string, Partial<AssetResult> & { pinned?: boolean }>,
): GenerationQueue {
	const queue = new GenerationQueue();
	for (const [elementId, { pinned = false, ...result }] of Object.entries(
		results,
	))
		queue.restoreResult({
			elementId,
			inputs: { prompt: "", attributes: {}, reads: {}, dependencies: {} },
			result: { durationSec: 0, ...result },
			connectorType: "image",
			pinned,
		});
	return queue;
}
