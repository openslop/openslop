"use client";

import TextareaAutosize from "react-textarea-autosize";
import { useRef, useState } from "react";
import { CornerDownLeft, Lightbulb, SquareFilled } from "@/components/ui/icon";
import { keepFocus } from "@/components/ui/keep-focus";
import {
	ModelSelect,
	ModelSelectTrigger,
} from "@/app/components/models/model-select";
import { useDefaultModels } from "@/lib/connectors/use-default-models";
import {
	TYPE_MESSAGE,
	WAIT_FOR_SLOPPY,
} from "@/lib/components/unavailable-reasons";
import { useProject } from "@/lib/project/use-project";
import { pickOther } from "@/lib/utils";
import { PanelCard } from "../canvas/panel/panel-card";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { useSloppy } from "./sloppy-provider";
import { SUGGESTIONS } from "./suggestions";

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
	unavailable,
	reason,
}: {
	onPick: () => void;
	unavailable: boolean;
	reason?: string;
}) {
	return (
		<TooltipIconButton
			label="Suggest a prompt"
			reason={reason}
			variant="quiet"
			size="sm"
			unavailable={unavailable}
			onMouseDown={keepFocus}
			onClick={onPick}
		>
			<Lightbulb />
		</TooltipIconButton>
	);
}

export function SloppyComposer() {
	const { send, stop, loading } = useSloppy();
	const [value, setValue] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const hasText = value.trim().length > 0;
	const showsSuggestion = SUGGESTIONS.includes(value);

	const suggest = () => {
		setValue(pickOther(SUGGESTIONS, value));
		textareaRef.current?.focus();
	};

	const submit = () => {
		if (!hasText || loading) return;
		setValue("");
		send(value);
	};

	return (
		<PanelCard>
			<TextareaAutosize
				ref={textareaRef}
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
				className="max-h-40 w-full resize-none overflow-y-auto bg-transparent font-body text-label text-panel-fg caret-accent outline-none placeholder:text-muted-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring/30"
			/>
			<div className="flex items-center justify-between gap-2">
				<div className="flex min-w-0 items-center gap-1">
					<ModelPicker />
					<SuggestionButton
						onPick={suggest}
						unavailable={loading || (hasText && !showsSuggestion)}
						reason={loading ? WAIT_FOR_SLOPPY : undefined}
					/>
				</div>
				{loading ? (
					<TooltipIconButton label="Stop Sloppy" onClick={stop}>
						<SquareFilled />
					</TooltipIconButton>
				) : (
					<TooltipIconButton
						label="Send to Sloppy"
						reason={TYPE_MESSAGE}
						onClick={submit}
						unavailable={!hasText}
					>
						<CornerDownLeft />
					</TooltipIconButton>
				)}
			</div>
		</PanelCard>
	);
}
