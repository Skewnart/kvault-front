<script lang="ts">
    import type { FolderDTO } from '$lib/models/folder_dto';
	import { onMount, tick } from 'svelte';
	import '../../app.css';
    import { goto } from '$app/navigation';
	
	import * as wasm from "$lib/wasm_pkg/kvault_wasm";
	import { foldersExist, getFolders } from '$lib/session_storage_api';
    import FolderDialog from './FolderDialog.svelte';
	
	const TITLE = "Kvault";

	const props = $props();
	let error = $state("");
	let folders = $state<FolderDTO[] | undefined>(undefined);
	let modalKey = $state<number>(0);
	let searchInput = $state<HTMLInputElement>();
		
	let folderQuery = $state<string>("");
	const filteredFolders = $derived(
		folders
		?.filter(f => f.name.toLowerCase().includes(folderQuery.toLowerCase()))
		.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
	);

	function handleGlobalKeydown(event: KeyboardEvent) {
		const target = event.target;
		const isEditable = target instanceof HTMLElement && (
			target.isContentEditable ||
			target instanceof HTMLInputElement ||
			target instanceof HTMLTextAreaElement ||
			target instanceof HTMLSelectElement
		);
		const focusedRow = target instanceof Element
			? target.closest<HTMLAnchorElement>('[data-folder-result]')
			: null;
		const isInDialog = target instanceof Element && target.closest('dialog[open]') !== null;

		if (event.key === 'Escape' && !isInDialog && (!isEditable || target === searchInput) && (folderQuery || target === searchInput)) {
			event.preventDefault();
			if (folderQuery) {
				folderQuery = '';
			} else {
				searchInput?.blur();
			}
			return;
		}

		if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !isInDialog && (!isEditable || target === searchInput)) {
			const rows = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-folder-result]'));
			if (rows.length > 0) {
				const currentIndex = focusedRow ? rows.indexOf(focusedRow) : -1;
				const nextIndex = event.key === 'ArrowDown'
					? Math.min(currentIndex + 1, rows.length - 1)
					: currentIndex < 0 ? rows.length - 1 : Math.max(currentIndex - 1, 0);

				event.preventDefault();
				rows[nextIndex].focus();
			}
			return;
		}

		if (event.key === 'Enter' && target === searchInput && folderQuery && filteredFolders?.length === 1) {
			event.preventDefault();
			goto(`/folder/${filteredFolders[0].id}`);
			return;
		}

		if (event.key === '+' && !isEditable && !isInDialog && !event.ctrlKey && !event.metaKey && !event.altKey) {
			event.preventDefault();
			addFolder();
			return;
		}

		if (!isEditable && !event.ctrlKey && !event.metaKey && !event.altKey && /^[\p{L}\p{N}]$/u.test(event.key)) {
			searchInput?.focus();
		}
	}

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

<svelte:window onkeydown={handleGlobalKeydown} />

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
				<input bind:this={searchInput} class="input input-bordered w-full" placeholder="Écrivez pour commencer à chercher..." bind:value={folderQuery} aria-label="Recherche dossiers" />
			</div>
			<ul class="list bg-base-100 rounded-box shadow-md ">
				{#if folderQuery && filteredFolders && filteredFolders.length === 0}
					<li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Aucun dossier ne correspond à la recherche</li>
				{/if}
			</ul>
			<ul class="list bg-base-100 rounded-box shadow-md mt-4">
				{#each filteredFolders ?? [] as folder}
				<a data-folder-result href="/folder/{folder.id}" class="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
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
			<button class="btn btn-primary btn-block my-4" onclick={addFolder}> Ajouter un dossier (+)</button>
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