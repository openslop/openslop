import { useCallback, useEffect, useRef } from "react";
import type { Descendant } from "slate";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import PQueue from "p-queue";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { getProjectStore } from "@/lib/project/store";
import { extractStoreSnapshot } from "@/lib/project/storeSnapshot";
import { deriveProjectName } from "@/lib/project/projectName";
import { pickThumbnailUrl } from "@/lib/project/thumbnail";
import { saveProject } from "@/lib/project/api";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";

const DEBOUNCE_MS = 2000;
const TOAST_ID = "autosave";
const TOAST_OPTIONS = {
	id: TOAST_ID,
	position: "bottom-right" as const,
	className:
		"!bg-muted !border !border-border !text-muted-foreground !text-xs !shadow-none !rounded-md !py-1.5 !px-2.5 !min-h-0 !w-auto",
	unstyled: false,
	duration: 1500,
};

export function useAutosave(projectId: string, value: Descendant[]): void {
	const queue = useGenerationQueue();
	const valueRef = useRef(value);
	const skipNextRef = useRef(true);
	const debouncedRef = useRef<ReturnType<typeof debounce> | null>(null);

	useEffect(() => {
		valueRef.current = value;
	}, [value]);

	const save = useCallback(async () => {
		const store = getProjectStore(projectId);
		if (!store.getState().hydrated) {
			console.error("Autosave aborted: store not hydrated", { projectId });
			return;
		}
		const snapshot = extractStoreSnapshot(store);
		const script = serializeOSMLWithScenes(valueRef.current);
		const generation = queue.snapshot();
		try {
			await saveProject(projectId, {
				name: deriveProjectName(snapshot.metadata),
				script,
				store: snapshot,
				generation,
				thumbnail_url: pickThumbnailUrl(Object.entries(generation)),
			});
			toast("Saved", TOAST_OPTIONS);
		} catch (err) {
			console.error("Autosave failed", err);
			toast.error("Save failed", { ...TOAST_OPTIONS, duration: 4000 });
		}
	}, [queue, projectId]);

	useEffect(() => {
		const queue = new PQueue({ concurrency: 1 });
		const debounced = debounce(() => {
			queue.clear();
			void queue.add(save);
		}, DEBOUNCE_MS);
		debouncedRef.current = debounced;
		return () => {
			debounced.flush();
			debouncedRef.current = null;
		};
	}, [save]);

	const schedule = useCallback(() => debouncedRef.current?.(), []);

	useEffect(() => {
		if (skipNextRef.current) {
			skipNextRef.current = false;
			return;
		}
		schedule();
	}, [value, schedule]);

	useEffect(() => {
		const unsub = getProjectStore(projectId).subscribe(schedule);
		return unsub;
	}, [projectId, schedule]);

	useEffect(() => {
		let lastVersion = queue.getResultVersion();
		return queue.subscribe(() => {
			const v = queue.getResultVersion();
			if (v === lastVersion) return;
			lastVersion = v;
			schedule();
		});
	}, [queue, schedule]);
}
