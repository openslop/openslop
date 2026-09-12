"use client";

import {
	MediaToggle,
	type MediaToggleOption,
} from "@/components/ui/media-toggle";
import { BOTTOM_VIEWS, BOTTOM_VIEW_KEYS, type BottomView } from "./bottomViews";
import { useBottomView } from "./BottomViewContext";

const OPTIONS: MediaToggleOption<BottomView>[] = BOTTOM_VIEW_KEYS.map(
	(value) => ({
		value,
		label: BOTTOM_VIEWS[value].label,
		icon: BOTTOM_VIEWS[value].icon,
	}),
);

export function BottomViewToggle() {
	const { view, setView } = useBottomView();
	return <MediaToggle value={view} options={OPTIONS} onChange={setView} />;
}
