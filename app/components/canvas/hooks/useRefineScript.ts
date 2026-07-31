import { useCallback, useMemo } from "react";
import type { Editor } from "slate";
import { useConfig } from "@/lib/config/ConfigProvider";
import { createDefaultConnector } from "@/lib/connectors/registry";
import { createRefinePlugin } from "@/lib/connectors/llm/plugins/refine";
import { RefineOpParser } from "@/lib/script/refine/parseOps";
import { applyRefineOp } from "@/lib/script/refine/applyOps";
import { useStreamRun } from "@/lib/script/useStreamRun";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";

export function useRefineScript(editor: Editor) {
	const { connectorConfig } = useConfig();
	const { loading: refineLoading, run, stop: stopRefine } = useStreamRun();

	const refineScript = useCallback(
		async (prompt: string) => {
			const osml = serializeOSMLWithScenes(editor.children);
			const connector = createDefaultConnector(connectorConfig, "llm", [
				createRefinePlugin(osml),
			]);

			const parser = new RefineOpParser();
			const anchorMap: Record<string, string> = {};
			const apply = (ops: ReturnType<RefineOpParser["flush"]>) => {
				for (const op of ops) {
					applyRefineOp(editor, op, anchorMap, connectorConfig);
				}
			};

			await run(
				connector.stream({ prompt }),
				(chunk) => apply(parser.push(chunk.text)),
				() => apply(parser.flush()),
			);
		},
		[editor, connectorConfig, run],
	);

	return useMemo(
		() => ({ refineScript, refineLoading, stopRefine }),
		[refineScript, refineLoading, stopRefine],
	);
}
