import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { BYOKProvider } from "@/lib/connectors/providerCatalog";

// --- shared, hoisted so the vi.mock factories can reach them -----------------

const account = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
const keyFor = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
// Captures the props the real ProviderCard hands its ProviderKeyForm, so the
// save/cancel wiring can be exercised without a DOM/event harness.
const form = vi.hoisted(() => ({
	current: null as null | { onSaved: () => void; onCancel: () => void },
}));

vi.mock("@/lib/user/useAccount", () => ({
	useAccount: <T,>(selector: (state: Record<string, unknown>) => T): T =>
		selector(account.current),
}));

vi.mock("@/app/components/models/useProviderKeys", () => ({
	useProviderKey: (provider: BYOKProvider) => keyFor.current[provider] ?? null,
}));

vi.mock("@/app/components/settings/ProviderKeyForm", () => ({
	ProviderKeyForm: (props: {
		provider: BYOKProvider;
		onSaved: () => void;
		onCancel: () => void;
	}) => {
		form.current = props;
		return <div data-provider-key-form data-provider={props.provider} />;
	},
}));

vi.mock("@/components/ui/confirm-delete-dialog", () => ({
	ConfirmDeleteDialog: () => null,
}));

vi.mock("@/app/components/models/ProviderIcon", () => ({
	ProviderIcon: ({ provider }: { provider: BYOKProvider }) => (
		<span data-provider-icon data-provider={provider} />
	),
}));

// -----------------------------------------------------------------------------

import { ProviderCard } from "../ProviderCard";
import type { ProviderKeyRecord } from "@/lib/connectors/providerKey";

const KEY: ProviderKeyRecord = {
	provider: "anthropic",
	last4: "1234",
	status: "valid",
	verifiedAt: null,
	createdAt: "2026-01-01",
};

function renderCard(
	overrides: {
		provider?: BYOKProvider;
		selected?: boolean;
		dismissed?: boolean;
		onDismissForm?: (provider: BYOKProvider) => void;
		onDismissed?: () => void;
	} = {},
) {
	form.current = null;
	return renderToStaticMarkup(
		<ProviderCard
			provider={overrides.provider ?? "anthropic"}
			selected={overrides.selected ?? false}
			dismissed={overrides.dismissed ?? false}
			onDismissForm={overrides.onDismissForm ?? (() => {})}
			onDismissed={overrides.onDismissed ?? (() => {})}
		/>,
	);
}

describe("ProviderCard key-form open/dismiss", () => {
	beforeEach(() => {
		keyFor.current = { anthropic: KEY };
		account.current = {
			testKey: vi.fn(),
			removeKey: vi.fn(),
		};
	});

	it("opens the Replace-key form on first landing when a keyed provider is selected", () => {
		const html = renderCard({ selected: true });
		expect(html).toContain("data-provider-key-form");
		expect(html).toContain('data-provider="anthropic"');
	});

	it("keeps the form closed on a remount once the provider was dismissed", () => {
		// This is the post-save / post-cancel-Replace state the bug reopened:
		// `?provider=anthropic` still set (selected=true) AND keyed, but the
		// per-session dismissed set now contains the provider.
		const html = renderCard({ selected: true, dismissed: true });
		expect(html).not.toContain("data-provider-key-form");
	});

	it("still highlights and scrolls to a dismissed selected row (passive view aid)", () => {
		// Decoupling: the sticky `selected` keeps driving ring/scroll, just not
		// form-open. So the card must still render with the ring.
		const html = renderCard({ selected: true, dismissed: true });
		expect(html).toContain("ring-1 ring-accent");
		expect(html).toContain("Replace key");
	});

	it("opens the add-key form on landing for a keyless provider", () => {
		keyFor.current = { anthropic: null };
		const html = renderCard({ selected: true });
		expect(html).toContain("data-provider-key-form");
	});

	it("marks the provider form dismissed when the key is saved", () => {
		const onDismissForm = vi.fn();
		renderCard({ selected: true, onDismissForm });
		expect(form.current).not.toBeNull();
		form.current?.onSaved();
		expect(onDismissForm).toHaveBeenCalledWith("anthropic");
	});

	it("marks the provider form dismissed on cancel of a Replace form, and does not clear the row", () => {
		const onDismissForm = vi.fn();
		const onDismissed = vi.fn();
		renderCard({ selected: true, onDismissForm, onDismissed });
		expect(form.current).not.toBeNull();
		form.current?.onCancel();
		// save/cancel dismiss the form for the rest of the session...
		expect(onDismissForm).toHaveBeenCalledWith("anthropic");
		// ...but a keyed row is not "gone", so `?provider` stays (no onDismissed).
		expect(onDismissed).not.toHaveBeenCalled();
	});

	it("on cancel of a keyless provider also clears the row (onDismissed)", () => {
		keyFor.current = { anthropic: null };
		const onDismissForm = vi.fn();
		const onDismissed = vi.fn();
		renderCard({ selected: true, onDismissForm, onDismissed });
		form.current?.onCancel();
		expect(onDismissForm).toHaveBeenCalledWith("anthropic");
		expect(onDismissed).toHaveBeenCalledTimes(1);
	});
});
