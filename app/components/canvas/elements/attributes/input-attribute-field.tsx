"use client";

import { useState, type ComponentProps } from "react";
import { useSlateStatic } from "slate-react";
import { RotateCcw } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import type { ContentElement } from "@/lib/canvas/types";

type InputProps = Omit<
	ComponentProps<typeof Input>,
	"value" | "onChange" | "onBlur" | "onKeyDown" | "aria-invalid"
>;

/** Kept on blur or Enter as `parse` normalizes it; empty or Reset clears it, and anything `parse` refuses reverts. */
export function InputAttributeField({
	element,
	attrKey,
	value,
	label,
	parse,
	...inputProps
}: InputProps & {
	element: ContentElement;
	attrKey: string;
	value: string;
	label: string;
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
		<div className="flex items-center gap-1">
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
			{value ? (
				<TooltipIconButton
					label={`Reset ${label.toLowerCase()}`}
					size="sm"
					variant="quiet"
					onClick={() => mergeAttrs(editor, element.id, { [attrKey]: null })}
				>
					<RotateCcw size={12} />
				</TooltipIconButton>
			) : null}
		</div>
	);
}
