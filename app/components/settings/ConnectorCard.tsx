"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Pencil, RefreshCw, Trash2 } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Tile } from "@/components/ui/tile";
import { ConnectorStatusBadge } from "@/app/components/connectors/ConnectorStatusBadge";
import { ProviderIcon } from "@/app/components/connectors/ProviderIcon";
import { useConnector } from "@/app/components/connectors/useConnectors";
import {
	MANAGED_PROVIDER,
	providerMeta,
	type BYOKProvider,
} from "@/lib/connectors/providerCatalog";
import type { ProviderKey } from "@/lib/connectors/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toastError } from "@/lib/toastError";
import { useAccount } from "@/lib/user/useAccount";
import { ConnectorKeyForm } from "./ConnectorKeyForm";

/** The mark, the name and whatever the row has to say for itself. */
function ConnectorHeading({
	provider,
	children,
}: {
	provider: ProviderKey;
	children: ReactNode;
}) {
	return (
		<div className="flex items-center gap-2.5">
			<ProviderIcon provider={provider} size={20} />
			<p className="truncate text-label font-medium text-foreground">
				{providerMeta(provider).name}
			</p>
			{children}
		</div>
	);
}

/** The hosted provider: it comes with the account, so there is nothing to manage. */
export function HostedConnectorCard() {
	return (
		<Tile>
			<ConnectorHeading provider={MANAGED_PROVIDER}>
				<ConnectorStatusBadge status="valid" />
				<p className="ml-auto text-label-xs text-muted-foreground">
					Included with your account
				</p>
			</ConnectorHeading>
		</Tile>
	);
}

/**
 * One provider's key: whether it works, when it was added, and the actions that
 * change that. What the provider is and can do belongs to the browser you added
 * it from; here it is already chosen, so the row stays short.
 */
export function ConnectorCard({
	provider,
	selected = false,
	onDismissed,
}: {
	provider: BYOKProvider;
	/** The connector a link asked for: revealed, and open for a key if it needs one. */
	selected?: boolean;
	/** The row is gone: removed, or backed out of before a key was ever stored. */
	onDismissed: () => void;
}) {
	const meta = providerMeta(provider);
	const connector = useConnector(provider);
	const testKey = useAccount((state) => state.testKey);
	const removeKey = useAccount((state) => state.removeKey);

	const [editing, setEditing] = useState(selected || !connector);
	const [testing, setTesting] = useState(false);
	const [confirmingRemoval, setConfirmingRemoval] = useState(false);
	const card = useRef<HTMLDivElement>(null);

	/** Backing out of a key that was never stored leaves no row behind. */
	const cancel = () => {
		setEditing(false);
		if (!connector) onDismissed();
	};

	/** Reaching the provider takes a moment, so the button says it is trying. */
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

	// A link that names a connector has to land on it, not at the top of a list
	// it happens to be in.
	useEffect(() => {
		if (selected) card.current?.scrollIntoView({ block: "center" });
	}, [selected]);

	// Nothing left to show once the key is gone: the row goes with it.
	if (!connector && !editing) return null;

	return (
		<Tile ref={card} className={cn("gap-2", selected && "ring-1 ring-accent")}>
			<ConnectorHeading provider={provider}>
				{connector && (
					<>
						<ConnectorStatusBadge status={connector.status} />
						<p className="ml-auto text-label-xs text-muted-foreground">
							{`••••${connector.last4} · added ${formatDate(connector.createdAt)}`}
						</p>
					</>
				)}
			</ConnectorHeading>

			{editing ? (
				<ConnectorKeyForm
					provider={provider}
					onSaved={() => setEditing(false)}
					onCancel={cancel}
				/>
			) : (
				connector && (
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
							onClick={() => setConfirmingRemoval(true)}
						>
							<Trash2 />
							Disconnect
						</Button>
					</div>
				)
			)}

			<ConfirmDeleteDialog
				open={confirmingRemoval}
				onOpenChange={setConfirmingRemoval}
				title={`Disconnect ${meta.name}?`}
				description={`Your key is deleted, and models served by ${meta.name} stop being available. You can connect it again with a new key.`}
				actionLabel="Disconnect"
				onConfirm={() =>
					void removeKey(provider).then(onDismissed).catch(toastError)
				}
			/>
		</Tile>
	);
}
