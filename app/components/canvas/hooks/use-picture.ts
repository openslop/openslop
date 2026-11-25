import { useSlateSelector } from "slate-react";
import { shallow } from "zustand/shallow";
import { findPicture, kindOfType } from "@/lib/canvas/assets";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import { useQueueSelector } from "@/lib/generation/generation-queue-provider";

/** A named asset's picture: which asset it is, and whatever it last generated. */
export function usePicture(name = "") {
	const [id = "", type] = useSlateSelector((editor) => {
		const picture = findPicture(editor.children, name);
		return [picture?.id, picture?.type] as const;
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
