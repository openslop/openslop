"use client";

import { useRef, useState } from "react";
import {
	ChevronDown,
	Codesandbox,
	CornerDownLeft,
	Lightbulb,
	SquareFilled,
	X,
} from "@/components/ui/icon";
import { SelectMenu } from "@/components/ui/select-menu";
import { cn } from "@/lib/utils";
import { PanelCard } from "../canvas/panel/PanelCard";
import { ActionButton } from "../copilot/ActionButton";
import { useSloppyModel } from "./SloppyModelProvider";
import { useSloppy } from "./SloppyProvider";
import { nextSuggestion, SUGGESTIONS } from "./suggestions";

const controlClassName =
	"focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-label text-muted-foreground transition-colors hover:bg-button-hover hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

function ModelPicker({
	model,
	onChange,
	options,
}: {
	model: string;
	onChange: (next: string) => void;
	options: string[];
}) {
	return (
		<SelectMenu
			value={model}
			onChange={onChange}
			options={options.map((option) => ({
				value: option,
				label: option,
			}))}
			contentClassName="max-h-64 min-w-24"
		>
			<button
				type="button"
				aria-label={`Model: ${model}`}
				onMouseDown={(event) => event.preventDefault()}
				className={cn(controlClassName, "max-w-[140px]")}
			>
				<Codesandbox
					className="h-3 w-3 shrink-0 opacity-70"
					aria-hidden="true"
				/>
				<span className="min-w-0 truncate">{model}</span>
				<ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
			</button>
		</SelectMenu>
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

/**
 * Messages typed while a turn was running. Editing one pulls it back out of the
 * queue and into the textarea, so a pending message is only ever text.
 */
function QueuedMessages({ onEdit }: { onEdit: (text: string) => void }) {
	const { queued, dropQueued } = useSloppy();

	if (queued.length === 0) return null;

	return (
		<ul aria-label="Queued messages" className="flex flex-col gap-1">
			{queued.map(({ id, text }) => (
				<li
					key={id}
					className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1"
				>
					<button
						type="button"
						aria-label={`Edit queued message: ${text}`}
						onClick={() => {
							dropQueued(id);
							onEdit(text);
						}}
						className="focus-ring min-w-0 flex-1 cursor-pointer truncate rounded-sm text-left text-label text-muted-foreground transition-colors hover:text-panel-fg"
					>
						{text}
					</button>
					<button
						type="button"
						aria-label={`Remove queued message: ${text}`}
						onClick={() => dropQueued(id)}
						className="focus-ring shrink-0 cursor-pointer rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-panel-fg"
					>
						<X className="h-3 w-3" aria-hidden="true" />
					</button>
				</li>
			))}
		</ul>
	);
}

export function SloppyComposer() {
	const { send, stop, loading } = useSloppy();
	const { model, setModel, models } = useSloppyModel();
	const [value, setValue] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const hasText = value.trim().length > 0;
	const showsSuggestion = SUGGESTIONS.includes(value);

	const suggest = () => {
		setValue(nextSuggestion(value));
		textareaRef.current?.focus();
	};

	const submit = () => {
		if (!hasText) return;
		const message = value;
		setValue("");
		send(message);
	};

	const edit = (text: string) => {
		setValue(text);
		textareaRef.current?.focus();
	};

	return (
		<PanelCard>
			<QueuedMessages onEdit={edit} />
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
					<ModelPicker model={model} onChange={setModel} options={models} />
					<SuggestionButton
						onPick={suggest}
						disabled={hasText && !showsSuggestion}
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
