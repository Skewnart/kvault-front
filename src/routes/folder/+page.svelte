<script lang="ts">
    import { PUBLIC_API_URL } from '$env/static/public';
    import type { FolderDTO } from '$lib/models/folder_dto';
    import { onMount } from 'svelte';
	import '../../app.css';
	
	const TITLE = "Kvault";

	const props = $props();
	let error = $state("");
	let folders = $state<FolderDTO[] | undefined>(undefined);

	if (!props.data) {
		error = "Erreur pendant le chargement des données sur le serveur";
	}
	const data = props.data;

	if (data.token == undefined) {
		error = "Le token n'est pas présent depuis le chargement de la page.";
	}
	const token = data.token;
	
	//TODO remplacer tout le onmount par un truc plus générique
	onMount(() => {
		fetch(`${PUBLIC_API_URL}/folder`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		}).then(response => {
			if (!response.ok) {
				error = `${response.status}. Erreur pendant le chargement des données.`;
			}
			
			response.json()
			.then(json => {
				folders = json;
			})
			.catch(err => {
				error = `${err}`;
			});
		});
	});

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
	<div class="md:w-3/4 w-full pt-4">
		
		{#if error}
			<div role="alert" class="alert alert-error">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>{error}</span>
			</div>
		{/if}

		{#if folders}
			<ul class="list bg-base-100 rounded-box shadow-md ">
			<li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Todo : Module de recherche</li>
				{#each folders as folder}
					<li class="list-row">
						<div>
							<svg xmlns="http://www.w3.org/2000/svg" class="size-10" fill="none" viewBox="0 0 24 24">
								<path d="M14 13V12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12V13M10.5 16H13.5C13.9659 16 14.1989 16 14.3827 15.9239C14.6277 15.8224 14.8224 15.6277 14.9239 15.3827C15 15.1989 15 14.9659 15 14.5C15 14.0341 15 13.8011 14.9239 13.6173C14.8224 13.3723 14.6277 13.1776 14.3827 13.0761C14.1989 13 13.9659 13 13.5 13H10.5C10.0341 13 9.80109 13 9.61732 13.0761C9.37229 13.1776 9.17761 13.3723 9.07612 13.6173C9 13.8011 9 14.0341 9 14.5C9 14.9659 9 15.1989 9.07612 15.3827C9.17761 15.6277 9.37229 15.8224 9.61732 15.9239C9.80109 16 10.0341 16 10.5 16ZM12.0627 6.06274L11.9373 5.93726C11.5914 5.59135 11.4184 5.4184 11.2166 5.29472C11.0376 5.18506 10.8425 5.10425 10.6385 5.05526C10.4083 5 10.1637 5 9.67452 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V10.2C21 9.0799 21 8.51984 20.782 8.09202C20.5903 7.71569 20.2843 7.40973 19.908 7.21799C19.4802 7 18.9201 7 17.8 7H14.3255C13.8363 7 13.5917 7 13.3615 6.94474C13.1575 6.89575 12.9624 6.81494 12.7834 6.70528C12.5816 6.5816 12.4086 6.40865 12.0627 6.06274Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
						<div>
							<div>{folder.name}</div>
							<div class="text-xs uppercase font-semibold opacity-60">Todo : description</div>
						</div><button class="btn btn-square btn-ghost" aria-label="folder-edit-{folder.id}">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="black" width="16px" height="16px" viewBox="0 0 24 24">
								<path fill-rule="evenodd" clip-rule="evenodd" d="M20.8477 1.87868C19.6761 0.707109 17.7766 0.707105 16.605 1.87868L2.44744 16.0363C2.02864 16.4551 1.74317 16.9885 1.62702 17.5692L1.03995 20.5046C0.760062 21.904 1.9939 23.1379 3.39334 22.858L6.32868 22.2709C6.90945 22.1548 7.44285 21.8693 7.86165 21.4505L22.0192 7.29289C23.1908 6.12132 23.1908 4.22183 22.0192 3.05025L20.8477 1.87868ZM18.0192 3.29289C18.4098 2.90237 19.0429 2.90237 19.4335 3.29289L20.605 4.46447C20.9956 4.85499 20.9956 5.48815 20.605 5.87868L17.9334 8.55027L15.3477 5.96448L18.0192 3.29289ZM13.9334 7.3787L3.86165 17.4505C3.72205 17.5901 3.6269 17.7679 3.58818 17.9615L3.00111 20.8968L5.93645 20.3097C6.13004 20.271 6.30784 20.1759 6.44744 20.0363L16.5192 9.96448L13.9334 7.3787Z" fill="#0F0F0F"/>
							</svg>
						</button>
						<button class="btn btn-square btn-ghost" aria-label="folder-open-{folder.id}">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="black" width="16px" height="16px" viewBox="0 0 24 24">
								<path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="flex justify-center">
				<span class="loading loading-spinner text-primary"></span>
			</div>
		{/if}
	</div>
</div>