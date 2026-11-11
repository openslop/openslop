"use client";

import { useRef, useState } from "react";
import { CornerDownLeft, Lightbulb, SquareFilled } from "@/components/ui/icon";
import { keepFocus } from "@/components/ui/keep-focus";
import { inlineControlClassName } from "@/components/ui/select-menu";
import {
	ModelSelect,
	ModelSelectTrigger,
} from "@/app/components/models/model-select";
import { useDefaultModels } from "@/lib/connectors/use-default-models";
import { useProject } from "@/lib/project/use-project";
import { PanelCard } from "../canvas/panel/panel-card";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { useSloppy } from "./sloppy-provider";
import { nextSuggestion, SUGGESTIONS } from "./suggestions";

function ModelPicker() {
	const model = useDefaultModels().llm;
	const updateModels = useProject((state) => state.updateModels);
	return (
		<ModelSelect
			type="llm"
			value={model}
			onChange={(llm) => updateModels({ llm })}
			side="top"
		>
			<ModelSelectTrigger model={model} label="Model" />
		</ModelSelect>
	);
}

function SuggestionButton({
	onPick,
	disabled,
}: {
	onPick: () => void;
	disabled: boolean;
}) {
	return (
		<button
			type="button"
			aria-label="Suggest a prompt"
			disabled={disabled}
			onMouseDown={keepFocus}
			onClick={onPick}
			className={inlineControlClassName}
		>
			<Lightbulb className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
		</button>
	);
}

export function SloppyComposer() {
	const { send, stop, loading } = useSloppy();
	const [value, setValue] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const hasText = value.trim().length > 0;
	const showsSuggestion = SUGGESTIONS.includes(value);

	const suggest = () => {
		setValue(nextSuggestion(value));
		textareaRef.current?.focus();
	};

	const submit = () => {
		if (!hasText || loading) return;
		setValue("");
		send(value);
	};

	return (
		<PanelCard>
			<textarea
				ref={textareaRef}
				rows={2}
				name="message"
				autoComplete="off"
				aria-label="Message Sloppy"
				value={value}
				onChange={(event) => setValue(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === "Enter" && !event.shiftKey) {
						event.preventDefault();
						submit();
					}
				}}
				placeholder="Write or change the script…"
				className="field-sizing-content max-h-40 w-full resize-none overflow-y-auto bg-transparent font-body text-label text-panel-fg caret-accent outline-none placeholder:text-muted-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring/30"
			/>
			<div className="flex items-center justify-between gap-2">
				<div className="flex min-w-0 items-center gap-1">
					<ModelPicker />
					<SuggestionButton
						onPick={suggest}
						disabled={loading || (hasText && !showsSuggestion)}
					/>
				</div>
				{loading ? (
					<TooltipIconButton label="Stop Sloppy" onClick={stop}>
						<SquareFilled />
					</TooltipIconButton>
				) : (
					<TooltipIconButton
						label="Send to Sloppy"
						onClick={submit}
						disabled={!hasText}
					>
						<CornerDownLeft />
					</TooltipIconButton>
				)}
			</div>
		</PanelCard>
	);
}
