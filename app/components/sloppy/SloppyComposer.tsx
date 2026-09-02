"use client";

import { useRef, useState } from "react";
import { CornerDownLeft, Lightbulb, SquareFilled } from "@/components/ui/icon";
import {
	ModelSelect,
	ModelSelectTrigger,
} from "@/app/components/connectors/ModelSelect";
import { useDefaultModels } from "@/lib/connectors/useDefaultModels";
import { useProject } from "@/lib/project/useProject";
import { PanelCard } from "../canvas/panel/PanelCard";
import { ActionButton } from "../copilot/ActionButton";
import { useSloppy } from "./SloppyProvider";
import { nextSuggestion, SUGGESTIONS } from "./suggestions";

const controlClassName =
	"focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-label text-muted-foreground transition-colors hover:bg-button-hover hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

function ModelPicker() {
	const model = useDefaultModels().llm;
	const updateMetadata = useProject((state) => state.updateMetadata);
	return (
		<ModelSelect
			type="llm"
			value={model}
			onChange={(llm) => updateMetadata({ connectorModels: { llm } })}
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
			onMouseDown={(event) => event.preventDefault()}
			onClick={onPick}
			className={controlClassName}
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
		const message = value;
		setValue("");
		send(message);
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
				style={{ fieldSizing: "content" }}
				className="max-h-40 w-full resize-none overflow-y-auto bg-transparent font-body text-label text-panel-fg caret-accent outline-none placeholder:text-muted-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring/30"
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
					<ActionButton
						label="Stop Sloppy"
						icon={<SquareFilled className="h-3 w-3" />}
						onClick={stop}
					/>
				) : (
					<ActionButton
						label="Send to Sloppy"
						icon={<CornerDownLeft className="h-4 w-4" />}
						onClick={submit}
						disabled={!hasText}
					/>
				)}
			</div>
		</PanelCard>
	);
}
