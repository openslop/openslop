import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ProviderKeyRecord } from "@/lib/connectors/providerKey";

const key = vi.hoisted(() => ({ current: null as ProviderKeyRecord | null }));
const form = vi.hoisted(() => ({
	current: null as { onSaved: () => void; onCancel: () => void } | null,
}));

vi.mock("@/lib/user/useAccount", () => ({
	useAccount: () => vi.fn(),
}));
vi.mock("@/app/components/models/useProviderKeys", () => ({
	useProviderKey: () => key.current,
}));
vi.mock("@/app/components/settings/ProviderKeyForm", () => ({
	ProviderKeyForm: (props: typeof form.current) => {
		form.current = props;
		return <div data-provider-key-form />;
	},
}));

import { ProviderCard } from "../ProviderCard";

const STORED: ProviderKeyRecord = {
	provider: "anthropic",
	last4: "1234",
	status: "valid",
	verifiedAt: null,
	createdAt: "2026-01-01",
};

const render = (onDismissed = () => {}) =>
	renderToStaticMarkup(
		<ProviderCard provider="anthropic" selected onDismissed={onDismissed} />,
	);

describe("ProviderCard", () => {
	beforeEach(() => {
		key.current = STORED;
		form.current = null;
	});

	it("opens the key form when a link lands on the row", () => {
		expect(render()).toContain("data-provider-key-form");
	});

	it.each(["onSaved", "onCancel"] as const)(
		"%s on a stored key spends the link so a remount cannot reopen the form",
		(finish) => {
			const onDismissed = vi.fn();
			render(onDismissed);
			form.current?.[finish]();
			expect(onDismissed).toHaveBeenCalledTimes(1);
		},
	);
});
