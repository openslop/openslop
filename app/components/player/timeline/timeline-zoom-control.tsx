"use client";

import { Minus, Plus } from "@/components/ui/icon";
import {
	Stepper,
	StepperButton,
	StepperScrubValue,
} from "@/components/ui/stepper";
import { useBottomView } from "../bottom-view-context";
import { useTimelineZoomContext } from "./timeline-zoom-context";
import { ZOOM_RANGE } from "./use-timeline-zoom";

export function TimelineZoomControl() {
	const { view } = useBottomView();
	const { zoom, setZoom, zoomIn, zoomOut, canZoomIn, canZoomOut } =
		useTimelineZoomContext();
	const disabled = view !== "timeline";

	return (
		<Stepper aria-label="Timeline zoom" disabled={disabled}>
			<StepperButton label="Zoom out" onClick={zoomOut} disabled={!canZoomOut}>
				<Minus />
			</StepperButton>
			<StepperScrubValue
				label="Zoom, drag to change, double-click to reset"
				value={zoom}
				suffix="%"
				{...ZOOM_RANGE}
				resetValue={ZOOM_RANGE.min}
				disabled={disabled}
				onChange={setZoom}
			/>
			<StepperButton label="Zoom in" onClick={zoomIn} disabled={!canZoomIn}>
				<Plus />
			</StepperButton>
		</Stepper>
	);
}
