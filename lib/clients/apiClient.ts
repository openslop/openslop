import { apiFetch, apiJson } from "./http";

export class ApiClient {
	private baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = baseUrl || "";
	}

	async post<T>(path: string, body: unknown): Promise<T> {
		return apiJson<T>(`${this.baseUrl}${path}`, { method: "POST", body });
	}

	async get<T>(path: string, params?: Record<string, string>): Promise<T> {
		return apiJson<T>(`${this.baseUrl}${path}`, { params });
	}

	async postStream(
		path: string,
		body: unknown,
		signal?: AbortSignal,
	): Promise<Response> {
		return apiFetch(`${this.baseUrl}${path}`, { method: "POST", body, signal });
	}
}
