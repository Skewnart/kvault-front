<script lang="ts">
	import { RegisterEnvelopeDTOFrom, type RegisterEnvelopeDTO } from "../../lib/models/register_envelope_dto";
	import * as wasm from "$lib/wasm_pkg/kvault_wasm";
	import type { EncodedDTO } from "../../lib/models/encoded_dto";
	import { post_encoded } from "../../lib/api";
	import type { FolderDTO } from "../../lib/models/folder_dto";

	let folder_name = $state("");
		let error = $state("");
	let callPending = $state(false);

	let { folders = $bindable(), token } = $props();
	
	function addFolder(e: Event) {

		callPending = true;
		error = "";

		const envelope_str = sessionStorage.getItem("envelope");
		if (envelope_str == null) {
			error = "Les données de chiffrement devraient être présents après connexion.";
			callPending = false;
			return;
		}
		const envelope : RegisterEnvelopeDTO = RegisterEnvelopeDTOFrom(envelope_str!);

		let enc_entries:wasm.Encoded;
		try {
			enc_entries = wasm.create_encoded("[]", envelope.pk);
		} catch(error) {
			console.error(error);
			error = "Les fonctions de chiffrement n'ont pas fonctionné";
			callPending = false;
			return;
		}

		const enc_entries_dto : EncodedDTO = { enc_kyber: enc_entries.enc_kyber, enc_nonce: enc_entries.enc_nonce, encoded: enc_entries.encoded };
		const enc_data_str = JSON.stringify({ enc_data: enc_entries_dto });
		post_encoded(token, "folder/new", enc_data_str)
			.then(id => {
				const folder : FolderDTO = {
					id, name: folder_name
				};
				folders?.push(folder);

				const folders_str = JSON.stringify(folders);
				sessionStorage.setItem("folders", folders_str);

				const enc_folders = wasm.create_encoded(folders_str, envelope.pk);
				const enc_folders_dto : EncodedDTO = { enc_kyber: enc_folders.enc_kyber, enc_nonce: enc_folders.enc_nonce, encoded: enc_folders.encoded };
				const enc_folders_str = JSON.stringify({ enc_data: enc_folders_dto });
				post_encoded(token, "folder", enc_folders_str);
				
				const modal = document.getElementById('add_folder_modal') as HTMLDialogElement | null;
				if (modal) {
					modal.close();
					folder_name = "";
					callPending = false;
				}
			});
		
		//TODO 
		// . + Faire l'ajout du folder en base (+ récupérer l'id)
		// . + Faire la modif de l'array en sessionStorage
		// . + L'envoyer
		// Si succès :
		// . + Faire la fermeture modale
		// . + Faire le rafraichissement de la liste des folders
		// Sinon : 
		// . + Gérer les erreurs, avec un endroit pour les afficher
		// . + Gérer le bouton disabled ou barre de chargement
		// + Faire la page pour la modification avec id
	}
</script>

<dialog id="add_folder_modal" class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Ajouter un dossier</h3>
		<form onsubmit={addFolder} class="mt-4">
			<div class="mb-4">
				<label class="input w-full">
					<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<g
							stroke-linejoin="round"
							stroke-linecap="round"
							stroke-width="2.5"
							fill="none"
							stroke="currentColor"
						>
							<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
							<circle cx="12" cy="7" r="4"></circle>
						</g>
					</svg>
					<input
						id="folder_name"
						autocomplete="off"
						type="text"
						placeholder="Nom"
						bind:value={folder_name}
						disabled={callPending}
						required
					/>
				</label>
			</div>
		
			{#if error}
				<div role="alert" class="alert alert-error mb-2">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{error}</span>
				</div>
			{/if}

			<button class="btn btn-primary w-full" type="submit" disabled={callPending}>
				{#if callPending}
					<span class="loading loading-dots loading-xl"></span>
				{:else}
					Ajouter
				{/if}
			</button>
		</form>
		<div class="modal-action">
			<form method="dialog">
				<button class="btn" disabled={callPending}>Fermer</button>
			</form>
		</div>
	</div>
</dialog>
