import { PUBLIC_API_URL } from '$env/static/public';

export async function login(username: string, password: string) : Promise<Response> {
	return fetch(`${PUBLIC_API_URL}/connection/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password })
	});
}
