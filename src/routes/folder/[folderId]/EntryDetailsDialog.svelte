<script lang="ts">
	import { onMount } from 'svelte';
	import * as wasm from '$lib/wasm_pkg/kvault_wasm';
	import { delete_by_id, get_encoded, put_encoded } from '$lib/api';
	import ConfirmDialog, { type ConfirmParams } from '$lib/components/ConfirmDialog.svelte';
	import Toast, { type ToastAlertType, type ToastParams } from '$lib/components/Toast.svelte';
	import type { EncodedDTO } from '$lib/models/encoded_dto';
	import type { EntryDTO } from '$lib/models/entry_dto';
	import { RegisterEnvelopeDTOFrom } from '$lib/models/register_envelope_dto';
	import { addEntryToFolder, getFolderById, removeEntryFromFolder } from '$lib/session_storage_api';
	import { goto } from '$app/navigation';

	let {
		token,
		folderId,
		entry,
		onClose,
		onUpdated,
		onDeleted
	} = $props<{
		token: string;
		folderId: string;
		entry: EntryDTO;
		onClose: () => void;
		onUpdated: (entry: EntryDTO) => void;
		onDeleted: (entryId: String) => void;
	}>();

	let dialog: HTMLDialogElement;
	let currentEntry = $state<EntryDTO>(entry);
	let entryDetails = $state<string | undefined>(undefined);
	let callPending = $state(false);
	let showPassword = $state(false);
	let editingMetaInfos = $state(false);
	let nameInput = $state('');
	let descriptionInput = $state('');
	let error = $state('');
	let toast = $state<Pick<ToastParams, 'message' | 'alertType'> | undefined>(undefined);
	let confirmDialog = $state<Pick<ConfirmParams, 'message'> | undefined>(undefined);

	onMount(async () => {
		try {
			await wasm.default();
			dialog.showModal();
		} catch (loadError) {
			console.error(loadError);
			error = "Les fonctions de chiffrement n'ont pas pu être chargées.";
		}
	});

	function getEnvelope() {
		const envelope = sessionStorage.getItem('envelope');
		if (!envelope) throw new Error("L'enveloppe de chiffrement ne peut pas être récupérée.");
		return RegisterEnvelopeDTOFrom(envelope);
	}

	async function revealPassword() {
		if (showPassword) return;
		callPending = true;
		error = '';
		try {
			const masterPassword = sessionStorage.getItem('mp');
			if (!masterPassword) throw new Error('Le mot de passe maître ne peut pas être utilisé.');
			const envelope = getEnvelope();
			const encoded = await get_encoded(token, `entry/${currentEntry.id}`);
			if (!encoded) {
				goto('/logout');
				return;
			}
			entryDetails = wasm.read_encoded(
				masterPassword,
				envelope.master_salt,
				envelope.enc_sk,
				envelope.sk_nonce,
				encoded.encoded,
				encoded.enc_kyber,
				encoded.enc_nonce
			).trim();
			showPassword = true;
		} catch (decryptError) {
			error = decryptError instanceof Error ? decryptError.message : 'Mot de passe de chiffrement erroné';
		} finally {
			callPending = false;
		}
	}

	function hidePassword() {
		entryDetails = undefined;
		showPassword = false;
	}

	async function savePassword() {
		callPending = true;
		error = '';
		try {
			const envelope = getEnvelope();
			const details = entryDetails?.trim() || ' ';
			const encoded = wasm.create_encoded(details, envelope.pk);
			const body: EncodedDTO = {
				enc_kyber: encoded.enc_kyber,
				enc_nonce: encoded.enc_nonce,
				encoded: encoded.encoded
			};
			await put_encoded(token, 'entry', Number(currentEntry.id), JSON.stringify({ enc_data: body }));
			entryDetails = details.trim();
			showToast('success', 'Données enregistrées !');
		} catch (saveError) {
			console.error(saveError);
			error = "Erreur lors de l'envoi des informations";
		} finally {
			callPending = false;
		}
	}

	function startEditingMetaInformations() {
		nameInput = currentEntry.name.toString();
		descriptionInput = currentEntry.description.toString();
		editingMetaInfos = true;
	}

	async function saveMetaInformations() {
		const name = nameInput.trim();
		if (!name) {
			error = "Le nom de l'accès ne peut pas être vide.";
			return;
		}

		callPending = true;
		error = '';
		try {
			const envelope = getEnvelope();
			const folder = getFolderById(folderId);
			if (!folder) throw new Error('Le dossier est introuvable.');
			const updatedEntry: EntryDTO = {
				...currentEntry,
				name,
				description: descriptionInput.trim()
			};
			const entries = folder.entries.map(item => item.id === updatedEntry.id ? updatedEntry : item);
			const encoded = wasm.create_encoded(JSON.stringify(entries), envelope.pk);
			const body: EncodedDTO = {
				enc_kyber: encoded.enc_kyber,
				enc_nonce: encoded.enc_nonce,
				encoded: encoded.encoded
			};
			await put_encoded(token, 'folder', Number(folderId), JSON.stringify({ enc_data: body }));
			addEntryToFolder(folderId, updatedEntry);
			currentEntry = updatedEntry;
			onUpdated(updatedEntry);
			editingMetaInfos = false;
			showToast('success', 'Accès sauvegardé !');
		} catch (saveError) {
			console.error(saveError);
			error = saveError instanceof Error ? saveError.message : "Erreur lors de l'envoi des accès";
		} finally {
			callPending = false;
		}
	}

	function requestDeleteEntry() {
		confirmDialog = { message: `Supprimer l'accès "${currentEntry.name}" ? Cette action est irréversible.` };
	}

	async function deleteEntry() {
		confirmDialog = undefined;
		callPending = true;
		error = '';
		try {
			await delete_by_id(token, 'entry', Number(currentEntry.id));
			removeEntryFromFolder(folderId, currentEntry.id);
			const envelope = getEnvelope();
			const folder = getFolderById(folderId);
			if (!folder) throw new Error('Le dossier est introuvable.');
			const encoded = wasm.create_encoded(JSON.stringify(folder.entries), envelope.pk);
			const body: EncodedDTO = {
				enc_kyber: encoded.enc_kyber,
				enc_nonce: encoded.enc_nonce,
				encoded: encoded.encoded
			};
			await put_encoded(token, 'folder', Number(folderId), JSON.stringify({ enc_data: body }));
			onDeleted(currentEntry.id);
			dialog.close();
		} catch (deleteError) {
			console.error(deleteError);
			error = deleteError instanceof Error ? deleteError.message : "Erreur lors de la suppression de l'accès";
		} finally {
			callPending = false;
		}
	}

	function showToast(alertType: ToastAlertType, message: string) {
		toast = { message, alertType };
	}
