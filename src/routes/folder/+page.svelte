<script lang="ts">
    import type { FolderDTO } from '$lib/models/folder_dto';
	import { onMount, tick } from 'svelte';
	import '../../app.css';
    import { goto } from '$app/navigation';
	
	import * as wasm from "$lib/wasm_pkg/kvault_wasm";
	import { foldersExist, getFolders } from '$lib/session_storage_api';
    import FolderDialog from './FolderDialog.svelte';
	
	const TITLE = "Kvault";

	// TODO : Refaire le design sur toutes les pages APRES être passé sur toutes les pages pour les FEATURES qui ne changeront pas avec le design
	// TODO : Faire de l'otp mail au lieu du mot de passe de connexion. (envoi mail uniquement en production)
	// TODO : Enlever les gros blocs de log dans la console pour le back

	const props = $props();
	let error = $state("");
	let folders = $state<FolderDTO[] | undefined>(undefined);
	let modalKey = $state<number>(0);
		
	let folderQuery = $state<string>("");
	const filteredFolders = $derived(folders?.filter(f => f.name.toLowerCase().includes(folderQuery.toLowerCase())));

	if (!props.data) {
		error = "Erreur pendant le chargement des données sur le serveur";
	}
	const data = props.data;

	if (data.token == undefined) {
		error = "Le token n'est pas présent depuis le chargement de la page.";
	}
	const token = data.token;

	function openFolder(e: Event, id: String) {
		e.preventDefault();
		goto(`/folder/${id}`);
	}

	async function addFolder() {		
		modalKey = modalKey + 1;
		await tick();

		const modal = document.getElementById('add_folder_modal') as HTMLDialogElement | null;
		if (modal) {
			modal.showModal();
		}
	}
	
	onMount(async () => {
		await wasm.default();

		if (!foldersExist()){
			error = "Les dossiers devraient être présents après connexion.";
		}

		folders = getFolders();	
	});

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

		{#if !!folders}
			<div class="mb-2">
				<input class="input input-bordered w-full" placeholder="Rechercher un dossier..." bind:value={folderQuery} aria-label="Recherche dossiers" />
			</div>
			<ul class="list bg-base-100 rounded-box shadow-md ">
				{#if folderQuery && filteredFolders && filteredFolders.length === 0}
					<li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Aucun dossier ne correspond à la recherche</li>
				{/if}
			</ul>
			<ul class="list bg-base-100 rounded-box shadow-md mt-4">
				{#each filteredFolders as folder}
				<a href="/folder/{folder.id}" >
					<li class="list-row" >
						<div>
							<svg xmlns="http://www.w3.org/2000/svg" class="size-10" fill="none" viewBox="0 0 24 24" aria-hidden="true">
								<path d="M3 8V7.5A1.5 1.5 0 0 1 4.5 6h4.086a2 2 0 0 1 1.414.586L11.414 8H19.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5V8Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</div>
						<div class="content-center">
							<div>{folder.name}</div>
						</div>
						<button class="btn btn-square btn-ghost" aria-label="folder-open-{folder.id}" onclick={(e) => openFolder(e, folder.id)}>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="black" width="16px" height="16px" viewBox="0 0 24 24">
								<path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
					</li>
				</a>
				{/each}
			</ul>
			<button class="btn btn-primary btn-block my-4" onclick={addFolder}> Ajouter un dossier</button>
			{#key modalKey}
				<FolderDialog {token} bind:folders/>
			{/key}
		{:else}
			<div class="flex justify-center">
				<span class="loading loading-spinner text-primary"></span>
			</div>
		{/if}
	</div>
</div>