"use client";

import { Button } from "@/components/ui/button";
import { Settings } from "@/components/ui/icon";
import { ModelDefaultControl } from "@/app/components/models/ModelDefaultControl";
import { MODEL_GROUPS } from "@/lib/connectors/modelGroups";
import { useModelChain } from "@/lib/connectors/useDefaultModels";
import { useProject } from "@/lib/project/useProject";
import { useSettings } from "@/lib/settings/useSettings";
import { PanelCard } from "./PanelCard";

export function ModelsPanel() {
	const chain = useModelChain();
	const updateModels = useProject((state) => state.updateModels);
	const settings = useSettings();

	return (
		<>
			{MODEL_GROUPS.map(({ key, label, types }) => (
				<PanelCard key={key} title={label}>
					<ModelDefaultControl
						types={types}
						tier="project"
						chain={chain}
						label={label}
						onChange={updateModels}
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
