"use client";

import { useState } from "react";
import { UploadKindSchema, type UploadKind } from "@/lib/upload/upload-files";
import { findMedia } from "./media";
import { useMediaUpload } from "./use-media-upload";
import { useProject } from "./use-project";

/** The project's media of the kind and query chosen, with the picker that uploads more. */
export function useMediaLibrary() {
	const [kind, setKind] = useState<UploadKind>("image");
	const [query, setQuery] = useState("");
	const media = useProject((state) => state.media);
	const upload = useMediaUpload({
		kinds: UploadKindSchema.options,
		multiple: true,
	});
	return {
		kind,
		setKind,
		query,
		setQuery,
		items: findMedia(media, kind, query),
		...upload,
	};
}
