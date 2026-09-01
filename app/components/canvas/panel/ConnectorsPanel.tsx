"use client";

import { Button } from "@/components/ui/button";
import { Settings } from "@/components/ui/icon";
import { ModelDefaultControl } from "@/app/components/connectors/ModelDefaultControl";
import { CONNECTOR_GROUPS } from "@/lib/connectors/connectorConfigs";
import { useProject } from "@/lib/project/useProject";
import { useSettings } from "@/lib/settings/useSettings";
import { useAccount } from "@/lib/user/useAccount";
import { PanelCard } from "./PanelCard";

/**
 * The models this project generates with, one card per kind of element. A card
 * left alone inherits from the account, so a project only records what it
 * deliberately differs on.
 */
export function ConnectorsPanel() {
	const project = useProject((state) => state.metadata.connectorModels);
	const updateMetadata = useProject((state) => state.updateMetadata);
	const account = useAccount((state) => state.models);
	const settings = useSettings();

	return (
		<>
			{CONNECTOR_GROUPS.map(({ key, label, types }) => (
				<PanelCard key={key} title={label}>
					<ModelDefaultControl
						types={types}
						tier="project"
						chain={{ project, account }}
						label={label}
						onChange={(connectorModels) => updateMetadata({ connectorModels })}
						className="w-full"
					/>
				</PanelCard>
			))}
			<Button
				size="sm"
				variant="panel"
				className="w-full shrink-0"
				onClick={() => settings.open("connectors")}
			>
				<Settings />
				Manage connectors
			</Button>
		</>
	);
}
