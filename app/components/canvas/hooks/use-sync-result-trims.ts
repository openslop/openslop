"use client";

import { useEffect, useRef } from "react";
import { Editor, Element } from "slate";
import { useSlateStatic } from "slate-react";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import { isCanvasElement } from "@/lib/canvas/guards";
import { syncResultTrimAttrs } from "@/lib/canvas/result-trims";
import { resultIdentity } from "@/lib/connectors/asset-url";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";

/** Projects each element's active result onto its bare trim attrs via resultTrims. */
export function useSyncResultTrims() {
	const editor = useSlateStatic();
	const queue = useGenerationQueue();
	const previous = useRef(new Map<string, string | null>());

	useEffect(() => {
		const sync = () => {
			const next = new Map<string, string | null>();
			for (const [node] of Editor.nodes(editor, {
				at: [],
				match: (n) => Element.isElement(n) && isCanvasElement(n),
			})) {
				if (!isCanvasElement(node)) continue;
				const result = queue.getElementSnapshot(node.id).result;
				const identity = result ? resultIdentity(result) : null;
				next.set(node.id, identity);
				const seen = previous.current.has(node.id);
				const attrs = syncResultTrimAttrs(
					node,
					seen ? (previous.current.get(node.id) ?? null) : null,
					identity,
				);
				if (attrs) mergeAttrs(editor, node.id, attrs);
			}
			previous.current = next;
		};

		sync();
		let lastVersion = queue.getResultVersion();
		return queue.subscribe(() => {
			const version = queue.getResultVersion();
			if (version === lastVersion) return;
			lastVersion = version;
			sync();
		});
	}, [editor, queue]);
}
