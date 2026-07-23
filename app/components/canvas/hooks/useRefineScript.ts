import { useCallback, useMemo, useRef, useState } from "react";
import type { Editor } from "slate";
import { useConfig } from "@/lib/config/ConfigProvider";
import { createDefaultConnector } from "@/lib/connectors/registry";
import { createRefinePlugin } from "@/lib/connectors/llm/plugins/refine";
import { RefineOpParser } from "@/lib/script/refine/parseOps";
import { applyRefineOp } from "@/lib/script/refine/applyOps";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";

export function useRefineScript(editor: Editor) {
	const { connectorConfig } = useConfig();
	const [refineLoading, setRefineLoading] = useState(false);
	const abortRef = useRef<AbortController | null>(null);

	const refineScript = useCallback(
		async (prompt: string) => {
			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;
			setRefineLoading(true);

			const osml = serializeOSMLWithScenes(editor.children);
			const connector = createDefaultConnector(connectorConfig, "llm", [
				createRefinePlugin(osml),
			]);

			const parser = new RefineOpParser();
			const anchorMap: Record<string, string> = {};
			try {
				for await (const chunk of connector.stream({ prompt })) {
					if (controller.signal.aborted) break;
					const ops = parser.push(chunk.text);
					for (const op of ops) {
						applyRefineOp(editor, op, anchorMap, connectorConfig);
					}
				}
				if (!controller.signal.aborted) {
					for (const op of parser.flush()) {
						applyRefineOp(editor, op, anchorMap, connectorConfig);
					}
				}
			} finally {
				if (abortRef.current === controller) {
					abortRef.current = null;
					setRefineLoading(false);
				}
			}
		},
		[editor, connectorConfig],
	);

	const stopRefine = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		setRefineLoading(false);
	}, []);

	return useMemo(
		() => ({ refineScript, refineLoading, stopRefine }),
		[refineScript, refineLoading, stopRefine],
	);
}
