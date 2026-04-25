import { useEffect } from "react";
import { useScript } from "@/lib/script/ScriptProvider";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getProjectStore } from "@/lib/project/store";
import { METADATA_TAG_TYPES, type MetadataTagType } from "../types";
import { OSMLSerializer } from "../utils/osmlSerializer";

export function useMetadataSync(): void {
	const { nodes } = useScript();
	const { projectId } = useConfig();

	useEffect(() => {
		const store = getProjectStore(projectId);

		for (const node of nodes) {
			if (!METADATA_TAG_TYPES.has(node.type as MetadataTagType)) continue;

			const text = OSMLSerializer.getTextContent(node).trim();
			if (!text) continue;

			if (node.type === "metadata_style") {
				store.getState().setMetadataStyle(text);
			} else if (node.type === "metadata_character") {
				const name = node.customAttributes?.name ?? "";
				store.getState().setMetadataCharacter(name, text);
			}
		}
	}, [nodes, projectId]);
}
