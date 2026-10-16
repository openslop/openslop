"use client";

import { useState } from "react";
import { useSlateStatic } from "slate-react";
import { Input } from "@/components/ui/input";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import { parseSeconds } from "@/lib/canvas/element-attributes";
import type { ContentElement } from "@/lib/canvas/types";

/** Seconds typed in and kept on blur or Enter. Empty clears it; anything else invalid is refused and reverts. */
export function SecondsAttributeField({
	element,
	attrKey,
	value,
	label,
	min,
}: {
	element: ContentElement;
	attrKey: string;
	value: string;
	label: string;
	min: number;
}) {
	const editor = useSlateStatic();
	const [draft, setDraft] = useState(value);
	const text = draft.trim();
	const parsed = parseSeconds(text, min);
	const invalid = text !== "" && parsed === undefined;

	const commit = () => {
		if (invalid) return setDraft(value);
		const next = parsed === undefined ? null : String(parsed);
		if (next !== (value || null))
			mergeAttrs(editor, element.id, { [attrKey]: next });
	};

	return (
		<Input
			size="sm"
			inputMode="decimal"
			autoComplete="off"
			aria-label={`${label} in seconds`}
			aria-invalid={invalid || undefined}
			placeholder="Auto"
			value={draft}
			onChange={(event) => setDraft(event.target.value)}
			onBlur={commit}
			onKeyDown={(event) => {
				if (event.key === "Enter") event.currentTarget.blur();
			}}
			className="w-20 font-numeric"
		/>
	);
}
