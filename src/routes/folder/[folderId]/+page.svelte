<script lang="ts">
    import type { FolderDTO } from '$lib/models/folder_dto';
	import { onMount, tick } from 'svelte';
	import '../../../app.css';
    import { goto } from '$app/navigation';
	
	import * as wasm from "$lib/wasm_pkg/kvault_wasm";
    import EntryDialog from './EntryDialog.svelte';
    import ConfirmDialog, { type ConfirmParams } from '$lib/components/ConfirmDialog.svelte';
    import Toast, { type ToastAlertType, type ToastParams } from '$lib/components/Toast.svelte';
    import type { EntryDTO } from '$lib/models/entry_dto';
    import { delete_by_id, delete_entries, get_encoded, post_encoded } from '$lib/api';
    import { RegisterEnvelopeDTOFrom } from '$lib/models/register_envelope_dto';
    import { addAllEntriesToFolder, getFolderById, getFolders, removeFolder, storeFolder } from '$lib/session_storage_api';
    import type { EncodedDTO } from '$lib/models/encoded_dto';
	import EntryDetailsDialog from './EntryDetailsDialog.svelte';

    const TITLE = "Kvault";

    const props = $props();
    let error = $state("");
    let folder = $state<FolderDTO | undefined>(undefined);
    let entries = $state<EntryDTO[] | undefined>(undefined);
	let selectedEntry = $state<EntryDTO | undefined>(undefined);
	let copyingEntryId = $state<String | undefined>(undefined);
    let modalKey = $state<number>(0);
    let editingTitle = $state<boolean>(false);
    let titleInput = $state<String>("");
    let toast = $state<Pick<ToastParams, 'message' | 'alertType'> | undefined>(undefined);
    let confirmDialog = $state<Pick<ConfirmParams, 'message'> | undefined>(undefined);
	
    let entryQuery = $state<string>("");
	const filteredEntries = $derived((entries ?? []).filter(e => ((e.name ?? "") + " " + (e.description ?? "")).toLowerCase().includes(entryQuery.toLowerCase())));

	if (!props.data) {
		error = "Erreur pendant le chargement des données sur le serveur";
	}
	const data = props.data;

	if (data.token == undefined) {
		error = "Le token n'est pas présent depuis le chargement de la page.";
	}
	if (data.folderId == undefined) {
		error = "Aucun dossier n'a été demandé";
	}
	const token = data.token;
	
	onMount(async () => {
		
		await wasm.default();

		folder = getFolderById(data.folderId);

		if (folder?.entries != undefined && folder?.entries.length > 0)
		{
			entries = folder?.entries;
		}
		else {
			const master_password = sessionStorage.getItem("mp");
			if (master_password == null) {
				error = "Le mot de passe maître ne peut pas être utilisé.";
			}
	
			const user_envelope_session = sessionStorage.getItem("envelope");
			if (user_envelope_session == null) {
				error = "L'enveloppe de chiffrement ne peut pas être récupéré.";
			}
			const user_envelope = RegisterEnvelopeDTOFrom(user_envelope_session!);
	
			const entries_encoded = await get_encoded(token, `folder/${folder?.id}`);

			if (entries_encoded == undefined) {
				goto('/logout');
				return;
			}
			
			try {
				entries = JSON.parse(wasm.read_encoded(
					master_password!,
					user_envelope.master_salt,
					user_envelope.enc_sk,
					user_envelope.sk_nonce,
					entries_encoded.encoded,
					entries_encoded.enc_kyber,
					entries_encoded.enc_nonce
				)) as EntryDTO[];

				folder!.entries = entries;
				addAllEntriesToFolder(data.folderId, entries);
			} catch (decryptError) {
				error = "Mot de passe de chiffrement erroné";
				return;
			}
		}
	});

	function openEntry(entry: EntryDTO) {
		selectedEntry = entry;
	}

	async function copyEntryPassword(entry: EntryDTO) {
		if (copyingEntryId !== undefined) return;
		copyingEntryId = entry.id;
		error = '';

		try {
			const masterPassword = sessionStorage.getItem('mp');
			if (!masterPassword) throw new Error('Le mot de passe maître ne peut pas être utilisé.');

			const envelopeSession = sessionStorage.getItem('envelope');
			if (!envelopeSession) throw new Error("L'enveloppe de chiffrement ne peut pas être récupérée.");
			const envelope = RegisterEnvelopeDTOFrom(envelopeSession);

			const encoded = await get_encoded(token, `entry/${entry.id}`);
			if (!encoded) {
				goto('/logout');
				return;
			}

			let password: string;
			try {
				password = wasm.read_encoded(
					masterPassword,
					envelope.master_salt,
					envelope.enc_sk,
					envelope.sk_nonce,
					encoded.encoded,
					encoded.enc_kyber,
					encoded.enc_nonce
				).trim();
			} catch {
				throw new Error('Mot de passe de chiffrement erroné.');
			}

			await navigator.clipboard.writeText(password);
			showToast('success', 'Mot de passe copié !');
		} catch (copyError) {
			console.error(copyError);
			error = copyError instanceof Error ? copyError.message : 'Impossible de copier le mot de passe.';
		} finally {
			copyingEntryId = undefined;
		}
	}

	function updateEntry(updatedEntry: EntryDTO) {
		entries = entries?.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry);
	}

	function removeEntry(entryId: String) {
		entries = entries?.filter(entry => entry.id !== entryId);
		selectedEntry = undefined;
	}

	async function addEntry() {
		modalKey = modalKey + 1;
		await tick();
		const modal = document.getElementById('add_entry_modal') as HTMLDialogElement | null;
		if (modal) {
			modal.showModal();
		}
	}

    function startEditingTitle() {
        if (!folder) return;
        titleInput = folder.name;
        editingTitle = true;
    }

    function cancelEditingTitle() {
        editingTitle = false;
    }

    function saveTitle() {
        if (!folder) return;
        const trimmed = titleInput.trim();
        if (!trimmed) {
            error = "Le nom du dossier ne peut pas être vide.";
            return;
        }
        folder.name = trimmed;	
        storeFolder(folder);
		sendFolders().then(() => {
			editingTitle = false;
			showToast("success", "Dossier sauvegardé !");
		}).catch(err => {
			console.error(err);
			error = "Erreur lors de l'envoi des dossiers";
        	editingTitle = false;
		});
    }

    function handleTitleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            saveTitle();
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            cancelEditingTitle();
        }
    }

    function hideToast() {
        toast = undefined;
    }

    function showToast(alertType: ToastAlertType, message: string) {
        toast = {
            message,
			alertType
        };
    }

    function requestDeleteCurrentFolder() {
        if (!folder) return;
		confirmDialog = {
			message: `Supprimer le dossier "${folder.name}" ? Cette action est irréversible.`
		};
	}

    function cancelDeleteCurrentFolder() {
        confirmDialog = undefined;
    }

    function performDeleteCurrentFolder() {
        if (!folder) return;
        confirmDialog = undefined;

		removeFolder(folder.id);
		
		const entryIds: number[] = (folder.entries ?? []).map(entry => Number(entry.id));
		console.log("entryIds", entryIds);
		delete_entries(token, entryIds).then(() => {
			delete_by_id(token, "folder", Number(folder?.id)).then(() => {
				sendFolders().then(() => {
					editingTitle = false;
					goto('/folder');
				}).catch(err => {
					console.error(err);
					error = "Erreur lors de la suppression des dossiers";
					editingTitle = false;
				});
			});
		});
    }

	function sendFolders() : Promise<string> {
		const user_envelope_session = sessionStorage.getItem("envelope");
		if (user_envelope_session == null) {
			error = "L'enveloppe de chiffrement ne peut pas être récupéré.";
		}
		const user_envelope = RegisterEnvelopeDTOFrom(user_envelope_session!);
		
		const folders = getFolders();
		const folders_str = JSON.stringify(folders);
		const enc_folders = wasm.create_encoded(folders_str, user_envelope.pk);
		const enc_folders_dto : EncodedDTO = { enc_kyber: enc_folders.enc_kyber, enc_nonce: enc_folders.enc_nonce, encoded: enc_folders.encoded };
		const enc_folders_str = JSON.stringify({ enc_data: enc_folders_dto });

		return post_encoded(token, "folder", enc_folders_str);
	}


