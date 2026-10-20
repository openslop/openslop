"use client";

import { useState, type ComponentProps } from "react";
import { useSlateStatic } from "slate-react";
import { Input } from "@/components/ui/input";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import type { ContentElement } from "@/lib/canvas/types";

type InputProps = Omit<
	ComponentProps<typeof Input>,
	"value" | "onChange" | "onBlur" | "onKeyDown" | "aria-invalid"
>;

/** Kept on blur or Enter as `parse` normalizes it; empty clears it, and anything `parse` refuses reverts. */
export function InputAttributeField({
	element,
	attrKey,
	value,
	parse,
	...inputProps
}: InputProps & {
	element: ContentElement;
	attrKey: string;
	value: string;
	parse: (text: string) => string | undefined;
}) {
	const editor = useSlateStatic();
	const [draft, setDraft] = useState(value);
	const text = draft.trim();
	const parsed = text === "" ? null : parse(text);
	const invalid = parsed === undefined;

	const commit = () => {
		if (invalid) return setDraft(value);
		if (parsed !== (value || null))
			mergeAttrs(editor, element.id, { [attrKey]: parsed });
	};

	return (
		<Input
			size="sm"
			autoComplete="off"
			{...inputProps}
			aria-invalid={invalid || undefined}
			value={draft}
			onChange={(event) => setDraft(event.target.value)}
			onBlur={commit}
			onKeyDown={(event) => {
				if (event.key === "Enter") event.currentTarget.blur();
			}}
		/>
	);
}
