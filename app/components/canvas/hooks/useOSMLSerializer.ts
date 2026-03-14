import { useCallback, useRef, useState } from "react";
import { Descendant } from "slate";
import { OSMLSerializer } from "../utils/osmlSerializer";

const MAX_NODES_TO_SYNC = 3;

export function useOSMLSerializer() {
  const serializerRef = useRef<OSMLSerializer>(new OSMLSerializer());
  const [nodes, setNodes] = useState<Descendant[]>([]);

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
