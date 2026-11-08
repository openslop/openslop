"use client";

import type { UploadKind } from "@/lib/upload/upload-files";
import { useFileUpload } from "@/lib/upload/use-file-upload";
import { useProject } from "./use-project";

export function useMediaUpload({
	kinds,
	onUpload,
	multiple,
}: {
	kinds: readonly UploadKind[];
	onUpload?: (urls: string[]) => void | Promise<void>;
	multiple?: boolean;
}) {
	const addMedia = useProject((state) => state.addMedia);
	return useFileUpload({
		kinds,
		multiple,
		onUpload: async (uploads) => {
			addMedia(uploads);
			await onUpload?.(uploads.map((upload) => upload.url));
		},
	});
}
