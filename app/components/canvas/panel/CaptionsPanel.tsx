"use client";

import { Eye, EyeOff } from "@/components/ui/icon";
import { MediaToggle } from "@/components/ui/media-toggle";
import { useProject } from "@/lib/project/useProject";
import { useCaptionsEnabled } from "@/lib/video/useCaptionsEnabled";
import { PanelCard, PanelField } from "./PanelCard";

export function CaptionsPanel() {
	const captionsEnabled = useCaptionsEnabled();
	const updateMetadata = useProject((s) => s.updateMetadata);

	return (
		<PanelCard title="Captions">
			<PanelField label="Show">
				<MediaToggle
					value={captionsEnabled ? "on" : "off"}
					onChange={(value) =>
						updateMetadata({ videoSettings: { captions: value === "on" } })
					}
					options={[
						{ value: "on", label: "Show captions", icon: Eye },
						{ value: "off", label: "Hide captions", icon: EyeOff },
					]}
				/>
			</PanelField>
		</PanelCard>
	);
}
