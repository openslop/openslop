import { useEffect } from "react";
import { collectWritableMetadata } from "@/lib/canvas/osmlMetadata";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { useProject } from "@/lib/project/useProject";
import { useScriptNodes } from "@/lib/script/ScriptProvider";

export function useMetadataSync(): void {
	const store = useProjectStoreHandle();
	const nodes = useScriptNodes();
	const updateMetadata = useProject((s) => s.updateMetadata);

	useEffect(() => {
		const { metadata } = store.getState();
		updateMetadata(collectWritableMetadata(nodes, metadata));
	}, [nodes, updateMetadata, store]);
}
