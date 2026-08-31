import { createEmitter } from "@/lib/store/emitter";
import type { Autosaver } from "./autosave";
import type { ProjectContent, ProjectDocument } from "./projectDocument";

export type CanvasVersion = {
	id: string;
	updatedAt: string;
};

export type CanvasHistoryState = {
	versions: readonly CanvasVersion[];
	status: "loading" | "ready" | "failed";
	previewId: string | null;
};

export interface CanvasVersionStorage {
	list(): Promise<CanvasVersion[]>;
	read(id: string): Promise<ProjectContent>;
	create(content: ProjectContent): Promise<CanvasVersion>;
	update(id: string, content: ProjectContent): Promise<CanvasVersion>;
}

/**
 * How long a version keeps absorbing saves. Past it the next save starts a new
 * version, so the list reads as checkpoints rather than as keystrokes.
 */
export const FOLD_WINDOW_MS = 10 * 60_000;

/**
 * Only the newest version is ever open for folding, and the window closes
 * whenever the document stops being a continuation of it (an idle gap, a
 * reload, a restore), so a save either continues a version or begins one and
 * never has to choose.
 */
export class CanvasHistory {
	private state: CanvasHistoryState = {
		versions: [],
		status: "loading",
		previewId: null,
	};
	/** The version still absorbing saves, and when it stops taking them. */
	private open: { id: string; until: number } | null = null;
	/** What the canvas returns to, held for as long as a preview lasts. */
	private stash: ProjectContent | null = null;
	private readonly emitter = createEmitter();

	constructor(
		private readonly storage: CanvasVersionStorage,
		private readonly document: ProjectDocument,
		private readonly autosaver: Autosaver,
	) {}

	subscribe = this.emitter.subscribe;

	getState = (): CanvasHistoryState => this.state;

	private setState(patch: Partial<CanvasHistoryState>) {
		this.state = { ...this.state, ...patch };
		this.emitter.notify();
	}

	load = async (): Promise<void> => {
		if (this.state.status === "ready") return;
		this.setState({ status: "loading" });
		try {
			this.setState({ versions: await this.storage.list(), status: "ready" });
		} catch (err) {
			console.error("Failed to read canvas history", err);
			this.setState({ status: "failed" });
		}
	};

	record = async (content: ProjectContent): Promise<void> => {
		const open = this.open && Date.now() < this.open.until ? this.open : null;
		const version = open
			? await this.storage.update(open.id, content)
			: await this.storage.create(content);
		this.open = { id: version.id, until: Date.now() + FOLD_WINDOW_MS };
		this.setState({
			versions: [
				version,
				...this.state.versions.filter((entry) => entry.id !== version.id),
			],
		});
	};

	preview = async (id: string): Promise<void> => {
		if (this.state.previewId === id) return;
		const content = await this.storage.read(id);
		if (!this.stash) this.stash = this.document.read();
		this.autosaver.suspend();
		this.document.write(content);
		this.setState({ previewId: id });
	};

	backToLatest = (): void => {
		if (this.stash) this.document.write(this.stash);
		this.endPreview();
	};

	/** Adopts what is on screen, edits made during the preview included. */
	restore = (): void => {
		this.open = null;
		this.endPreview();
		this.autosaver.schedule();
	};

	private endPreview() {
		this.stash = null;
		this.autosaver.resume();
		this.setState({ previewId: null });
	}
}
