"use client";

import {
	ChevronsDownUp,
	ChevronsUpDown,
	Circle,
	Crosshair,
	EyeOff,
	PanelRight,
	PanelTop,
} from "@/components/ui/icon";
import {
	MediaToggle,
	type MediaToggleOption,
} from "@/components/ui/media-toggle";
import { useAutoScroll } from "@/app/components/scene-selection/AutoScrollContext";
import { BottomViewToggle } from "@/app/components/video/BottomViewToggle";
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

	const positionOptions: MediaToggleOption<PlayerPositionValue>[] = [
		{ value: "top", label: "Top", icon: PanelTop },
		{
			value: "right",
			label: "Right",
			icon: PanelRight,
			disabled: narrowViewport,
		},
		{ value: "hidden", label: "Hidden", icon: EyeOff },
	];

	return (
		<>
			<PanelCard title="View">
				<PanelField label="Player position">
					<MediaToggle
						value={positionValue}
						options={positionOptions}
						onChange={onPositionChange}
						ariaLabel="Player position"
					/>
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
