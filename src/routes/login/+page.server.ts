import type { Actions } from './$types';
import { API_URL } from '$env/static/private';

export const actions: Actions = {
	default: async ({ request }) => {
		const { username, password } = await request.json();
		const response = await fetch(`${API_URL}/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});
		const result = await response.json();
		return {
			success: response.ok && result.success,
			message: result.message || (response.ok ? '' : 'Erreur serveur')
		};
	}
};
