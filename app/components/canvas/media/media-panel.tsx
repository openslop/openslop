"use client";

import { DraftCard } from "./draft-card";
import { useMediaPanel } from "./media-panel-context";
import { MediaLibrary } from "./media-library";

export function MediaPanel() {
	const { type, setType } = useMediaPanel();
	return (
		<>
			<DraftCard type={type} onTypeChange={setType} />
			<MediaLibrary type={type} />
		</>
	);
}
