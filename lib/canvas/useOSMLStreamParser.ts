import { useCallback, useRef, useState } from "react";
import type { ParsedElement } from "@/lib/canvas/types";
import { useProject } from "@/lib/project/useProject";
import { OSMLStreamParser } from "./osmlStreamParser";

const MAX_NODES_TO_SYNC = 3;

export function useOSMLStreamParser() {
	const projectModels = useProject((s) => s.metadata.connectorModels);
	const parserRef = useRef(new OSMLStreamParser());
	const [nodes, setNodes] = useState<ParsedElement[]>([]);

	const appendChunk = useCallback(
		(chunk: string) => {
			const updated = parserRef.current.appendChunk(chunk, projectModels);
			if (updated) {
				setNodes(
					structuredClone(
						parserRef.current.getNodes().slice(-1 * MAX_NODES_TO_SYNC),
					),
				);
			}
		},
		[projectModels],
	);

	/** A fresh script starts from a fresh parse: the old one's tail would sync in. */
	const reset = useCallback(() => {
		parserRef.current = new OSMLStreamParser();
		setNodes([]);
	}, []);

	return { nodes, appendChunk, reset };
}
