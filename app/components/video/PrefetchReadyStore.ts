/**
 * Tracks whether all in-flight Remotion prefetches have completed.
 * Designed for use with `useSyncExternalStore`.
 */
export class PrefetchReadyStore {
	private pending = 0;
	private _ready = false;
	private listeners = new Set<() => void>();

	private emit() {
		for (const l of this.listeners) l();
	}

	subscribe = (cb: () => void) => {
		this.listeners.add(cb);
		return () => {
			this.listeners.delete(cb);
		};
	};

	getReady = () => this._ready;

	onPrefetchStart() {
		this.pending++;
		if (this._ready) {
			this._ready = false;
			this.emit();
		}
	}

	onPrefetchEnd = () => {
		this.pending--;
		if (this.pending === 0) {
			this._ready = true;
			this.emit();
		}
	};

	syncReady() {
		if (this.pending === 0 && !this._ready) {
			this._ready = true;
			this.emit();
		}
	}
}
