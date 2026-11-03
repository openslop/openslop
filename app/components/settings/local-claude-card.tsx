"use client";

import { useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { apiJson } from "@/lib/clients/http";
import { ClaudeAccountSchema } from "@/lib/local-claude/schema";
import { errorMessage } from "@/lib/errors";
import { SettingsSection } from "./settings-section";

const ENDPOINT = "/api/local/claude/account";

export function LocalClaudeCard() {
	const pending = useRef<AbortController | null>(null);
	const [account, setAccount] = useState<z.infer<
		typeof ClaudeAccountSchema
	> | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		const controller = new AbortController();
		apiJson(ENDPOINT, ClaudeAccountSchema, { signal: controller.signal })
			.then(setAccount)
			.catch((cause) => {
				if (!controller.signal.aborted) setError(errorMessage(cause));
			});
		return () => {
			controller.abort();
			pending.current?.abort();
		};
	}, []);
	useEffect(() => {
		if (!account?.loginUrl || account.connected) return;
		const controller = new AbortController();
		const timer = setInterval(() => {
			apiJson(ENDPOINT, ClaudeAccountSchema, { signal: controller.signal })
				.then(setAccount)
				.catch((cause) => {
					if (!controller.signal.aborted) setError(errorMessage(cause));
				});
		}, 2000);
		return () => {
			clearInterval(timer);
			controller.abort();
		};
	}, [account?.loginUrl, account?.connected]);
	const act = async (method: "GET" | "POST" | "DELETE") => {
		const controller = new AbortController();
		pending.current = controller;
		setBusy(true);
		setError(null);
		try {
			setAccount(
				await apiJson(ENDPOINT, ClaudeAccountSchema, {
					method,
					signal: controller.signal,
				}),
			);
		} catch (cause) {
			setError(errorMessage(cause));
		} finally {
			setBusy(false);
		}
	};
	return (
		<SettingsSection title="Claude subscription · Local only">
			<p className="text-label text-muted-foreground">
				Sign in with your personal Claude subscription to generate text on this
				computer. This uses a separate Claude Code login for OpenSlop.
			</p>
			<p role="status" className="text-label">
				{busy
					? "Contacting Claude…"
					: account?.connected
						? `Connected as ${account.email ?? "your Claude account"} (${account.subscription ?? "subscription"})`
						: account?.loginUrl
							? "Continue to Claude to finish signing in…"
							: account?.installed === false
								? "Install Claude Code, then refresh."
								: "Not connected"}
			</p>
			<div className="flex flex-wrap gap-2">
				{account?.loginUrl && (
					<>
						<Button asChild>
							<a href={account.loginUrl} target="_blank" rel="noreferrer">
								Continue to Claude
							</a>
						</Button>
						<Button
							variant="secondary"
							disabled={busy}
							onClick={() => void act("DELETE")}
						>
							Cancel sign-in
						</Button>
					</>
				)}
				{busy && (
					<Button variant="secondary" onClick={() => pending.current?.abort()}>
						Cancel
					</Button>
				)}
				<Button
					disabled={
						busy || Boolean(account?.loginUrl) || account?.installed === false
					}
					onClick={() => void act(account?.connected ? "DELETE" : "POST")}
				>
					{account?.connected ? "Disconnect Claude" : "Sign in with Claude"}
				</Button>
				<Button
					variant="secondary"
					disabled={busy}
					onClick={() => void act("GET")}
				>
					Refresh connection
				</Button>
			</div>
			{(error || account?.loginError) && (
				<p role="alert" className="text-label text-destructive">
					{error ?? account?.loginError}
				</p>
			)}
		</SettingsSection>
	);
}
