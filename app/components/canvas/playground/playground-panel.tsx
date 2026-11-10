"use client";

import { DraftCard } from "./draft-card";
import { usePlayground } from "./playground-context";
import { PlaygroundLibrary } from "./playground-library";

export function PlaygroundPanel() {
	const { type, setType } = usePlayground();
	return (
		<>
			<DraftCard type={type} onTypeChange={setType} />
			<PlaygroundLibrary type={type} />
		</>
	);
}
