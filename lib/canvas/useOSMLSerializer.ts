import { useCallback, useRef, useState } from "react";
import type { ParsedElement } from "@/lib/canvas/types";
import { useConfig } from "@/lib/config/ConfigProvider";
import { OSMLStreamParser } from "./osmlStreamParser";

const MAX_NODES_TO_SYNC = 3;

export function useOSMLSerializer() {
	const { connectorConfig } = useConfig();
	const serializerRef = useRef(new OSMLStreamParser());
	const [nodes, setNodes] = useState<ParsedElement[]>([]);

	const appendChunk = useCallback(
		(chunk: string) => {
			const updated = serializerRef.current.appendChunk(chunk, connectorConfig);
			if (updated) {
				setNodes(
					structuredClone(
						serializerRef.current.getNodes().slice(-1 * MAX_NODES_TO_SYNC),
					),
				);
			}
		},
		[connectorConfig],
	);

	return { nodes, appendChunk };
}
