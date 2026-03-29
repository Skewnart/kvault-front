import { PUBLIC_API_URL } from '$env/static/public';
import type { EncodedDTO } from './models/encoded_dto';
import type { RegisterEnvelopeDTO } from './models/register_envelope_dto';

// API

export async function login(username: string, password: string) : Promise<Response> {
	return fetch(`${PUBLIC_API_URL}/connection/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password })
	});
}

export async function register(guid: String, username: string, password: string, envelope: RegisterEnvelopeDTO, enc_folders: EncodedDTO) : Promise<Response> {
	
	return fetch(`${PUBLIC_API_URL}/connection/register/${guid}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password, envelope, enc_folders })
	});
}

export async function get_envelope(token: String) : Promise<Response> {
	
	return fetch(`${PUBLIC_API_URL}/envelope`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});
}



// LOCAL

export async function set_token(token: string) : Promise<Response> {
	return fetch(`/cookies`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: `token=${token}`
	});
}

