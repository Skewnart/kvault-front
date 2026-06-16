import { error, redirect } from '@sveltejs/kit';

export async function load({ params, cookies }) {
	const token = cookies.get('access_token');
	if (!token) {
		throw redirect(303, '/login');
	}

	if (!params.id) error(404);
	
	return { token, folder_id: params.id };
}
