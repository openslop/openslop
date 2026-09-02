"use client";

import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { ModelChips } from "@/app/components/connectors/ModelChips";
import { ModelDefaultControl } from "@/app/components/connectors/ModelDefaultControl";
import { CONNECTOR_GROUPS } from "@/lib/connectors/connectorConfigs";
import {
	defaultModelFor,
	differsFromRecommended,
	modelEntry,
} from "@/lib/connectors/models";
import { MANAGED_PROVIDER } from "@/lib/connectors/providerCatalog";
import type { ProviderKey } from "@/lib/connectors/types";
import { toastError } from "@/lib/toastError";
import { useSettings } from "@/lib/settings/useSettings";
import { useAccount } from "@/lib/user/useAccount";
import { ConnectorCard, HostedConnectorCard } from "./ConnectorCard";
import { SettingsList, SettingsRow, SettingsSection } from "./SettingsSection";

export function ConnectorsTab({
	selected,
	onAddConnector,
}: {
	/** The connector a link asked to open on, shown even before it has a key. */
	selected: ProviderKey | null;
	onAddConnector: () => void;
}) {
	const models = useAccount((state) => state.models);
	const setModels = useAccount((state) => state.setModels);
	const resetModels = useAccount((state) => state.resetModels);
	const connectors = useAccount((state) => state.connectors);
	const settings = useSettings();

	const stored = connectors.map((row) => row.provider);
	// A link that named a connector leads here: it goes first, so what the link
	// was about is the first thing read.
	const shown =
		selected && !stored.includes(selected) ? [selected, ...stored] : stored;

	return (
		<div className="flex flex-col gap-6">
			<h3 className="text-label font-semibold text-foreground">Connectors</h3>

			<SettingsSection
				title="Your keys"
				action={
					<Button size="sm" variant="generate" onClick={onAddConnector}>
						<Plus />
						Add connector
					</Button>
				}
			>
				{shown.length === 0 ? (
					<p className="rounded-xl border border-dashed border-border p-6 text-center text-label text-muted-foreground">
						No connectors yet. Add one to generate on your own key.
					</p>
				) : (
					<div className="flex flex-col gap-2">
						{shown.map((provider) =>
							provider === MANAGED_PROVIDER ? (
								<HostedConnectorCard key={provider} />
							) : (
								<ConnectorCard
									key={provider}
									provider={provider}
									selected={provider === selected}
									// A link pointing at a row that is gone has nothing to open.
									onDismissed={() => settings.open("connectors")}
								/>
							),
						)}
					</div>
				)}
			</SettingsSection>

			<Separator />

			<SettingsSection
				title="Account defaults"
				action={
					<Button
						size="sm"
						variant="secondary"
						onClick={() => void resetModels().catch(toastError)}
						disabled={!differsFromRecommended(models)}
					>
						<RotateCcw />
						Reset to recommended
					</Button>
				}
			>
				<SettingsList>
					{CONNECTOR_GROUPS.map(({ key, label, Icon, types }) => (
						<SettingsRow
							key={key}
							label={
								<>
									<span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground">
										<Icon className="size-4" />
									</span>
									{label}
								</>
							}
						>
							<ModelChips
								meta={modelEntry(
									types[0],
									defaultModelFor(types[0], { account: models }),
								)}
							/>
							<ModelDefaultControl
								types={types}
								tier="account"
								chain={{ account: models }}
								label={label}
								onChange={(models) => void setModels(models).catch(toastError)}
							/>
						</SettingsRow>
					))}
				</SettingsList>
			</SettingsSection>
		</div>
	);
}
