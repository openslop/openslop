"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Pencil, RefreshCw, Trash2 } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Tile } from "@/components/ui/tile";
import { KeyStatusBadge } from "@/app/components/models/KeyStatusBadge";
import { ProviderIcon } from "@/app/components/models/ProviderIcon";
import { useProviderKey } from "@/app/components/models/useProviderKeys";
import {
	MANAGED_PROVIDER,
	PROVIDER_CATALOG,
	type BYOKProvider,
} from "@/lib/connectors/providerCatalog";
import type { Provider } from "@/lib/connectors/types";
import { scrollIntoContainer } from "@/lib/components/scrollIntoContainer";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toastError } from "@/lib/toastError";
import { useAccount } from "@/lib/user/useAccount";
import { ProviderKeyForm } from "./ProviderKeyForm";

function ProviderHeading({
	provider,
	children,
}: {
	provider: Provider;
	children: ReactNode;
}) {
	return (
		<div className="flex items-center gap-2.5">
			<ProviderIcon provider={provider} size={20} />
			<p className="truncate text-label font-medium text-foreground">
				{PROVIDER_CATALOG[provider].name}
			</p>
			{children}
		</div>
	);
}

export function HostedProviderCard() {
	const status = useProviderKey(MANAGED_PROVIDER)?.status ?? "invalid";
	return (
		<Tile>
			<ProviderHeading provider={MANAGED_PROVIDER}>
				<KeyStatusBadge status={status} />
				<p className="ml-auto text-label-xs text-muted-foreground">
					{status === "valid"
						? "Included with your account"
						: "Not included with your account"}
				</p>
			</ProviderHeading>
		</Tile>
	);
}

export function ProviderCard({
	provider,
	selected = false,
	onDismissed,
}: {
	provider: BYOKProvider;
	selected?: boolean;
	/** The link that opened this row is spent: saved, cancelled, or key removed. */
	onDismissed: () => void;
}) {
	const meta = PROVIDER_CATALOG[provider];
	const key = useProviderKey(provider);
	const testKey = useAccount((state) => state.testKey);
	const removeKey = useAccount((state) => state.removeKey);

	const [editing, setEditing] = useState(selected || !key);
	const [testing, setTesting] = useState(false);
	const [removing, setRemoving] = useState<BYOKProvider>();
	const card = useRef<HTMLDivElement>(null);

	const done = () => {
		setEditing(false);
		onDismissed();
	};

	const test = async () => {
		setTesting(true);
		try {
			await testKey(provider);
		} catch (cause) {
			toastError(cause);
		} finally {
			setTesting(false);
		}
	};

	// A link that names a provider has to land on it, not at the top of a list
	// it happens to be in.
	useEffect(() => {
		if (selected && card.current) scrollIntoContainer(card.current, "center");
	}, [selected]);

	if (!key && !editing) return null;

	return (
		<Tile ref={card} className={cn("gap-2", selected && "ring-1 ring-accent")}>
			<ProviderHeading provider={provider}>
				{key && (
					<>
						<KeyStatusBadge status={key.status} />
						<p className="ml-auto text-label-xs text-muted-foreground">
							{`••••${key.last4} · added ${formatDate(key.createdAt)}`}
						</p>
					</>
				)}
			</ProviderHeading>

			{editing ? (
				<ProviderKeyForm provider={provider} onSaved={done} onCancel={done} />
			) : (
				key && (
					<div className="flex flex-wrap items-center gap-2">
						<Button
							size="sm"
							variant="generate"
							disabled={testing}
							onClick={() => void test()}
						>
							{testing ? <Spinner className="text-current" /> : <RefreshCw />}
							{testing ? "Testing…" : "Test"}
						</Button>
						<Button
							size="sm"
							variant="generate"
							onClick={() => setEditing(true)}
						>
							<Pencil />
							Replace key
						</Button>
						<Button
							size="sm"
							variant="destructive"
							className="ml-auto"
							onClick={() => setRemoving(provider)}
						>
							<Trash2 />
							Delete key
						</Button>
					</div>
				)
			)}

			<ConfirmDeleteDialog
				target={removing}
				onClose={() => setRemoving(undefined)}
				title={() => `Delete your ${meta.name} key?`}
				description={`Models served by ${meta.name} stop being available until you add a new key.`}
				actionLabel="Delete key"
				onConfirm={(target) =>
					void removeKey(target).then(onDismissed).catch(toastError)
				}
			/>
		</Tile>
	);
}
