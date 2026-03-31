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

export async function get_envelope(token: String) : Promise<RegisterEnvelopeDTO> {
	
	return fetch(`${PUBLIC_API_URL}/envelope`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	}).then(response => 
		response.text().then(envelope_str => {
			const envelope_json = JSON.parse(envelope_str);
			const envelope: RegisterEnvelopeDTO = {
				enc_sk: new Uint8Array(Object.values(envelope_json.enc_sk)),
				master_salt: new Uint8Array(Object.values(envelope_json.master_salt)),
				pk: new Uint8Array(Object.values(envelope_json.pk)),
				sk_nonce: new Uint8Array(Object.values(envelope_json.sk_nonce))
			};

			return envelope; 
		})
	);
}

export async function get_encoded(token: String, endpoint: String) : Promise<EncodedDTO> {
	
	return fetch(`${PUBLIC_API_URL}/${endpoint}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	}).then(response => 
		response.text().then(encoded_str => {
			const encoded_json : EncodedDTO = JSON.parse(encoded_str).enc_data;
			const encoded: EncodedDTO = {
				enc_kyber: new Uint8Array(Object.values(encoded_json.enc_kyber)),
				enc_nonce: new Uint8Array(Object.values(encoded_json.enc_nonce)),
				encoded: new Uint8Array(Object.values(encoded_json.encoded))
			};

			return encoded;
		})
	);
}

// LOCAL

export async function set_token(token: string) : Promise<Response> {
	return fetch(`/cookies`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: `token=${token}`
	});
}

