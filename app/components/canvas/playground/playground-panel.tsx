"use client";

import { useState } from "react";
import { useSlateStatic } from "slate-react";
import { restoreDraft } from "@/lib/canvas/asset-ops";
import {
	draftedType,
	isPlaygroundType,
	type PlaygroundContentType,
} from "@/lib/canvas/types";
import type { ElementVersion } from "@/lib/generation/versions";
import { DraftCard } from "./draft-card";
import { PlaygroundLibrary } from "./playground-library";

export function PlaygroundPanel() {
	const editor = useSlateStatic();
	const [type, setType] = useState<PlaygroundContentType>("image");
	const reuse = (take: ElementVersion) => {
		if (!isPlaygroundType(take.elementType))
			throw new Error(`"${take.elementType}" is not a playground draft`);
		restoreDraft(editor, take.elementType, take);
		setType(draftedType(take.elementType));
	};
	return (
		<>
			<DraftCard type={type} onTypeChange={setType} />
			<PlaygroundLibrary type={type} onReuse={reuse} />
		</>
	);
}
