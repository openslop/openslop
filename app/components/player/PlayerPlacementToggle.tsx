"use client";

import { MonitorOff, PanelRight, PanelTop } from "@/components/ui/icon";
import {
	MediaToggle,
	type MediaToggleOption,
} from "@/components/ui/media-toggle";
import {
	usePlayerPlacement,
	type PlayerPlacement,
} from "./PlayerPlacementContext";

export function PlayerPlacementToggle() {
	const { placement, setPlacement, narrowViewport } = usePlayerPlacement();
	const options: MediaToggleOption<PlayerPlacement>[] = [
		{ value: "top", label: "Top", icon: PanelTop },
		{
			value: "right",
			label: "Right",
			icon: PanelRight,
			disabled: narrowViewport,
		},
		{ value: "hidden", label: "Hidden", icon: MonitorOff },
	];

	return (
		<MediaToggle
			value={placement}
			options={options}
			onChange={setPlacement}
			ariaLabel="Player position"
		/>
	);
}
