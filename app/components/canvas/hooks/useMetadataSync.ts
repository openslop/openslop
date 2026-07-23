import { useEffect } from "react";
import { useProject } from "@/lib/project/useProject";
import type { DeepPartial, Metadata } from "@/lib/project/types";
import { useScriptNodes } from "@/lib/script/ScriptProvider";
import { METADATA_TAG_CONFIGS } from "../config/metadataTags";
import { getElementText } from "@/lib/canvas/osmlSerializer";

export function useMetadataSync(): void {
	const nodes = useScriptNodes();
	const updateMetadata = useProject((s) => s.updateMetadata);

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
		updateMetadata(partial);
	}, [nodes, updateMetadata]);
}
