"use client";

import { Button } from "@/components/ui/button";
import { Settings } from "@/components/ui/icon";
import { ModelDefaultControl } from "@/app/components/models/ModelDefaultControl";
import { MODEL_GROUPS } from "@/lib/connectors/modelGroups";
import { useProject } from "@/lib/project/useProject";
import { useSettings } from "@/lib/settings/useSettings";
import { useAccount } from "@/lib/user/useAccount";
import { PanelCard } from "./PanelCard";

export function ModelsPanel() {
	const project = useProject((state) => state.metadata.models);
	const updateMetadata = useProject((state) => state.updateMetadata);
	const account = useAccount((state) => state.models);
	const settings = useSettings();

	return (
		<>
			{MODEL_GROUPS.map(({ key, label, types }) => (
				<PanelCard key={key} title={label}>
					<ModelDefaultControl
						types={types}
						tier="project"
						chain={{ project, account }}
						label={label}
						onChange={(models) => updateMetadata({ models })}
						className="w-full"
					/>
				</PanelCard>
			))}
			<Button
				size="sm"
				variant="panel"
				className="w-full shrink-0"
				onClick={() => settings.open("models")}
			>
				<Settings />
				Manage models
			</Button>
		</>
	);
}
