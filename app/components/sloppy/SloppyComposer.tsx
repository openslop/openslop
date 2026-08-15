"use client";

import { useState } from "react";
import { CornerDownLeft, SquareFilled } from "@/components/ui/icon";
import { PanelCard } from "../canvas/panel/PanelCard";
import { ActionButton } from "../copilot/ActionButton";
import { useSloppy } from "./SloppyProvider";

export function SloppyComposer() {
	const { send, stop, loading } = useSloppy();
	const [value, setValue] = useState("");
	const hasText = value.trim().length > 0;

	const submit = () => {
		if (!hasText || loading) return;
		const message = value;
		setValue("");
		void send(message);
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
			<div className="flex justify-end">
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
