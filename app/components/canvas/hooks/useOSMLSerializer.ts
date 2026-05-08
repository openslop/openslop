import { useCallback, useRef, useState } from "react";
import type { ParsedElement } from "../types";
import { useConfig } from "@/lib/config/ConfigProvider";
import { OSMLSerializer } from "../utils/osmlSerializer";

const MAX_NODES_TO_SYNC = 3;

export function useOSMLSerializer() {
	const { connectorConfig } = useConfig();
	const serializerRef = useRef(new OSMLSerializer(connectorConfig));
	const [nodes, setNodes] = useState<ParsedElement[]>([]);

	const appendChunk = useCallback((chunk: string) => {
		const updated = serializerRef.current.appendChunk(chunk);
		if (updated) {
			setNodes(
				structuredClone(
					serializerRef.current.getNodes().slice(-1 * MAX_NODES_TO_SYNC),
				),
			);
		}
	}, []);

	return { nodes, appendChunk };
}
