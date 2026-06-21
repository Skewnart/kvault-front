<script lang="ts">
	import { onMount } from 'svelte';
	import '../../../../../app.css';
	
	import * as wasm from "$lib/wasm_pkg/kvault_wasm";
    import type { EntryDTO } from '$lib/models/entry_dto';
    import { get_encoded, put_encoded } from '$lib/api';
    import { RegisterEnvelopeDTOFrom } from '$lib/models/register_envelope_dto';
    import type { EncodedDTO } from '$lib/models/encoded_dto';
    import type { FolderDTO } from '$lib/models/folder_dto';
	
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

		const folders_session = sessionStorage.getItem("folders");
		if (folders_session == null) {
			error = "Les dossiers devraient être présents après connexion.";
		}
		const folders = JSON.parse(folders_session!) as FolderDTO[];
		const folder = folders.find((folder) => folder.id === data.folderId);
		entry = folder?.entries.find((e) => e.id === data.entryId);

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

<div class="navbar bg-base-100 shadow-sm">
  <div class="flex-1">
    <a class="btn btn-ghost text-xl" href="/">Kvault</a>
  </div>
  <div class="flex-none">
    <div class="dropdown dropdown-end">
		<a class="btn btn-ghost btn-circle" aria-label="theme" href="/logout">
		<svg viewBox="-5.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
			<path d="M14.344 7.375c3.688 1.563 6.281 5.219 6.281 9.5 0 5.656-4.625 10.313-10.313 10.313-5.656 0-10.313-4.656-10.313-10.313 0-4.281 2.594-7.938 6.313-9.5v3.469c-1.938 1.313-3.25 3.5-3.25 6.031 0 4 3.25 7.25 7.25 7.25s7.25-3.25 7.25-7.25c0-2.531-1.281-4.719-3.219-6.031v-3.469zM12.031 16.813v-12.031h-3.438v12.031h3.438z"></path>
		</svg>
		</a>
	</div>
  </div>
</div>

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