import { useEffect } from "react";
import { collectMetadata } from "@/lib/canvas/osmlMetadata";
import { useProject } from "@/lib/project/useProject";
import { useScriptNodes } from "@/lib/script/ScriptProvider";

export function useMetadataSync(): void {
	const nodes = useScriptNodes();
	const updateMetadata = useProject((s) => s.updateMetadata);

	useEffect(() => {
		updateMetadata(collectMetadata(nodes));
	}, [nodes, updateMetadata]);
}
