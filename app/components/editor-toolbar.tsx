"use client";

import Link from "next/link";
import { memo } from "react";
import { Check, Lock, Sparkles, X } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TooltipIconButton } from "@/components/ui/icon-button";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/generation-queue-provider";
import { useProject } from "@/lib/project/use-project";
import { useGenerateAll } from "./canvas/hooks/use-generate-all";
import {
	countPhrase,
	type GenerateScope,
} from "./canvas/hooks/use-generate-scope";
import { useSloppy } from "./sloppy/sloppy-provider";
import { WAIT_FOR_SLOPPY } from "./sloppy/turn-display";
import { ExportButton } from "./player/export-button";
import { ToolbarProjectCost } from "./project-cost-badge";
import editorStyles from "./editor.module.css";

function Breadcrumbs() {
	const title = useProject((state) => state.title);

	return (
		<nav aria-label="Breadcrumb" className="col-start-2 overflow-hidden">
			<ol className="flex min-w-0 items-center gap-1.5 text-label font-book text-foreground">
				<li className="shrink-0">
					<Button variant="ghost" size="xs" asChild className="font-book">
						<Link href="/">
							<Lock />
							<span className="max-sm:sr-only">Personal</span>
						</Link>
					</Button>
				</li>
				{title && (
					<>
						<li aria-hidden="true" className="shrink-0">
							/
						</li>
						<li className="min-w-0">
							<span aria-current="page" className="block truncate px-2">
								{title}
							</span>
						</li>
					</>
				)}
			</ol>
		</nav>
	);
}

function getGenerateLabel(
	loading: boolean,
	generating: boolean,
	scope: GenerateScope,
): string {
	if (loading) return "Writing…";
	if (generating) return "Generating…";
	if (scope.empty) return "Generate all";
	if (scope.pending === 0) return "All generated";
	return countPhrase(scope);
}

function EditorToolbarComponent() {
	const { loading, writingScript, stop } = useSloppy();
	const scope = useGenerateAll();
	const queue = useGenerationQueue();
	const generating = useQueueSelector((q) => q.isBusy());
	const busy = loading || generating;
	const generateLabel = getGenerateLabel(loading, generating, scope);
	const allGenerated = !scope.empty && scope.pending === 0;
	const unavailable = busy || scope.pending === 0;

	const cancelActions = [
		...(writingScript
			? [{ label: "Cancel writing script", onClick: stop }]
			: []),
		...(generating
			? [{ label: "Cancel generation", onClick: () => queue.cancelAll() }]
			: []),
	];

	return (
		// The first column clears the fixed account avatar.
		<div
			className={`relative z-40 grid w-full shrink-0 grid-cols-[minmax(--spacing(10),1fr)_minmax(0,auto)_1fr] items-center gap-3 px-4 py-1.5 ${editorStyles.copilotEnter}`}
		>
			<Breadcrumbs />
			<div className="flex items-center justify-end gap-2">
				<ToolbarProjectCost />
				{cancelActions.map(({ label, onClick }) => (
					<TooltipIconButton
						key={label}
						label={label}
						variant="quiet"
						size="sm"
						chip
						className="self-center"
						onClick={onClick}
					>
						<X />
					</TooltipIconButton>
				))}
				<Button
					type="button"
					variant="generate"
					size="sm"
					className="shrink-0"
					aria-label={generateLabel}
					tooltip={loading ? WAIT_FOR_SLOPPY : scope.description}
					tooltipSide="bottom"
					unavailable={unavailable}
					onClick={scope.run}
				>
					{busy ? <Spinner /> : allGenerated ? <Check /> : <Sparkles />}
					<span className="hidden sm:inline">{generateLabel}</span>
				</Button>
				<ExportButton />
			</div>
		</div>
	);
}

export const EditorToolbar = memo(EditorToolbarComponent);
