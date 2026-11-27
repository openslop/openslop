"use client";

import { useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { apiJson } from "@/lib/clients/http";
import { ClaudeAccountSchema } from "@/lib/local-claude/schema";
import { errorMessage } from "@/lib/errors";
import { SettingsSection } from "./settings-section";

const ENDPOINT = "/api/local/claude/account";

type ClaudeAccount = z.infer<typeof ClaudeAccountSchema>;

function statusText(account: ClaudeAccount | null) {
	if (account?.connected)
		return `Connected as ${account.email ?? "your Claude account"} (${account.subscription ?? "subscription"})`;
	if (account?.loginUrl) return "Continue to Claude to finish signing in…";
	if (account?.installed === false) return "Install Claude Code, then refresh.";
	return "Not connected";
}

export function LocalClaudeCard() {
	const pending = useRef<AbortController | null>(null);
	const [account, setAccount] = useState<ClaudeAccount | null>(null);
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
	const signingIn = Boolean(account?.loginUrl) && !account?.connected;
	useEffect(() => {
		if (!signingIn) return;
		const controller = new AbortController();
		let polling = false;
		const timer = setInterval(() => {
			if (polling) return;
			polling = true;
			apiJson(ENDPOINT, ClaudeAccountSchema, { signal: controller.signal })
				.then((next) => {
					setError(null);
					setAccount(next);
				})
				.catch((cause) => {
					if (!controller.signal.aborted) setError(errorMessage(cause));
				})
				.finally(() => {
					polling = false;
				});
		}, 2000);
		return () => {
			clearInterval(timer);
			controller.abort();
		};
	}, [signingIn]);
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
			if (!controller.signal.aborted) setError(errorMessage(cause));
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
				{busy ? "Contacting Claude…" : statusText(account)}
			</p>
			<div className="flex flex-wrap gap-2">
				{account?.loginUrl && (
					<>
						<Button size="sm" asChild>
							<a href={account.loginUrl} target="_blank" rel="noreferrer">
								Continue to Claude
							</a>
						</Button>
						<Button
							size="sm"
							variant="secondary"
							disabled={busy}
							onClick={() => void act("DELETE")}
						>
							Cancel sign-in
						</Button>
					</>
				)}
				{busy && (
					<Button
						size="sm"
						variant="secondary"
						onClick={() => pending.current?.abort()}
					>
						Cancel
					</Button>
				)}
				<Button
					size="sm"
					disabled={
						busy || Boolean(account?.loginUrl) || account?.installed === false
					}
					onClick={() => void act(account?.connected ? "DELETE" : "POST")}
				>
					{account?.connected ? "Disconnect Claude" : "Sign in with Claude"}
				</Button>
				<Button
					size="sm"
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
