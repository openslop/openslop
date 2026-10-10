"use client";

import {
	ChevronsDownUp,
	ChevronsUpDown,
	Circle,
	Crosshair,
} from "@/components/ui/icon";
import { MediaToggle } from "@/components/ui/media-toggle";
import { useAutoScroll } from "@/app/components/scene-selection/auto-scroll-context";
import { BottomViewToggle } from "@/app/components/player/bottom-view-toggle";
import { PlayerPlacementToggle } from "@/app/components/player/player-placement-toggle";
import { useHasCollapsed, useViewMode } from "../view-mode-context";
import { PanelCard, PanelField } from "./panel-card";

export function LayoutPanel() {
	const { expandAll, collapseAll } = useViewMode();
	const hasCollapsed = useHasCollapsed();
	const { enabled, setEnabled } = useAutoScroll();

	return (
		<>
			<PanelCard title="View">
				<PanelField label="Player position">
					<PlayerPlacementToggle />
				</PanelField>
				<PanelField label="Bottom panel">
					<BottomViewToggle />
				</PanelField>
				<PanelField label="Scenes">
					<MediaToggle
						value={hasCollapsed ? "collapsed" : "expanded"}
						onChange={(value) =>
							value === "expanded" ? expandAll() : collapseAll()
						}
						options={[
							{ value: "expanded", label: "Expand all", icon: ChevronsUpDown },
							{
								value: "collapsed",
								label: "Collapse all",
								icon: ChevronsDownUp,
							},
						]}
					/>
				</PanelField>
			</PanelCard>

			<PanelCard title="Playback">
				<PanelField label="Follow">
					<MediaToggle
						value={enabled ? "current" : "none"}
						onChange={(value) => setEnabled(value === "current")}
						options={[
							{ value: "current", label: "Current scene", icon: Crosshair },
							{ value: "none", label: "None", icon: Circle },
						]}
					/>
				</PanelField>
			</PanelCard>
		</>
	);
}
