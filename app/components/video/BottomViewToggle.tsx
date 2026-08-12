"use client";

import { Cards, CollapseTimeline } from "@/components/ui/icon";
import {
	MediaToggle,
	type MediaToggleOption,
} from "@/components/ui/media-toggle";
import { useBottomView, type BottomView } from "./BottomViewContext";

const OPTIONS: MediaToggleOption<BottomView>[] = [
	{ value: "storyboard", label: "Storyboard view", icon: Cards },
	{ value: "hidden", label: "Hide bottom panel", icon: CollapseTimeline },
];

export function BottomViewToggle() {
	const { view, setView } = useBottomView();
	return <MediaToggle value={view} options={OPTIONS} onChange={setView} />;
}
