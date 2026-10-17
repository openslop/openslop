"use client";

import { useState, type ReactNode } from "react";
import { createStoreContext } from "@/lib/store/create-store-context";
import { PendingUploads } from "./pending-uploads";

const [PendingUploadsContext, usePendingUploads, usePendingUploadsSelector] =
	createStoreContext<PendingUploads>("PendingUploadsContext");
export { usePendingUploads, usePendingUploadsSelector };

export function PendingUploadsProvider({ children }: { children: ReactNode }) {
	const [uploads] = useState(() => new PendingUploads());
	return (
		<PendingUploadsContext value={uploads}>{children}</PendingUploadsContext>
	);
}
