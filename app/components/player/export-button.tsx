"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "@/components/ui/icon";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
	PopoverHeader,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SelectField } from "@/components/ui/select-field";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { formatBytes } from "@/lib/format";
import { RESOLUTIONS, type Resolution } from "@/lib/render/resolutions";
import { useQueueSelector } from "@/lib/generation/generation-queue-provider";
import { useSloppy } from "../sloppy/sloppy-provider";
import { useLayout } from "./render-layout-context";
import { useExport } from "./use-export";

const RESOLUTION_OPTIONS = RESOLUTIONS.map((resolution) => ({
	value: resolution,
	label: resolution,
}));

export function ExportButton() {
	const { layout } = useLayout();
	const generating = useQueueSelector((q) => q.isBusy());
	const { loading } = useSloppy();
	const { state, exportVideo, reset, open, setOpen } = useExport();
	const [resolution, setResolution] = useState<Resolution>("1080p");

	const disabled = loading || !layout.series.length || generating;
	const isRendering = state.status === "rendering";

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="panel"
					size="sm"
					className="shrink-0"
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
				className="w-80 font-medium"
			>
				<PopoverHeader title="Export" />

				{(state.status === "starting" || state.status === "rendering") && (
					<div className="animate-fadeInUp flex flex-col gap-2">
						<div className="flex items-center justify-between text-label font-medium">
							<span className="flex items-center gap-2">
								<Spinner className="size-3.5" />
								{isRendering ? "Rendering…" : "Starting…"}
							</span>
							{isRendering && (
								<span className="font-numeric">
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
						<div className="flex items-center justify-between text-label">
							<span>Size</span>
							<span className="font-numeric">{formatBytes(state.size)}</span>
						</div>
						<Button asChild variant="generate" size="sm" className="w-full">
							<a href={state.url} download>
								<Download aria-hidden="true" />
								Download
							</a>
						</Button>
						<Button
							type="button"
							variant="panel"
							size="sm"
							onClick={reset}
							className="w-full"
						>
							Export again
						</Button>
					</div>
				)}

				{(state.status === "idle" || state.status === "error") && (
					<>
						<div className="flex items-center justify-between gap-3">
							<span className="text-label">Resolution</span>
							<SelectField
								value={resolution}
								options={RESOLUTION_OPTIONS}
								onChange={setResolution}
								ariaLabel="Resolution"
							/>
						</div>
						{state.status === "error" && (
							<p role="alert" className="mt-3 text-label text-destructive">
								{state.message}
							</p>
						)}
						<Separator bleed />
						<Button
							type="button"
							variant="generate"
							size="sm"
							onClick={() => exportVideo(layout, resolution)}
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
