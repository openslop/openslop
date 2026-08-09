import { useEffect } from "react";
import { collectWritableMetadata } from "@/lib/canvas/osmlMetadata";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getProjectStore } from "@/lib/project/store";
import { useProject } from "@/lib/project/useProject";
import { useScriptNodes } from "@/lib/script/ScriptProvider";

export function useMetadataSync(): void {
	const { projectId } = useConfig();
	const nodes = useScriptNodes();
	const updateMetadata = useProject((s) => s.updateMetadata);

	useEffect(() => {
		const { metadata } = getProjectStore(projectId).getState();
		updateMetadata(collectWritableMetadata(nodes, metadata));
	}, [nodes, updateMetadata, projectId]);
}
