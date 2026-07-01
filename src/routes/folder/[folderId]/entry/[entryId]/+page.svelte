<script lang="ts">
	import { onMount } from 'svelte';
	import '../../../../../app.css';
	
	import * as wasm from "$lib/wasm_pkg/kvault_wasm";
    import type { EntryDTO } from '$lib/models/entry_dto';
    import { get_encoded, put_encoded } from '$lib/api';
    import { RegisterEnvelopeDTOFrom } from '$lib/models/register_envelope_dto';
    import type { EncodedDTO } from '$lib/models/encoded_dto';
    import { getEntryById } from '$lib/session_storage_api';
	
	const TITLE = "Kvault";

	// TODO Faire popups "Données enregistrées" au clic enregistrements dans toutes les pages
	// TODO Entrée dans la page Entry, ne pas afficher le mot de passe mais devoir appuyer sur un bouton, pareil pour l'édition

	const props = $props();
	let error = $state("");
	let entry = $state<EntryDTO | undefined>(undefined);
	let entry_details = $state<string | undefined>(undefined);
	let callPending = $state<boolean | undefined>(false);

	if (!props.data) {
		error = "Erreur pendant le chargement des données sur le serveur";
	}
	const data = props.data;

	if (data.token == undefined) {
		error = "Le token n'est pas présent depuis le chargement de la page.";
	}
	if (data.folderId == undefined || data.entryId == undefined) {
		error = "Un Path param est manquant";
	}
	const token = data.token;
	
	onMount(async () => {
		
		await wasm.default();

		const master_password = sessionStorage.getItem("mp");
		if (master_password == null) {
			error = "Le mot de passe maître ne peut pas être utilisé.";
		}

		const user_envelope_session = sessionStorage.getItem("envelope");
		if (user_envelope_session == null) {
			error = "L'enveloppe de chiffrement ne peut pas être récupéré.";
		}
		const user_envelope = RegisterEnvelopeDTOFrom(user_envelope_session!);

		entry = getEntryById(data.folderId, data.entryId);

		const entry_encoded = await get_encoded(token, `entry/${data.entryId}`);
		try {
			entry_details = wasm.read_encoded(
				master_password!,
				user_envelope.master_salt,
				user_envelope.enc_sk,
				user_envelope.sk_nonce,
				entry_encoded.encoded,
				entry_encoded.enc_kyber,
				entry_encoded.enc_nonce
			);
		} catch (decryptError) {
			error = "Mot de passe de chiffrement erroné";
			return;
		}
	});

	function saveEntry() {
		callPending = true;

		const user_envelope_session = sessionStorage.getItem("envelope");
		if (user_envelope_session == null) {
			error = "L'enveloppe de chiffrement ne peut pas être récupéré.";
		}
		const user_envelope = RegisterEnvelopeDTOFrom(user_envelope_session!);
		
		const enc_details = wasm.create_encoded(entry_details ?? "", user_envelope.pk);
		const enc_details_dto : EncodedDTO = { enc_kyber: enc_details.enc_kyber, enc_nonce: enc_details.enc_nonce, encoded: enc_details.encoded };
		const enc_details_str = JSON.stringify({ enc_data: enc_details_dto });
		
		put_encoded(token, "entry", data.entryId, enc_details_str).then(() => {
			callPending = false;
		}).catch(err => {
			console.error(err);
			error = "Erreur lors de l'envoi des informations";
			callPending = false;
		});
	}

</script>

<svelte:head>
	<title>{TITLE}</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="flex justify-center">
	<div class="md:w-3/4 w-full mt-4 mx-4">
		
		{#if error}
			<div role="alert" class="alert alert-error">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>{error}</span>
			</div>
		{/if}

		{#if entry != undefined}
			<h1>{entry?.name}</h1>
			<h2>{entry?.description}</h2>
		{:else}
			<div class="flex justify-center">
				<span class="loading loading-spinner text-primary"></span>
			</div>
		{/if}

		{#if entry_details != undefined}
			<textarea class="textarea" placeholder="Ecrivez ici ce que vous voulez sauvegarder" bind:value={entry_details}></textarea>
			<button class="btn btn-primary btn-block my-4" onclick={saveEntry} disabled={callPending || entry_details == ""}>Enregistrer</button>
		{:else}
			<div class="flex justify-center">
				<span class="loading loading-spinner text-primary"></span>
			</div>
		{/if}
	</div>
</div>