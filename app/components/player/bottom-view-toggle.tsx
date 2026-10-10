"use client";

import {
	MediaToggle,
	type MediaToggleOption,
} from "@/components/ui/media-toggle";
import {
	BOTTOM_VIEWS,
	BOTTOM_VIEW_KEYS,
	type BottomView,
} from "./bottom-views";
import { useBottomView } from "./bottom-view-context";

const OPTIONS: MediaToggleOption<BottomView>[] = BOTTOM_VIEW_KEYS.map(
	(value) => ({
		value,
		label: BOTTOM_VIEWS[value].label,
		icon: BOTTOM_VIEWS[value].icon,
	}),
);

export function BottomViewToggle() {
	const { view, setView } = useBottomView();
	return (
		<MediaToggle
			ariaLabel="Bottom panel view"
			value={view}
			options={OPTIONS}
			onChange={setView}
		/>
	);
}
