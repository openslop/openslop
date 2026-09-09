import { apiFetch, apiJson, type QueryParams } from "./http";

export class ApiClient {
	private baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = baseUrl || "";
	}

	async post<T>(path: string, body: unknown): Promise<T> {
		return apiJson<T>(`${this.baseUrl}${path}`, { method: "POST", body });
	}

	async get<T>(
		path: string,
		options: { params?: QueryParams; signal?: AbortSignal } = {},
	): Promise<T> {
		return apiJson<T>(`${this.baseUrl}${path}`, options);
	}

	async postStream(
		path: string,
		body: unknown,
		signal?: AbortSignal,
	): Promise<Response> {
		return apiFetch(`${this.baseUrl}${path}`, { method: "POST", body, signal });
	}
}
