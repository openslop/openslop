"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Key } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	PROVIDER_CATALOG,
	type BYOKProvider,
} from "@/lib/connectors/provider-catalog";
import { MIN_KEY_LENGTH } from "@/lib/connectors/provider-key";
import { toastError } from "@/lib/toast-error";
import { useAccount } from "@/lib/user/use-account";

export function ProviderKeyForm({
	provider,
	onSaved,
	onCancel,
}: {
	provider: BYOKProvider;
	onSaved: () => void;
	onCancel: () => void;
}) {
	const meta = PROVIDER_CATALOG[provider];
	const saveKey = useAccount((state) => state.saveKey);
	const fieldId = useId();
	const errorId = useId();
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
				name="apiKey"
				className="h-8 text-label"
				type="password"
				autoComplete="off"
				spellCheck={false}
				value={apiKey}
				onChange={(event) => {
					setApiKey(event.target.value);
					setError(null);
				}}
				placeholder="Paste in your API key here"
				aria-invalid={!!error}
				aria-describedby={error ? errorId : undefined}
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
				<p id={errorId} role="alert" className="text-label-xs text-destructive">
					{error}
				</p>
			)}
		</form>
	);
}