function goBack() {
	if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
		window.history.back();
	} else {
		goto('/folder');
	}
}

</script>

<svelte:head>
	<title>{TITLE}</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="flex justify-center">
	<div class="md:w-3/4 w-full mt-4 mx-4 relative pt-12">
			<button class="btn btn-ghost normal-case absolute top-2 flex items-center gap-2" type="button" aria-label="Retour" onclick={goBack}>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
				</svg>
				<span>Précédent</span>
			</button>
		
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
			onConfirm={performDeleteCurrentFolder}
			onCancel={cancelDeleteCurrentFolder}
		/>

		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 my-4">
			{#if editingTitle}
				<div class="flex-1">
					<input
						class="input input-bordered w-full"
						type="text"
						bind:value={titleInput}
						onkeydown={handleTitleKeydown}
						aria-label="Nom du dossier"
					/>
				</div>
				<div class="flex gap-2">
					<button class="btn btn-success" type="button" onclick={saveTitle}>Valider</button>
					<button class="btn btn-secondary" type="button" onclick={cancelEditingTitle}>Annuler</button>
				</div>
			{:else}
				<h1 class="text-2xl font-bold">{folder?.name}</h1>
				<div class="flex gap-2">
					<button class="btn btn-square btn-ghost" type="button" aria-label="Modifier le dossier" onclick={startEditingTitle}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 00.707-.293l9.414-9.414a1 1 0 000-1.414l-3.586-3.586a1 1 0 00-1.414 0L4 14.586V20z" />
						</svg>
					</button>
					<button class="btn btn-square btn-ghost text-error" type="button" aria-label="Supprimer le dossier" onclick={requestDeleteCurrentFolder}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M19 7L5 7M10 11V17M14 11V17M5 7L6 19a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
						</svg>
					</button>
				</div>
			{/if}
		</div>

		{#if !!entries}
			<div class="mb-2">
				<input class="input input-bordered w-full" placeholder="Rechercher un accès (nom ou description)..." bind:value={entryQuery} aria-label="Recherche accès" />
			</div>
			<ul class="list bg-base-100 rounded-box shadow-md mt-4">
				{#if entryQuery && filteredEntries && filteredEntries.length === 0}
					<li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Aucun accès ne correspond à la recherche</li>
				{/if}
				{#each filteredEntries as entry}
					<li class="list-row grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
						<button class="flex w-full min-w-0 items-center gap-4 text-left cursor-pointer" type="button" aria-label="Ouvrir {entry.name}" onclick={() => openEntry(entry)}>
							<div class="shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" class="size-10" fill="none" viewBox="0 0 24 24" aria-hidden="true">
									<path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
									<rect x="5" y="10" width="14" height="11" rx="2.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
									<path d="M12 14v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
								</svg>
							</div>
							<div class="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:gap-4">
								<div class="content-center truncate">{entry.name}</div>
								<div class="content-center truncate text-right">{entry.description}</div>
							</div>
						</button>
						<div class="flex shrink-0 items-center gap-1">
							<button class="btn btn-square btn-ghost" type="button" aria-label="Copier le mot de passe de {entry.name}" title="Copier le mot de passe" onclick={() => copyEntryPassword(entry)} disabled={copyingEntryId !== undefined}>
								{#if copyingEntryId === entry.id}
									<span class="loading loading-spinner loading-sm" aria-hidden="true"></span>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
										<rect x="8" y="8" width="12" height="13" rx="2" stroke-linejoin="round" />
										<path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2" stroke-linecap="round" />
									</svg>
								{/if}
							</button>
							<button class="btn btn-square btn-ghost" type="button" aria-label="Ouvrir {entry.name}" onclick={() => openEntry(entry)}>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
									<path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</button>
						</div>
					</li>
				{/each}
			</ul>
			<button class="btn btn-primary btn-block my-4" onclick={addEntry}>Ajouter un accès</button>
			{#key modalKey}
				<EntryDialog {token} folderId={folder?.id} bind:entries/>
			{/key}
			{#if selectedEntry}
				<EntryDetailsDialog
					{token}
					folderId={data.folderId}
					entry={selectedEntry}
					onClose={() => selectedEntry = undefined}
					onUpdated={updateEntry}
					onDeleted={removeEntry}
				/>
			{/if}
		{:else}
			<div class="flex justify-center">
				<span class="loading loading-spinner text-primary"></span>
			</div>
		{/if}
	</div>
</div>