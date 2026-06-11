import { useCallback, useRef, useState } from "react";
import { Editor } from "slate";
import { type ConnectorRegistry, useConfig } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { createConnector } from "@/lib/connectors/factory";
import { createRefinePlugin } from "@/lib/connectors/llm/plugins/refine";
import { RefineOpParser } from "@/lib/script/refine/parseOps";
import { applyRefineOp } from "@/lib/script/refine/applyOps";
import {
	cloneNode,
	type ModifiedSnapshot,
	revertPreview,
} from "@/lib/script/refine/revertPreview";
import { summarizeRefineOps } from "@/lib/script/refine/summarizeOps";
import type { RefineOp } from "@/lib/script/refine/types";
import type { CanvasEditor } from "@/lib/canvas/types";
import { findNodeById } from "@/app/components/canvas/utils/editorOps";
import { getContentElements } from "@/lib/canvas/scenes";
import type { RefineChanges } from "@/app/components/scene-selection/RefineChangesContext";
import { computeRefineDiff } from "@/app/components/scene-selection/computeRefineDiff";
import { OSMLSerializer } from "../utils/osmlSerializer";

export type RefineTurnStatus =
	| "streaming"
	| "pending"
	| "applied"
	| "discarded"
	| "empty";

export type RefineTurn = {
	id: number;
	prompt: string;
	status: RefineTurnStatus;
	summary: string;
	ops: RefineOp[];
};

function commitRemovals(
	editor: CanvasEditor,
	removeOps: RefineOp[],
	connectors: ConnectorRegistry,
): void {
	if (removeOps.length === 0) return;
	const anchorMap: Record<string, string> = {};
	Editor.withoutNormalizing(editor, () => {
		for (const op of removeOps)
			applyRefineOp(editor, op, anchorMap, connectors);
	});
}

/**
 * Conversational refine with a live, editable preview. When the LLM's ops
 * return they are applied to the editor immediately and the changed nodes are
 * highlighted (a diff); held-back removals stay in place, struck through, until
 * Apply. The editor stays editable throughout, so the user can tweak the
 * agent's edits in place. Apply keeps the preview (and executes the removals);
 * Discard surgically reverts only the agent's own nodes — added nodes are
 * deleted, modified nodes restored from snapshot — so manual edits made to
 * other nodes during the preview survive. Only one preview is pending at a
 * time; starting a new refine auto-applies an unresolved one.
 */
export function useRefineScript(editor: CanvasEditor) {
	const { connectorConfig } = useConfig();
	const [refineLoading, setRefineLoading] = useState(false);
	const [latestTurn, setLatestTurn] = useState<RefineTurn | null>(null);
	const [changes, setChanges] = useState<RefineChanges>({});
	const abortRef = useRef<AbortController | null>(null);
	const idRef = useRef(0);
	const pendingRef = useRef<{
		turnId: number;
		addedIds: string[];
		modified: ModifiedSnapshot[];
		removeOps: RefineOp[];
	} | null>(null);

	const { provider: llmProvider, config: llmConfig } = getDefaultConnector(
		connectorConfig,
		"llm",
	);

	const patchTurn = useCallback((id: number, patch: Partial<RefineTurn>) => {
		setLatestTurn((prev) =>
			prev && prev.id === id ? { ...prev, ...patch } : prev,
		);
	}, []);

	const refineScript = useCallback(
		async (prompt: string) => {
			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;
			setRefineLoading(true);

			if (pendingRef.current) {
				commitRemovals(editor, pendingRef.current.removeOps, connectorConfig);
				patchTurn(pendingRef.current.turnId, { status: "applied" });
				pendingRef.current = null;
				setChanges({});
			}

			const turnId = (idRef.current += 1);
			setLatestTurn({
				id: turnId,
				prompt,
				status: "streaming",
				summary: "",
				ops: [],
			});

			const osml = OSMLSerializer.serializeWithScenes(editor.children);
			const connector = createConnector("llm", llmProvider, {
				...llmConfig,
				plugins: [createRefinePlugin(osml)],
			});

			const parser = new RefineOpParser();
			const ops: RefineOp[] = [];
			try {
				for await (const chunk of connector.stream({ prompt })) {
					if (controller.signal.aborted) break;
					ops.push(...parser.push(chunk.text));
				}
				if (!controller.signal.aborted) ops.push(...parser.flush());
			} finally {
				if (abortRef.current === controller) {
					abortRef.current = null;
					setRefineLoading(false);
				}
			}

			if (controller.signal.aborted) {
				patchTurn(turnId, { status: "discarded", summary: "Stopped." });
				return;
			}
			if (ops.length === 0) {
				patchTurn(turnId, {
					status: "empty",
					summary: "No changes suggested.",
				});
				return;
			}

			const removeOps = ops.filter((op) => op.op === "remove");
			const previewOps = ops.filter((op) => op.op !== "remove");

			const beforeIds = new Set(
				getContentElements(editor.children).map((el) => el.id),
			);
			const modified: ModifiedSnapshot[] = [];
			for (const op of ops) {
				if (op.op !== "set") continue;
				const entry = findNodeById(editor, op.id);
				if (entry) modified.push({ id: op.id, node: cloneNode(entry[0]) });
			}

			const anchorMap: Record<string, string> = {};
			Editor.withoutNormalizing(editor, () => {
				for (const op of previewOps) {
					applyRefineOp(editor, op, anchorMap, connectorConfig);
				}
			});
			const afterIds = getContentElements(editor.children).map((el) => el.id);
			const addedIds = afterIds.filter((id) => !beforeIds.has(id));
			setChanges(computeRefineDiff(beforeIds, afterIds, ops));
			pendingRef.current = { turnId, addedIds, modified, removeOps };
			patchTurn(turnId, {
				status: "pending",
				summary: summarizeRefineOps(ops),
				ops,
			});
		},
		[editor, llmProvider, llmConfig, connectorConfig, patchTurn],
	);

	const applyTurn = useCallback(
		(id: number) => {
			const pending = pendingRef.current;
			if (pending?.turnId !== id) return;
			commitRemovals(editor, pending.removeOps, connectorConfig);
			pendingRef.current = null;
			setChanges({});
			patchTurn(id, { status: "applied" });
		},
		[editor, connectorConfig, patchTurn],
	);

	const discardTurn = useCallback(
		(id: number) => {
			const pending = pendingRef.current;
			if (pending?.turnId !== id) return;
			revertPreview(editor, pending.addedIds, pending.modified);
			pendingRef.current = null;
			setChanges({});
			patchTurn(id, { status: "discarded" });
		},
		[editor, patchTurn],
	);

	const stopRefine = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		setRefineLoading(false);
	}, []);

	return {
		refineScript,
		refineLoading,
		stopRefine,
		latestTurn,
		applyTurn,
		discardTurn,
		changes,
	};
}
