<script lang="ts">
	import { onMount } from 'svelte';
	import '../../../../../app.css';
	
	import * as wasm from "$lib/wasm_pkg/kvault_wasm";
    import type { EntryDTO } from '$lib/models/entry_dto';
    import { delete_by_id, get_encoded, put_encoded } from '$lib/api';
    import { RegisterEnvelopeDTOFrom } from '$lib/models/register_envelope_dto';
    import type { EncodedDTO } from '$lib/models/encoded_dto';
    import { addEntryToFolder, getEntryById, getFolderById, removeEntryFromFolder } from '$lib/session_storage_api';
    import { goto } from '$app/navigation';
    import type { ToastAlertType, ToastParams } from '$lib/components/Toast.svelte';
    import Toast from '$lib/components/Toast.svelte';
    import type { ConfirmParams } from '$lib/components/ConfirmDialog.svelte';
    import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	
	const TITLE = "Kvault";

	// TODO Ne pas afficher le mot de passe par défaut (pas faire l'appel non plus bien sûr)
	// 		mais devoir appuyer sur un bouton. L'édition fait l'appel s'il n'est pas déjà affiché

	const props = $props();
	let error = $state("");
	let entry = $state<EntryDTO | undefined>(undefined);
	let entry_details = $state<string | undefined>(undefined);
	let callPending = $state<boolean | undefined>(false);
    let toast = $state<Pick<ToastParams, 'message' | 'alertType'> | undefined>(undefined);
    let confirmDialog = $state<Pick<ConfirmParams, 'message'> | undefined>(undefined);

	// META INFOS VARS
    let editingMetaInfos = $state<boolean>(false);
    let nameInput = $state<String>("");
    let descriptionInput = $state<String>("");

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
			).trim();
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

		if (entry_details == undefined || entry_details == "") {
			entry_details = " ";
		}
		
		const enc_details = wasm.create_encoded(entry_details, user_envelope.pk);
		const enc_details_dto : EncodedDTO = { enc_kyber: enc_details.enc_kyber, enc_nonce: enc_details.enc_nonce, encoded: enc_details.encoded };
		const enc_details_str = JSON.stringify({ enc_data: enc_details_dto });
		
		put_encoded(token, "entry", data.entryId, enc_details_str).then(() => {
			callPending = false;
			showToast("success", "Données enregistrées !");
		}).catch(err => {
			console.error(err);
			error = "Erreur lors de l'envoi des informations";
			callPending = false;
		});

		entry_details = entry_details.trim();
	}

    function handleTitleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            saveMetaInformations();
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            cancelEditingMetaInformations();
        }
    }

    function saveMetaInformations() {
        if (!entry) return;
        const trimmedName = nameInput.trim();
        if (!trimmedName) {
            error = "Le nom de l'accès ne peut pas être vide.";
            return;
        }
        entry.name = trimmedName;
		entry.description = descriptionInput.trim();

		addEntryToFolder(data.folderId, entry);
		sendEntries().then(() => {
			editingMetaInfos = false;
			showToast("success", "Accès sauvegardé !");
		}).catch(err => {
			console.error(err);
			error = "Erreur lors de l'envoi des accès";
        	editingMetaInfos = false;
		});
    }

	function sendEntries() : Promise<string> {
		const user_envelope_session = sessionStorage.getItem("envelope");
		if (user_envelope_session == null) {
			error = "L'enveloppe de chiffrement ne peut pas être récupéré.";
		}
		const user_envelope = RegisterEnvelopeDTOFrom(user_envelope_session!);
		
		const folder = getFolderById(data.folderId);
		const entries_str = JSON.stringify(folder?.entries);
		const enc_entries = wasm.create_encoded(entries_str, user_envelope.pk);
		const enc_entries_dto : EncodedDTO = { enc_kyber: enc_entries.enc_kyber, enc_nonce: enc_entries.enc_nonce, encoded: enc_entries.encoded };
		const enc_entries_str = JSON.stringify({ enc_data: enc_entries_dto });

		return put_encoded(token, "folder", data.folderId, enc_entries_str);
	}

    function cancelEditingMetaInformations() {
        editingMetaInfos = false;
    }

    function startEditingMetaInformations() {
        if (!entry) return;
        nameInput = entry.name;
		descriptionInput = entry.description;
        editingMetaInfos = true;
    }
	
    function deleteCurrentEntry() {
        if (!entry) return;
		confirmDialog = {
			message: `Supprimer l'accès "${entry.name}" ? Cette action est irréversible.`
		}
    }

    function cancelDeleteCurrentFolder() {
        confirmDialog = undefined;
    }

    function performDeleteCurrentEntry() {
        if (!entry) return;
		confirmDialog = undefined;

		removeEntryFromFolder(data.folderId, entry.id);
		
		delete_by_id(token, "entry", Number(entry?.id)).then(() => {
			sendEntries().then(() => {
				editingMetaInfos = false;
				goto(`/folder/${data.folderId}`);
			}).catch(err => {
				console.error(err);
				error = "Erreur lors de la suppression des dossiers";
				editingMetaInfos = false;
			});
		});
    }

    function showToast(alertType: ToastAlertType, message: string) {
        toast = {
            message,
			alertType
        };
    }

    function hideToast() {
        toast = undefined;
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

		<Toast
			visible={toast !== undefined}
			message={toast?.message}
			alertType={toast?.alertType}
			onTimeoutEnds={hideToast}
		/>

		<ConfirmDialog
			visible={confirmDialog !== undefined}
			title="Confirmer la suppression"
			message={confirmDialog?.message}
			confirmLabel="Supprimer"
			cancelLabel="Annuler"
			onConfirm={performDeleteCurrentEntry}
			onCancel={cancelDeleteCurrentFolder}
		/>

		{#if editingMetaInfos}
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
				<div class="flex-1">
					<input
						class="input input-bordered w-full"
						type="text"
						bind:value={nameInput}
						onkeydown={handleTitleKeydown}
						aria-label="Nom de l'accès"
					/>
				</div>
				<div class="flex gap-2">
					<button class="btn btn-success" type="button" onclick={saveMetaInformations}>Valider</button>
					<button class="btn btn-secondary" type="button" onclick={cancelEditingMetaInformations}>Annuler</button>
				</div>
			</div>
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
				<div class="flex-1">
					<input
						class="input input-bordered w-full"
						type="text"
						bind:value={descriptionInput}
						onkeydown={handleTitleKeydown}
						aria-label="Description de l'accès"
					/>
				</div>
			</div>
		{:else}
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<h1 class="text-2xl font-bold">{entry?.name}</h1>
				<div class="flex gap-2">
					<button class="btn btn-square btn-ghost" type="button" aria-label="Modifier le dossier" onclick={startEditingMetaInformations}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 00.707-.293l9.414-9.414a1 1 0 000-1.414l-3.586-3.586a1 1 0 00-1.414 0L4 14.586V20z" />
						</svg>
					</button>
					<button class="btn btn-square btn-ghost text-error" type="button" aria-label="Supprimer le dossier" onclick={deleteCurrentEntry}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M19 7L5 7M10 11V17M14 11V17M5 7L6 19a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
						</svg>
					</button>
				</div>
			</div>
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
				<h2>{entry?.description}</h2>
			</div>
		{/if}

		{#if entry_details != undefined}
			<textarea class="textarea" placeholder="Ecrivez ici ce que vous voulez sauvegarder" bind:value={entry_details}></textarea>
			<button class="btn btn-primary btn-block my-4" onclick={saveEntry} disabled={callPending}>Enregistrer</button>
		{:else}
			<div class="flex justify-center">
				<span class="loading loading-spinner text-primary"></span>
			</div>
		{/if}
	</div>
</div>