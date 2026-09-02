"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Key } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	providerMeta,
	type BYOKProvider,
} from "@/lib/connectors/providerCatalog";
import { toastError } from "@/lib/toastError";
import { useAccount } from "@/lib/user/useAccount";

/** Shorter than any provider issues, so a paste that missed is caught here. */
const MIN_KEY_LENGTH = 8;

/**
 * Where a key is entered. Saving stores it and reports back whether the
 * provider accepted it; the key is never read back, so the field always starts
 * empty, including when replacing one.
 */
export function ProviderKeyForm({
	provider,
	onSaved,
	onCancel,
}: {
	provider: BYOKProvider;
	onSaved: () => void;
	onCancel: () => void;
}) {
	const meta = providerMeta(provider);
	const saveKey = useAccount((state) => state.saveKey);
	const fieldId = useId();
	const [apiKey, setApiKey] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const save = async () => {
		setBusy(true);
		try {
			const result = await saveKey(provider, apiKey.trim());
			setApiKey("");
			// The key is stored either way; a rejection is worth staying to read.
			setError(result.ok ? null : result.error);
			if (result.ok) onSaved();
		} catch (cause) {
			toastError(cause);
		} finally {
			setBusy(false);
		}
	};

	return (
		<form
			className="flex flex-col gap-2"
			onSubmit={(event) => {
				event.preventDefault();
				void save();
			}}
		>
			<Label htmlFor={fieldId} className="text-label">
				{meta.name} API key
			</Label>
			<Input
				id={fieldId}
				className="h-8 text-label"
				type="password"
				autoComplete="off"
				spellCheck={false}
				value={apiKey}
				onChange={(event) => setApiKey(event.target.value)}
				placeholder="Paste in your API key here"
			/>
			<div className="flex flex-wrap items-center gap-2">
				<Button
					type="submit"
					size="sm"
					disabled={busy || apiKey.trim().length < MIN_KEY_LENGTH}
				>
					<Key />
					Save and validate
				</Button>
				<Button type="button" size="sm" variant="ghost" onClick={onCancel}>
					Cancel
				</Button>
				<Button
					asChild
					size="sm"
					variant="link"
					className="ml-auto font-semibold text-foreground underline"
				>
					<a href={meta.keysUrl} target="_blank" rel="noreferrer">
						Get a key
						<ExternalLink />
					</a>
				</Button>
			</div>
			{error && (
				<p role="alert" className="text-label-xs text-destructive">
					{error}
				</p>
			)}
		</form>
	);
}
