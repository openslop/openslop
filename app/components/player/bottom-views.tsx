import type { ReactNode } from "react";
import {
	CollapseTimeline,
	ExpandTimeline,
	Timeline as TimelineIcon,
	type IconComponent,
} from "@/components/ui/icon";
import { ToastErrorBoundary } from "../toast-error-boundary";
import { Storyboard } from "./storyboard/storyboard";
import { Timeline } from "./timeline/timeline";

interface BottomViewConfig {
	label: string;
	icon: IconComponent;
	/** Fills the dock's resizable area; the rest sit at their own height. */
	fillsDock: boolean;
	panel: ReactNode;
}

/** Every view that can occupy the strip under the transport bar. */
export const BOTTOM_VIEWS = {
	timeline: {
		label: "Timeline view",
		icon: TimelineIcon,
		fillsDock: true,
		panel: (
			<ToastErrorBoundary key="timeline" label="Timeline">
				<Timeline />
			</ToastErrorBoundary>
		),
	},
	storyboard: {
		label: "Storyboard view",
		icon: ExpandTimeline,
		fillsDock: false,
		panel: (
			<ToastErrorBoundary key="storyboard" label="Storyboard">
				<Storyboard />
			</ToastErrorBoundary>
		),
	},
	hidden: {
		label: "Hide bottom panel",
		icon: CollapseTimeline,
		fillsDock: false,
		panel: null,
	},
} satisfies Record<string, BottomViewConfig>;

export type BottomView = keyof typeof BOTTOM_VIEWS;

export const BOTTOM_VIEW_KEYS = Object.keys(BOTTOM_VIEWS) as BottomView[];
