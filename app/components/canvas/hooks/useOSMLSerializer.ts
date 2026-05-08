import { useCallback, useRef, useState } from "react";
import type { ParsedElement } from "../types";
import { useConfig } from "@/lib/config/ConfigProvider";
import { OSMLSerializer } from "../utils/osmlSerializer";

const MAX_NODES_TO_SYNC = 3;

export function useOSMLSerializer() {
	const { connectorConfig } = useConfig();
	const serializerRef = useRef<OSMLSerializer | null>(null);
	if (serializerRef.current == null) {
		serializerRef.current = new OSMLSerializer(connectorConfig);
	}
	const [nodes, setNodes] = useState<ParsedElement[]>([]);

	const appendChunk = useCallback((chunk: string) => {
		const serializer = serializerRef.current;
		if (!serializer) return;
		const updated = serializer.appendChunk(chunk);
		if (updated) {
			setNodes(
				structuredClone(serializer.getNodes().slice(-1 * MAX_NODES_TO_SYNC)),
			);
		}
	}, []);

	return { nodes, appendChunk };
}
