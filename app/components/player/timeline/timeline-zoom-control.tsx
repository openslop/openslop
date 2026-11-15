"use client";

import { ActionMenu } from "@/components/ui/action-menu";
import {
	ArrowsStretch,
	Minus,
	Plus,
	ZoomIn,
	ZoomOut,
} from "@/components/ui/icon";
import { Stepper, StepperButton, StepperValue } from "@/components/ui/stepper";
import { useBottomView } from "../bottom-view-context";
import { useTimelineZoomContext } from "./timeline-zoom-context";

export function TimelineZoomControl() {
	const { view } = useBottomView();
	const { zoom, zoomIn, zoomOut, zoomToFit, canZoomIn, canZoomOut } =
		useTimelineZoomContext();
	const percent = `${Math.round(zoom * 100)}%`;

	return (
		<Stepper aria-label="Timeline zoom" disabled={view !== "timeline"}>
			<StepperButton label="Zoom out" onClick={zoomOut} disabled={!canZoomOut}>
				<Minus />
			</StepperButton>
			<ActionMenu
				side="top"
				align="center"
				items={[
					{
						key: "in",
						label: "Zoom in",
						icon: <ZoomIn />,
						onSelect: zoomIn,
						disabled: !canZoomIn,
					},
					{
						key: "out",
						label: "Zoom out",
						icon: <ZoomOut />,
						onSelect: zoomOut,
						disabled: !canZoomOut,
					},
					{
						key: "fit",
						label: "Zoom to 100%",
						icon: <ArrowsStretch />,
						onSelect: zoomToFit,
						disabled: !canZoomOut,
					},
				]}
			>
				<StepperValue aria-label={`Zoom options (${percent})`}>
					{percent}
				</StepperValue>
			</ActionMenu>
			<StepperButton label="Zoom in" onClick={zoomIn} disabled={!canZoomIn}>
				<Plus />
			</StepperButton>
		</Stepper>
	);
}
