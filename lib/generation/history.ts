import type { CommittedVersion, ElementVersion } from "./versions";
import { VersionLog } from "./versions";

export interface ElementVersionStorage {
	read(elementId: string): Promise<ElementVersion[]>;
	write(version: ElementVersion): void;
}

export const SESSION_ONLY: ElementVersionStorage = {
	read: () => Promise.resolve([]),
	write: () => {},
};

/** A version list is either still arriving, readable, or unreadable. */
export type ElementHistoryStatus = "loading" | "ready" | "failed";

export class ElementHistory {
	private readonly log = new VersionLog();
	private readonly listeners = new Set<() => void>();
	private loading = new Map<string, Promise<void>>();
	private failed = new Set<string>();

	constructor(private readonly storage: ElementVersionStorage = SESSION_ONLY) {}

	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};

	private notify() {
		for (const listener of this.listeners) listener();
	}

	get = (elementId: string): readonly ElementVersion[] =>
		this.log.get(elementId);

	status = (elementId: string): ElementHistoryStatus => {
		if (this.log.isHydrated(elementId)) return "ready";
		return this.failed.has(elementId) ? "failed" : "loading";
	};

	load = (elementId: string): Promise<void> => {
		if (this.log.isHydrated(elementId)) return Promise.resolve();
		const inFlight = this.loading.get(elementId);
		if (inFlight) return inFlight;
		this.failed.delete(elementId);
		const load = this.storage
			.read(elementId)
			.then((stored) => {
				this.log.hydrate(elementId, stored);
			})
			.catch((err: unknown) => {
				this.failed.add(elementId);
				throw err;
			})
			.finally(() => {
				this.loading.delete(elementId);
				this.notify();
			});
		this.loading.set(elementId, load);
		return load;
	};

	record = (version: CommittedVersion) => {
		this.storage.write(this.log.record(version, new Date().toISOString()));
		this.notify();
	};
}
