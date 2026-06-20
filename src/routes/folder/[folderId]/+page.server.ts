import { error, redirect } from '@sveltejs/kit';

export async function load({ params, cookies }) {
	const token = cookies.get('access_token');
	if (!token) {
		throw redirect(303, '/login');
	}

	if (!params.folderId) error(404);
	
	return { token, folderId: params.folderId };
}
