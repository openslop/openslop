import { useEffect, useMemo, useRef } from "react";
import type { Descendant } from "slate";
import { toast } from "sonner";
import { toastError } from "@/lib/toastError";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { createAutosaver } from "@/lib/project/autosave";
import { getProjectStore } from "@/lib/project/store";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";

const TOAST_OPTIONS = {
	id: "autosave",
	position: "bottom-right" as const,
	className:
		"!bg-muted !border !border-border !text-muted-foreground !text-xs !shadow-none !rounded-md !py-1.5 !px-2.5 !min-h-0 !w-auto",
	unstyled: false,
	duration: 1500,
};

export function useAutosave(projectId: string, value: Descendant[]): void {
	const queue = useGenerationQueue();
	const skipNextRef = useRef(true);

	const autosaver = useMemo(
		() =>
			createAutosaver({
				projectId,
				getGeneration: () => queue.snapshot(),
				onSaved: () => toast("Saved", TOAST_OPTIONS),
				onError: (err) =>
					toastError(err, "Save failed", {
						...TOAST_OPTIONS,
						duration: 4000,
					}),
			}),
		[projectId, queue],
	);

	useEffect(() => () => autosaver.flush(), [autosaver]);

	useEffect(() => {
		autosaver.setScriptSource(() => serializeOSMLWithScenes(value));
		if (skipNextRef.current) {
			skipNextRef.current = false;
			return;
		}
		autosaver.schedule();
	}, [value, autosaver]);

	useEffect(
		() => getProjectStore(projectId).subscribe(autosaver.schedule),
		[projectId, autosaver],
	);

	useEffect(() => {
		let lastVersion = queue.getResultVersion();
		return queue.subscribe(() => {
			const v = queue.getResultVersion();
			if (v === lastVersion) return;
			lastVersion = v;
			autosaver.schedule();
		});
	}, [queue, autosaver]);
}
