import { useSlateSelector } from "slate-react";
import { shallow } from "zustand/shallow";
import { findImageAsset, kindOfType } from "@/lib/canvas/assets";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import { useQueueSelector } from "@/lib/generation/generation-queue-provider";

/** A named asset's image asset: which one it is, and whatever it last generated. */
export function useImageAsset(name = "") {
	const [id = "", type] = useSlateSelector((editor) => {
		const asset = findImageAsset(editor.children, name);
		return [asset?.id, asset?.type] as const;
	}, shallow);
	return {
		type,
		kind: type && kindOfType(type),
		url: useQueueSelector((q) =>
			getPrimaryUrl(q.getElementSnapshot(id).result, "image"),
		),
		status: useQueueSelector((q) => q.getElementSnapshot(id).status),
		startedAt: useQueueSelector((q) => q.getElementSnapshot(id).startedAt),
	};
}
