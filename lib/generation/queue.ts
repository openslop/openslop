import type {
  AssetResult,
  ConnectorConfig,
  ConnectorType,
  ProviderKey,
} from "../connectors/types";
import { generateForElement } from "./generateForElement";

export type ElementSnapshot = {
  status: "idle" | "queued" | "generating";
  seconds: number;
  result: AssetResult | null;
  error: string | null;
};

export type GenerationJob = {
  elementId: string;
  connectorType: ConnectorType;
  provider: ProviderKey;
  config: ConnectorConfig;
  prompt: string;
  extraParams: Record<string, unknown>;
};

const EMPTY_SNAPSHOT: ElementSnapshot = {
  status: "idle",
  seconds: 0,
  result: null,
  error: null,
};

class GenerationQueue {
  private state = new Map<string, ElementSnapshot>();
  private pending: GenerationJob[] = [];
  private controllers = new Map<string, AbortController>();
  private timers = new Map<string, ReturnType<typeof setInterval>>();
  private listeners = new Set<() => void>();
  private readonly batchSize: number;

  constructor({ batchSize }: { batchSize: number }) {
    this.batchSize = batchSize;
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getElementSnapshot = (id: string): ElementSnapshot => {
    return this.state.get(id) ?? EMPTY_SNAPSHOT;
  };

  private isInQueue(id: string): boolean {
    const s = this.state.get(id)?.status;
    return s === "queued" || s === "generating";
  }

  private update(id: string, patch: Partial<ElementSnapshot>) {
    this.state.set(id, { ...this.getElementSnapshot(id), ...patch });
  }

  private abortJob(id: string) {
    this.controllers.get(id)?.abort();
    this.controllers.delete(id);
    this.stopTimer(id);
    this.pending = this.pending.filter((j) => j.elementId !== id);
  }

  private resetToIdle(id: string) {
    const { result, error } = this.getElementSnapshot(id);
    if (result || error) {
      this.state.set(id, { status: "idle", seconds: 0, result, error });
    } else {
      this.state.delete(id);
    }
  }

  enqueue(job: GenerationJob) {
    this.enqueueAll([job]);
  }

  enqueueAll(jobs: GenerationJob[]) {
    let added = false;
    for (const job of jobs) {
      if (this.isInQueue(job.elementId)) continue;
      this.update(job.elementId, { status: "queued", seconds: 0 });
      this.pending.push(job);
      added = true;
    }
    if (added) {
      this.notify();
      this.processQueue();
    }
  }

  cancel(elementId: string) {
    if (!this.isInQueue(elementId)) return;
    this.abortJob(elementId);
    this.resetToIdle(elementId);
    this.notify();
    this.processQueue();
  }

  cancelAll() {
    for (const [id, controller] of this.controllers) {
      controller.abort();
      this.stopTimer(id);
    }
    this.controllers.clear();
    this.pending = [];
    for (const id of this.state.keys()) {
      this.resetToIdle(id);
    }
    this.notify();
  }

  discard(elementId: string) {
    const hadEntry = this.isInQueue(elementId);
    if (hadEntry) this.abortJob(elementId);
    this.state.delete(elementId);
    this.notify();
    if (hadEntry) this.processQueue();
  }

  setError(elementId: string, message: string) {
    this.update(elementId, { result: null, error: message });
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private stopTimer(elementId: string) {
    const timer = this.timers.get(elementId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(elementId);
    }
  }

  private processQueue() {
    while (this.controllers.size < this.batchSize && this.pending.length > 0) {
      const job = this.pending.shift();
      if (!job) break;
      this.runJob(job);
    }
  }

  private runJob(job: GenerationJob) {
    const { elementId } = job;
    const controller = new AbortController();
    this.controllers.set(elementId, controller);

    this.update(elementId, { status: "generating", seconds: 0 });
    this.notify();

    const start = Date.now();
    const timer = setInterval(() => {
      if (this.state.get(elementId)?.status === "generating") {
        this.update(elementId, {
          seconds: ((Date.now() - start) / 1000) | 0,
        });
        this.notify();
      }
    }, 1000);
    this.timers.set(elementId, timer);

    generateForElement(
      job.connectorType,
      job.provider,
      job.config,
      job.prompt,
      job.extraParams,
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        this.update(elementId, {
          status: "idle",
          seconds: 0,
          result,
          error: null,
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(`Generation failed for element ${elementId}:`, err);
        this.update(elementId, {
          status: "idle",
          seconds: 0,
          result: null,
          error: err instanceof Error ? err.message : String(err),
        });
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        this.stopTimer(elementId);
        this.controllers.delete(elementId);
        this.notify();
        this.processQueue();
      });
  }
}

export const generationQueue = new GenerationQueue({ batchSize: 3 });
