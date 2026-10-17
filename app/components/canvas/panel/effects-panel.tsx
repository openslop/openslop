"use client";

import { MediaToggle } from "@/components/ui/media-toggle";
import { useProject } from "@/lib/project/use-project";
import { useVideoSetting } from "@/lib/project/use-video-setting";
import { PanelCard, PanelField } from "./panel-card";

const EFFECTS = [
	{ setting: "filmGrain", label: "Film grain" },
	{ setting: "rgbSplit", label: "RGB split" },
] as const;

function EffectToggle({ setting, label }: (typeof EFFECTS)[number]) {
	const enabled = useVideoSetting(setting);
	const updateVideoSettings = useProject((state) => state.updateVideoSettings);
	return (
		<PanelField label={label}>
			<MediaToggle
				value={enabled ? "on" : "off"}
				onChange={(value) => updateVideoSettings({ [setting]: value === "on" })}
				options={[
					{ value: "on", label: `${label} on`, text: "On" },
					{ value: "off", label: `${label} off`, text: "Off" },
				]}
			/>
		</PanelField>
	);
}

export function EffectsPanel() {
	return (
		<PanelCard title="Effects">
			{EFFECTS.map((effect) => (
				<EffectToggle key={effect.setting} {...effect} />
			))}
		</PanelCard>
	);
}