</script>

<dialog bind:this={dialog} class="modal" onclose={onClose}>
	<div class="modal-box max-w-2xl">
		<div class="flex items-start justify-between gap-4">
			{#if editingMetaInfos}
				<h2 class="text-lg font-bold">Modifier l'accès</h2>
			{:else}
				<h2 class="text-lg font-bold">{currentEntry.name}</h2>
				<div class="flex shrink-0 gap-2">
					<button class="btn btn-square btn-ghost" type="button" aria-label="Modifier l'accès" onclick={startEditingMetaInformations} disabled={callPending}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 00.707-.293l9.414-9.414a1 1 0 000-1.414l-3.586-3.586a1 1 0 00-1.414 0L4 14.586V20z" />
						</svg>
					</button>
					<button class="btn btn-square btn-ghost text-error" type="button" aria-label="Supprimer l'accès" onclick={requestDeleteEntry} disabled={callPending}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M19 7L5 7M10 11V17M14 11V17M5 7L6 19a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
						</svg>
					</button>
				</div>
			{/if}
		</div>

		<Toast
			visible={toast !== undefined}
			message={toast?.message}
			alertType={toast?.alertType}
			onTimeoutEnds={() => toast = undefined}
		/>
		<ConfirmDialog
			visible={confirmDialog !== undefined}
			title="Confirmer la suppression"
			message={confirmDialog?.message}
			confirmLabel="Supprimer"
			cancelLabel="Annuler"
			onConfirm={deleteEntry}
			onCancel={() => confirmDialog = undefined}
		/>

		{#if error}
			<div role="alert" class="alert alert-error my-3">{error}</div>
		{/if}

		{#if editingMetaInfos}
			<label class="form-control mt-4">
				<span class="label-text mb-1">Nom</span>
				<input class="input input-bordered w-full" type="text" bind:value={nameInput} disabled={callPending} />
			</label>
			<label class="form-control mt-3">
				<span class="label-text mb-1">Description</span>
				<textarea class="textarea textarea-bordered w-full" bind:value={descriptionInput} disabled={callPending}></textarea>
			</label>
			<div class="modal-action">
				<button class="btn btn-primary" type="button" onclick={saveMetaInformations} disabled={callPending}>Valider</button>
				<button class="btn btn-secondary" type="button" onclick={() => editingMetaInfos = false} disabled={callPending}>Annuler</button>
			</div>
		{:else}
			<p class="mt-2 whitespace-pre-wrap">{currentEntry.description}</p>
			<div class="divider">Mot de passe</div>
			{#if showPassword}
				<textarea class="textarea textarea-bordered w-full min-h-32" aria-label="Mot de passe" bind:value={entryDetails} disabled={callPending}></textarea>
				<div class="modal-action">
					<button class="btn btn-primary" type="button" onclick={savePassword} disabled={callPending}>Enregistrer</button>
					<button class="btn btn-secondary" type="button" onclick={hidePassword} disabled={callPending}>Masquer</button>
				</div>
			{:else if callPending}
				<div class="flex justify-center"><span class="loading loading-dots loading-xl"></span></div>
			{:else}
				<div class="flex justify-center">
					<button class="btn btn-outline" type="button" onclick={revealPassword}>Afficher le mot de passe</button>
				</div>
			{/if}
		{/if}
		{#if !editingMetaInfos}
			<div class="modal-action">
				<form method="dialog">
					<button class="btn" disabled={callPending}>Fermer</button>
				</form>
			</div>
		{/if}
	</div>
</dialog>