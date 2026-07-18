export function pickRandom<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)];
}

export function mockDelay(ms: number): Promise<void> {
	if (ms <= 0) return Promise.resolve();
	return new Promise((resolve) => setTimeout(resolve, ms + Math.random() * ms));
}
