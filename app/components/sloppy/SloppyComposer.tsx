"use client";

import { useState } from "react";
import {
	ChevronDown,
	Codesandbox,
	CornerDownLeft,
	SquareFilled,
} from "@/components/ui/icon";
import { SelectMenu } from "@/components/ui/select-menu";
import { getDefaultConnector } from "@/lib/connectors/registry";
import { useConfig } from "@/lib/config/ConfigProvider";
import { PanelCard } from "../canvas/panel/PanelCard";
import { ActionButton } from "../copilot/ActionButton";
import { useSloppy } from "./SloppyProvider";

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
				aria-label={`Model: ${model}`}
				onMouseDown={(event) => event.preventDefault()}
				className="inline-flex max-w-[140px] cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-label text-muted-foreground transition-colors hover:bg-button-hover hover:text-foreground"
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

export function SloppyComposer() {
	const { send, stop, loading, streaming } = useSloppy();
	const { connectorConfig } = useConfig();
	const { config } = getDefaultConnector(connectorConfig, "llm");
	const [value, setValue] = useState("");
	const [model, setModel] = useState(config.defaultModel);
	const hasText = value.trim().length > 0;

	const submit = () => {
		if (!hasText || loading) return;
		const message = value;
		setValue("");
		void send(message, model);
	};

	return (
		<PanelCard>
			<textarea
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
				<ModelPicker
					model={model}
					onChange={setModel}
					options={config.models}
				/>
				{streaming ? (
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
						disabled={!hasText || loading}
					/>
				)}
			</div>
		</PanelCard>
	);
}
