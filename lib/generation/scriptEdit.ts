import type { Editor } from "slate";
import { findNodeById } from "@/lib/canvas/editorOps";
import type { ConnectorModels } from "@/lib/connectors/models";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type { ProjectData } from "@/lib/project/store";
import { applyRefineOps } from "@/lib/script/refine/applyOps";
import type { RefineOp } from "@/lib/script/refine/types";
import { derivedDependency, forElement } from "./graph";
import type { GenerationQueue } from "./queue";
import { nodeBuilder } from "./resolveGraph";

export type ScriptEditContext = {
	editor: Editor;
	queue: GenerationQueue;
	connectors: ConnectorRegistry;
	state: ProjectData;
	/** The models a newly created element takes, already resolved by scope. */
	models: ConnectorModels;
};

function seedDependencies(
	{ editor, queue, connectors, state }: ScriptEditContext,
	elementId: string,
	deps: Record<string, string>,
): string[] {
	const element = findNodeById(editor, elementId)?.[0];
	if (!element) return [];

	const node = nodeBuilder(connectors, state)(forElement(element));
	return Object.entries(deps).flatMap(([name, sourceId]) => {
		const target = derivedDependency(node, name);
		if (!target) return [`deps: "${elementId}" has no "${name}" to seed`];

		const { result, pinned } = queue.getElementSnapshot(sourceId);
		if (!result)
			return [`deps: "${sourceId}" has generated nothing to seed "${name}"`];

		queue.commitResult(target, result, { pinned });
		return [];
	});
}

/** Seeding runs after the edit, against the element the whole edit left behind. */
export function applyScriptEdit(
	ctx: ScriptEditContext,
	ops: RefineOp[],
): { applied: number; failures: string[] } {
	const { applied, failures } = applyRefineOps(ctx.editor, ops, ctx.models);
	return {
		applied,
		failures: [
			...failures,
			...ops.flatMap((op) =>
				op.op === "set" && op.deps ? seedDependencies(ctx, op.id, op.deps) : [],
			),
		],
	};
}
