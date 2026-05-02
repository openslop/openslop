export class OpenSlopClient {
	private baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = baseUrl || "";
	}

	private async request(
		method: string,
		url: string,
		body?: unknown,
	): Promise<Response> {
		const res = await fetch(url, {
			method,
			headers: { "content-type": "application/json" },
			...(body !== undefined && { body: JSON.stringify(body) }),
		});
		if (!res.ok) {
			const fallback = `${res.status} ${res.statusText}`;
			const message = await res.json().then(
				(b) => (b && typeof b === "object" && b.error) || fallback,
				() => fallback,
			);
			throw new Error(message);
		}
		return res;
	}

	async post<T>(path: string, body: unknown): Promise<T> {
		const res = await this.request("POST", `${this.baseUrl}${path}`, body);
		return res.json() as Promise<T>;
	}

	async get<T>(path: string, params?: Record<string, string>): Promise<T> {
		let url = `${this.baseUrl}${path}`;
		if (params) {
			const qs = new URLSearchParams(
				Object.entries(params).filter(([, v]) => v !== undefined),
			).toString();
			if (qs) url += `?${qs}`;
		}
		const res = await this.request("GET", url);
		return res.json() as Promise<T>;
	}

	async postStream(path: string, body: unknown): Promise<Response> {
		return this.request("POST", `${this.baseUrl}${path}`, body);
	}
}
