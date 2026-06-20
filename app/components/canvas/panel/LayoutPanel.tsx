"use client";

import {
	ChevronsDownUp,
	ChevronsUpDown,
	Circle,
	Crosshair,
} from "@/components/ui/icon";
import { MediaToggle } from "@/components/ui/media-toggle";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAutoScroll } from "@/app/components/scene-selection/AutoScrollContext";
import { usePlayerPosition } from "@/app/components/video/PlayerPositionContext";
import { useViewMode } from "../ViewModeContext";
import { PanelCard, PanelField } from "./PanelCard";

type PlayerPositionValue = "top" | "right" | "hidden";

export function LayoutPanel() {
	const { position, visible, setPosition, setVisible, narrowViewport } =
		usePlayerPosition();
	const { hasCollapsed, expandAll, collapseAll } = useViewMode();
	const { enabled, setEnabled } = useAutoScroll();

	const positionValue: PlayerPositionValue = visible ? position : "hidden";
	const onPositionChange = (value: PlayerPositionValue) => {
		if (value === "hidden") {
			setVisible(false);
			return;
		}
		setPosition(value);
		setVisible(true);
	};

	return (
		<>
			<PanelCard title="View">
				<PanelField label="Player position">
					<Select
						value={positionValue}
						onValueChange={(value) =>
							onPositionChange(value as PlayerPositionValue)
						}
					>
						<SelectTrigger size="sm" aria-label="Player position">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="top" className="text-xs">
								Top
							</SelectItem>
							<SelectItem
								value="right"
								disabled={narrowViewport}
								className="text-xs"
							>
								Right
							</SelectItem>
							<SelectItem value="hidden" className="text-xs">
								Hidden
							</SelectItem>
						</SelectContent>
					</Select>
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
