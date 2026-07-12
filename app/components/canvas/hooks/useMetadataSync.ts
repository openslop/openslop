import { useEffect } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getProjectStore } from "@/lib/project/store";
import type { DeepPartial, Metadata } from "@/lib/project/types";
import { useScriptNodes } from "@/lib/script/ScriptProvider";
import { METADATA_TAG_CONFIGS } from "../config/metadataTags";
import { getElementText } from "@/lib/canvas/osmlSerializer";

export function useMetadataSync(): void {
	const nodes = useScriptNodes();
	const { projectId } = useConfig();

	useEffect(() => {
		const partial: DeepPartial<Metadata> = {};
		for (const node of nodes) {
			const config = METADATA_TAG_CONFIGS[node.type];
			if (!config) continue;
			config.apply(
				partial,
				node.customAttributes ?? {},
				getElementText(node).trim(),
			);
		}
		getProjectStore(projectId).getState().updateMetadata(partial);
	}, [nodes, projectId]);
}
