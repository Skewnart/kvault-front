import { redirect } from '@sveltejs/kit';

export function load({ cookies, params }) {

    const token = cookies.get('access_token');
    if (token)
        redirect(303, '/');
    
    const guid = params.guid;
	return {
		guid
	};
}
