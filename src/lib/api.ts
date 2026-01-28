// src/lib/api.ts
const API_URL = import.meta.env.API_URL;

export async function login(username: string, password: string) {
	const response = await fetch(`${API_URL}/connection/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, password })
	});
	return response;
}
