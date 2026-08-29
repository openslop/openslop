"use client";

import {
	ChevronsDownUp,
	ChevronsUpDown,
	Circle,
	Crosshair,
} from "@/components/ui/icon";
import { MediaToggle } from "@/components/ui/media-toggle";
import { useAutoScroll } from "@/app/components/scene-selection/AutoScrollContext";
import { BottomViewToggle } from "@/app/components/video/BottomViewToggle";
import { PlayerPlacementToggle } from "@/app/components/video/PlayerPlacementToggle";
import { useViewMode } from "../ViewModeContext";
import { PanelCard, PanelField } from "./PanelCard";

export function LayoutPanel() {
	const { hasCollapsed, expandAll, collapseAll } = useViewMode();
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
