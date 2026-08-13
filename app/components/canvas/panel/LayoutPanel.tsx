"use client";

import {
	ChevronsDownUp,
	ChevronsUpDown,
	Circle,
	Crosshair,
} from "@/components/ui/icon";
import { MediaToggle } from "@/components/ui/media-toggle";
import {
	SelectField,
	type SelectFieldOption,
} from "@/components/ui/select-field";
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

	const positionOptions: SelectFieldOption<PlayerPositionValue>[] = [
		{ value: "top", label: "Top" },
		{ value: "right", label: "Right", disabled: narrowViewport },
		{ value: "hidden", label: "Hidden" },
	];

	return (
		<>
			<PanelCard title="View">
				<PanelField label="Player position">
					<SelectField
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
