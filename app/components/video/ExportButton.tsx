"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CloseButton } from "@/components/ui/close-button";
import { Download } from "@/components/ui/icon";
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
import { RESOLUTIONS, scaleForWidth } from "@/lib/video/resolutions";
import { BASE_WIDTH } from "@/lib/video/types";
import { useRender } from "./RenderProvider";
import { useLayout } from "./VideoLayoutContext";

const triggerClass =
	"shrink-0 border-tertiary/50 bg-tertiary/10 text-tertiary hover:bg-tertiary/20 sm:px-4";

export function ExportButton() {
	const { layout, ready } = useLayout();
	const { loading } = useScriptControl();
	const { state, render, reset, open, setOpen } = useRender();
	const [width, setWidth] = useState(BASE_WIDTH);

	const disabled = loading || !layout?.series.length || !ready;
	const isRendering = state.status === "rendering";

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="secondary"
					size="sm"
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
				className="w-80 p-3 font-medium"
			>
				<div className="flex items-center justify-between">
					<span className="text-xs font-semibold">Export</span>
					<CloseButton onClick={() => setOpen(false)} />
				</div>
				<Separator className="-mx-3 my-2 data-[orientation=horizontal]:w-[calc(100%+1.5rem)]" />

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
						<Button asChild variant="generate" size="sm" className="w-full">
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
							<span className="text-xs">Resolution</span>
							<Select
								value={String(width)}
								onValueChange={(value) => setWidth(Number(value))}
							>
								<SelectTrigger size="sm">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{RESOLUTIONS.map((resolution) => (
										<SelectItem
											key={resolution.width}
											value={String(resolution.width)}
											className="text-xs"
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
						<Separator className="-mx-3 my-2 data-[orientation=horizontal]:w-[calc(100%+1.5rem)]" />
						<Button
							type="button"
							variant="generate"
							size="sm"
							onClick={() => layout && render(layout, scaleForWidth(width))}
							disabled={disabled}
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
