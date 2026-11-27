"use client";

import { toast } from "sonner";

/** Resolves true once nothing it holds is left unsaved. */
type PendingWork = () => Promise<boolean>;

const pendingWork = new Set<PendingWork>();

/** Holds a reload back until `work` reports everything saved; returns the unregister. */
export function holdReloadFor(work: PendingWork): () => void {
	pendingWork.add(work);
	return () => pendingWork.delete(work);
}

/** Reloads once every holder has saved, and not at all if one couldn't, which has said why. */
export async function reloadWhenSaved(): Promise<void> {
	const saved = await Promise.all(Array.from(pendingWork, (work) => work()));
	if (saved.every(Boolean)) location.reload();
}

const NEW_VERSION_TOAST = "new-version";

/** Offers a reload into the newer deployment, until the user reloads or closes it. */
export function toastNewVersion(): void {
	toast("A new version of OpenSlop is available", {
		id: NEW_VERSION_TOAST,
		duration: Number.POSITIVE_INFINITY,
		closeButton: true,
		action: {
			label: "Reload",
			onClick: (event) => {
				event.preventDefault();
				void reloadWhenSaved();
			},
		},
	});
}
