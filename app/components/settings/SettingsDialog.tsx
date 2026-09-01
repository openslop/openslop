"use client";

import { useState } from "react";
import {
	DialogContent,
	DialogDescription,
	DialogTitle,
	MountedDialog,
} from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { ArrowLeft } from "@/components/ui/icon";
import type { BYOKProvider } from "@/lib/connectors/providerCatalog";
import { useSettings } from "@/lib/settings/useSettings";
import { AddConnectorView } from "./AddConnectorView";
import { ConnectorsTab } from "./ConnectorsTab";
import { SettingsNav } from "./SettingsNav";

/**
 * Account settings, opened from the URL: a nav down the side, and the section
 * it selects raised onto its own pane. Browsing for a connector pushes a second
 * view into that pane rather than stacking another dialog on top.
 */
export function SettingsDialog() {
	const settings = useSettings();
	const [browsing, setBrowsing] = useState(false);

	const close = () => {
		setBrowsing(false);
		settings.close();
	};

	const pick = (provider: BYOKProvider) => {
		setBrowsing(false);
		settings.open("connectors", provider);
	};

	return (
		<MountedDialog
			open={settings.tab !== null}
			onOpenChange={(open) => !open && close()}
		>
			<DialogContent
				glow={false}
				className="h-[min(46rem,calc(100dvh-2rem))] max-w-4xl gap-3 bg-settings-surface p-4"
			>
				<DialogTitle className="text-label font-semibold">Settings</DialogTitle>
				<DialogDescription className="sr-only">
					Choose the models your work runs on and the keys behind them.
				</DialogDescription>

				<div className="flex min-h-0 flex-1 gap-3">
					<SettingsNav
						active={settings.tab ?? "connectors"}
						onSelect={(tab) => {
							setBrowsing(false);
							settings.open(tab);
						}}
					/>
					<div className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-settings-pane p-4">
						{browsing ? (
							<div className="flex flex-col gap-4">
								<div className="flex items-center gap-2">
									<IconButton
										ariaLabel="Back to settings"
										size="sm"
										onClick={() => setBrowsing(false)}
									>
										<ArrowLeft />
									</IconButton>
									<h3 className="text-label font-semibold text-foreground">
										Add connector
									</h3>
								</div>
								<AddConnectorView onPick={pick} />
							</div>
						) : (
							<ConnectorsTab
								selected={settings.connector}
								onAddConnector={() => setBrowsing(true)}
							/>
						)}
					</div>
				</div>
			</DialogContent>
		</MountedDialog>
	);
}
