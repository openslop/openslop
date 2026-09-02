"use client";

import { useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Check, Link } from "@/components/ui/icon";
import { SearchField } from "@/components/ui/search-field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Tile } from "@/components/ui/tile";
import { ModalityPills } from "@/app/components/models/ModalityPills";
import { ProviderIcon } from "@/app/components/models/ProviderIcon";
import { useMissingKey } from "@/app/components/models/useProviderKeys";
import { MODEL_GROUPS } from "@/lib/connectors/modelGroups";
import {
	MANAGED_PROVIDER,
	PROVIDER_CATALOG,
	type BYOKProvider,
} from "@/lib/connectors/providerCatalog";
import { modalitiesFor } from "@/lib/connectors/models";
import { searchProviders } from "@/lib/connectors/providerSearch";

/** No capability asked for, so nothing is filtered out. */
const ALL = "all";

/**
 * Search for something to connect. A query matches a provider or any model it
 * serves, so knowing only "Claude Opus 5" is enough to find Anthropic; the
 * capability filters are for browsing when you do not know what to type.
 */
export function AddProvidersView({
	onPick,
}: {
	onPick: (provider: BYOKProvider) => void;
}) {
	const [query, setQuery] = useState("");
	const [groupKey, setGroupKey] = useState(ALL);
	const missingKey = useMissingKey();

	const capability =
		MODEL_GROUPS.find((group) => group.key === groupKey)?.types ?? null;
	const matches = useMemo(
		() => searchProviders(query, capability),
		[query, capability],
	);

	return (
		<div className="flex flex-col gap-3">
			<SearchField
				autoFocus
				value={query}
				onChange={(event) => setQuery(event.target.value)}
				placeholder="Search providers and models"
				aria-label="Search providers and models"
			/>

			<SegmentedControl
				ariaLabel="Filter providers by capability"
				value={groupKey}
				onChange={setGroupKey}
				options={[
					{ value: ALL, label: "All" },
					...MODEL_GROUPS.map(({ key, label }) => ({ value: key, label })),
				]}
				className="flex-wrap"
			/>

			{matches.length === 0 ? (
				<p className="py-8 text-center text-label text-muted-foreground">
					{query.trim()
						? `Nothing matches "${query.trim()}".`
						: "No providers for that yet."}
				</p>
			) : (
				<ul className="flex flex-col gap-2">
					{matches.map(({ provider, models }) => {
						const meta = PROVIDER_CATALOG[provider];
						const connected = !missingKey(provider);
						return (
							<Tile key={provider} asChild className="flex-row items-center">
								<li>
									<ProviderIcon provider={provider} size={28} />
									<div className="flex min-w-0 flex-1 flex-col gap-1">
										<p className="truncate text-label font-medium text-foreground">
											{meta.name}
										</p>
										<p className="text-label-xs text-muted-foreground">
											{meta.description}
										</p>
										<ModalityPills modalities={modalitiesFor(provider)} />
										{models.length > 0 && (
											<p className="text-label-xs text-muted-foreground">
												Serves {models.join(", ")}
											</p>
										)}
									</div>
									{provider === MANAGED_PROVIDER ? (
										// Reads like the other connected rows, but there is
										// nothing to do: everyone generates on the hosted
										// provider, so there is no key to bring.
										<span
											className={buttonVariants({
												variant: "secondary",
												size: "sm",
											})}
										>
											<Check />
											Connected
										</span>
									) : (
										<Button
											size="sm"
											variant={connected ? "secondary" : "generate"}
											onClick={() => onPick(provider)}
										>
											{connected ? <Check /> : <Link />}
											{connected ? "Connected" : "Connect"}
										</Button>
									)}
								</li>
							</Tile>
						);
					})}
				</ul>
			)}
		</div>
	);
}
