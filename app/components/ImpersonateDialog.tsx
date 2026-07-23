"use client";

import { useState } from "react";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	MountedDialog,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "@/components/ui/icon";
import { errorMessage } from "@/lib/errors";

export default function ImpersonateDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<MountedDialog open={open} onOpenChange={onOpenChange}>
			<ImpersonateDialogBody />
		</MountedDialog>
	);
}

function ImpersonateDialogBody() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch(
				`/api/dev/impersonate?email=${encodeURIComponent(email)}`,
			);
			if (response.ok) {
				window.location.assign("/");
				return;
			}
			const body = await response.json();
			setError(body.error ?? `Impersonation failed (${response.status})`);
		} catch (cause) {
			setError(errorMessage(cause));
		}
		setLoading(false);
	};

	return (
		<DialogContent className="max-w-sm">
			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Impersonate user
						<Badge variant="caution">Dev only</Badge>
					</DialogTitle>
					<DialogDescription>
						Signs you in as this user on the live Supabase project.
					</DialogDescription>
				</DialogHeader>

				<p className="flex gap-2 rounded-lg border border-caution/40 bg-caution/10 p-3 text-label-xs text-foreground">
					<AlertCircle className="mt-0.5 shrink-0" />
					<span>
						Any changes you make as this user are written to production.
					</span>
				</p>

				<Input
					type="email"
					autoFocus
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="user@example.com"
					aria-label="User email"
				/>

				{error && (
					<span role="alert" className="text-label-xs text-destructive">
						{error}
					</span>
				)}

				<DialogFooter>
					<Button type="submit" variant="accent" disabled={loading || !email}>
						{loading ? "Signing in…" : "Impersonate"}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
}
