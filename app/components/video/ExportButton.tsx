"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "@/components/ui/icon";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { formatBytes } from "@/lib/format";
import { useScriptControl } from "@/lib/script/ScriptProvider";
import { RESOLUTIONS, scaleForHeight } from "@/lib/video/resolutions";
import { formatDuration } from "@/lib/video/timestamps";
import { BASE_HEIGHT } from "@/lib/video/types";
import { useRender } from "./RenderProvider";
import { useLayout } from "./VideoLayoutContext";

const triggerClass =
	"h-11 shrink-0 border-[#D697C0] bg-[#F1E1EA] px-4 text-[#772A4D] hover:bg-[#E6CADA] sm:px-5 dark:border-[#9D4968] dark:bg-[#4E2238] dark:text-[#E5B6D1] dark:hover:bg-[#6F3653]";

export function ExportButton() {
	const { layout, ready } = useLayout();
	const { loading } = useScriptControl();
	const { state, render, reset, open, setOpen } = useRender();
	const [height, setHeight] = useState(BASE_HEIGHT);

	const disabled = loading || !layout?.series.length || !ready;
	const isRendering = state.status === "rendering";

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="secondary"
					className={triggerClass}
					aria-label="Export"
					disabled={disabled}
				>
					<Download aria-hidden="true" />
					<span className="hidden sm:inline">Export</span>
				</Button>
			</PopoverTrigger>
			{/* Dock the popover to the viewport's bottom-right, independent of the toolbar trigger. */}
			<PopoverAnchor className="pointer-events-none fixed right-4 bottom-4" />
			<PopoverContent
				align="end"
				side="top"
				sideOffset={8}
				className="w-80 p-4"
			>
				<div className="flex items-center justify-between">
					<span className="text-sm font-semibold">Export</span>
					<button
						type="button"
						onClick={() => setOpen(false)}
						aria-label="Close"
						className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						<X size={16} />
					</button>
				</div>
				<Separator className="my-3" />

				{(state.status === "invoking" || state.status === "rendering") && (
					<div className="animate-fadeInUp flex flex-col gap-2">
						<div className="flex items-center justify-between text-xs font-medium">
							<span className="flex items-center gap-2">
								<Spinner className="size-3.5" />
								{isRendering ? "Rendering…" : "Starting…"}
							</span>
							{isRendering && (
								<span className="font-mono tabular-nums">
									{Math.round(state.progress * 100)}%
								</span>
							)}
						</div>
						<Progress
							value={isRendering ? state.progress * 100 : 0}
							className="h-2.5"
						/>
					</div>
				)}

				{state.status === "done" && (
					<div className="flex animate-in flex-col gap-3 fade-in">
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">Size</span>
							<span className="font-mono tabular-nums">
								{formatBytes(state.size)}
							</span>
						</div>
						{layout && (
							<div className="flex items-center justify-between text-xs">
								<span className="text-muted-foreground">Duration</span>
								<span className="font-mono tabular-nums">
									{formatDuration(layout.totalDurationSec)}
								</span>
							</div>
						)}
						<Button asChild variant="generate" className="h-11 w-full">
							<a href={state.url} download>
								<Download aria-hidden="true" />
								Download
							</a>
						</Button>
						<button
							type="button"
							onClick={reset}
							className="text-xs text-muted-foreground transition-colors hover:text-foreground"
						>
							Export again
						</button>
					</div>
				)}

				{(state.status === "idle" || state.status === "error") && (
					<>
						<div className="flex items-center justify-between gap-3">
							<span className="text-sm">Resolution</span>
							<Select
								value={String(height)}
								onValueChange={(value) => setHeight(Number(value))}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{RESOLUTIONS.map((resolution) => (
										<SelectItem
											key={resolution.height}
											value={String(resolution.height)}
										>
											{resolution.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						{state.status === "error" && (
							<p className="mt-3 text-xs text-destructive">{state.message}</p>
						)}
						<Separator className="my-3" />
						<Button
							type="button"
							variant="generate"
							onClick={() => layout && render(layout, scaleForHeight(height))}
							disabled={!layout}
							className="w-full"
						>
							<Download aria-hidden="true" />
							Export
						</Button>
					</>
				)}
			</PopoverContent>
		</Popover>
	);
}
