import { PUBLIC_API_URL } from '$env/static/public';
import type { EncodedDTO } from './models/encoded_dto';
import type { RegisterEnvelopeDTO } from './models/register_envelope_dto';
import type { Encoded, RegisterEnvelope } from './wasm_pkg/kvault_wasm';

export async function login(username: string, password: string) : Promise<Response> {
	return fetch(`${PUBLIC_API_URL}/connection/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password })
	});
}

export async function register(guid: String, username: string, password: string, envelope: RegisterEnvelope, enc_folders: Encoded) : Promise<Response> {
	const envelope_dto : RegisterEnvelopeDTO = { enc_sk:envelope.enc_sk, master_salt:envelope.master_salt, pk:envelope.pk, sk_nonce: envelope.sk_nonce };
	const enc_folders_dto : EncodedDTO = { enc_kyber: enc_folders.enc_kyber, enc_nonce: enc_folders.enc_nonce, encoded: enc_folders.encoded };
	
	return fetch(`${PUBLIC_API_URL}/connection/register/${guid}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password, envelope: envelope_dto, enc_folders: enc_folders_dto })
	});
}

export async function set_token(token: string) : Promise<Response> {
	return fetch(`/cookies`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: `token=${token}`
	});
}

