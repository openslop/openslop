"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, RefreshCw, Trash2 } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Tile } from "@/components/ui/tile";
import { ConnectorStatusBadge } from "@/app/components/connectors/ConnectorStatusBadge";
import { ProviderIcon } from "@/app/components/connectors/ProviderIcon";
import { useConnector } from "@/app/components/connectors/useConnectors";
import {
	MANAGED_PROVIDER,
	providerMeta,
} from "@/lib/connectors/providerCatalog";
import type { ProviderKey } from "@/lib/connectors/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toastError } from "@/lib/toastError";
import { useAccount } from "@/lib/user/useAccount";
import { ConnectorKeyForm } from "./ConnectorKeyForm";

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
	provider: ProviderKey;
	/** The connector a link asked for: revealed, and open for a key if it needs one. */
	selected?: boolean;
	/** The row is gone: removed, or backed out of before a key was ever stored. */
	onDismissed: () => void;
}) {
	const meta = providerMeta(provider);
	const connector = useConnector(provider);
	// The hosted provider comes with the account: nothing to add, nothing to remove.
	const managed = provider === MANAGED_PROVIDER;
	const testKey = useAccount((state) => state.testKey);
	const removeKey = useAccount((state) => state.removeKey);

	const [editing, setEditing] = useState(!managed && (selected || !connector));
	const [testing, setTesting] = useState(false);
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
	if (!managed && !connector && !editing) return null;

	return (
		<Tile ref={card} className={cn("gap-2", selected && "ring-1 ring-accent")}>
			<div className="flex items-center gap-2.5">
				<ProviderIcon provider={provider} size={20} />
				<p className="truncate text-label font-medium text-foreground">
					{meta.name}
				</p>
				{(managed || connector) && (
					<ConnectorStatusBadge status={connector?.status ?? "valid"} />
				)}
				<p className="ml-auto text-label-xs text-muted-foreground">
					{managed
						? "Included with your account"
						: connector &&
							`••••${connector.last4} · added ${formatDate(connector.createdAt)}`}
				</p>
			</div>

			{editing ? (
				<ConnectorKeyForm
					provider={provider}
					onSaved={() => setEditing(false)}
					onCancel={cancel}
				/>
			) : (
				(managed || connector) && (
					<div className="flex flex-wrap items-center gap-2">
						<Button
							size="sm"
							variant="generate"
							disabled={managed || testing}
							onClick={() => void test()}
						>
							{testing ? <Spinner className="text-current" /> : <RefreshCw />}
							{testing ? "Testing…" : "Test"}
						</Button>
						<Button
							size="sm"
							variant="generate"
							disabled={managed}
							onClick={() => setEditing(true)}
						>
							<Pencil />
							Replace key
						</Button>
						<Button
							size="sm"
							variant="destructive"
							className="ml-auto"
							disabled={managed}
							onClick={() =>
								void removeKey(provider).then(onDismissed).catch(toastError)
							}
						>
							<Trash2 />
							Disconnect
						</Button>
					</div>
				)
			)}
		</Tile>
	);
}
