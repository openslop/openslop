"use client";

import { useState } from "react";
import type { Editor } from "slate";
import { Sparkles, X } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useScriptControl } from "@/lib/script/ScriptProvider";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import InlineCopilot from "./copilot/InlineCopilot";
import { useGenerateAll } from "./canvas/hooks/useGenerateAll";
import { useRefine } from "./canvas/RefineProvider";
import { ExportButton } from "./video/ExportButton";
import editorStyles from "./Editor.module.css";

function RefineComposer({
	loading,
	onStop,
}: {
	loading: boolean;
	onStop: () => void;
}) {
	const [value, setValue] = useState("");
	const { refineScript, refineLoading, stopRefine } = useRefine();
	return (
		<InlineCopilot
			value={value}
			onValueChange={setValue}
			onSubmit={() => {
				refineScript(value);
				setValue("");
			}}
			onStop={refineLoading ? stopRefine : onStop}
			loading={loading || refineLoading}
			placeholder="Refine your script…"
		/>
	);
}

function getGenerateLabel(loading: boolean, generating: boolean): string {
	if (loading) return "Writing…";
	if (generating) return "Generating…";
	return "Generate All";
}

export function EditorToolbar({ editor }: { editor: Editor }) {
	const { loading, stopGeneration } = useScriptControl();
	const { generateAll } = useGenerateAll(editor);
	const queue = useGenerationQueue();
	const generating = useQueueSelector((q) => q.isBusy());
	const busy = loading || generating;
	const generateLabel = getGenerateLabel(loading, generating);

	return (
		<div
			className={`z-40 flex w-full shrink-0 flex-col items-center gap-3 px-4 py-1.5 pl-16 ${editorStyles.copilotEnter}`}
		>
			<div className="flex w-full items-center gap-3">
				<div className="hidden flex-1 sm:block" aria-hidden />
				<div className="min-w-0 max-w-2xl flex-1">
					<RefineComposer loading={loading} onStop={stopGeneration} />
				</div>
				<div className="flex flex-1 items-center justify-end gap-2 max-sm:flex-none">
					<Button
						type="button"
						variant="generate"
						size="sm"
						onClick={generateAll}
						className="shrink-0 sm:px-4"
						aria-label={generateLabel}
						disabled={busy}
					>
						{busy ? (
							<Spinner className="text-current" />
						) : (
							<Sparkles aria-hidden="true" />
						)}
						<span className="hidden sm:inline">{generateLabel}</span>
					</Button>
					<ExportButton />
					{generating && (
						<SimpleTooltip label="Cancel generation">
							<button
								type="button"
								onClick={() => queue.cancelAll()}
								aria-label="Cancel generation"
								className="relative flex h-7 w-7 shrink-0 items-center justify-center self-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-button-hover hover:text-foreground"
							>
								<X className="h-3 w-3" aria-hidden="true" />
							</button>
						</SimpleTooltip>
					)}
				</div>
			</div>
		</div>
	);
}
