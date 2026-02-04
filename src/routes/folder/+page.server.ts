import { error, redirect } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';
import type { FolderDTO } from '$lib/models/folder_dto.js';

export async function load({ cookies }) {
	const token = cookies.get('access_token');
	if (!token) {
		throw redirect(303, '/login');
	}

	try {
		const response = await fetch(`${PUBLIC_API_URL}/folder`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw error(response.status, 'Failed to fetch folders');
		}

		const folders: FolderDTO[] = await response.json();
		
		return { folders };
	} catch (err) {
		console.error(err);
		throw error(500, 'Internal Server Error');
	}
}
