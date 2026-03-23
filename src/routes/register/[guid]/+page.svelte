<script lang="ts">

	import { fade } from 'svelte/transition';
	import "../../../app.css";
    import { register, set_token } from '$lib/api';
    import { goto } from '$app/navigation';

	import * as wasm from "$lib/wasm_pkg/kvault_wasm";

	const TITLE = "Inscription";

	let { data } = $props();
	// data.guid

	let username = $state('');
	let password = $state('');
	let password_confirm = $state('');
	let master_password = $state('');
	let master_password_confirm = $state('');

	let error = $state("");
	let callPending = $state(false);

	async function onsubmit(event: Event) {
		error = "";
		callPending = true;
		event.preventDefault();
		
		await wasm.default();

		const register_envelope = wasm.generate_register_envelope(master_password);
		const enc_folders = wasm.create_encoded("{}", register_envelope.pk);
		
		try {
			const response = await register(data.guid, username, password, register_envelope, enc_folders);
			if (response.status === 200) {
				response.text().then(function (token) {
					set_token(token).then(() => {
						callPending = false;
						goto('/');
					});
				});
			} else {
				error = "Mot de passe erroné";
				callPending = false;
			}
		} catch (e) {
			error = "Erreur réseau";
			callPending = false;
		}		
	}

	function giveFocus(element:HTMLElement) {
		element.focus();
	}
</script>

<svelte:head>
	<title>{TITLE}</title>
</svelte:head>

<section class="min-h-screen flex items-center justify-center bg-base-200">
	<div class="w-full max-w-xs">
		<div class="card shadow-lg bg-base-100 p-8">
			<h1 class="text-3xl font-bold text-center mb-8">{TITLE}</h1>
			<form {onsubmit}>
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
							id="username"
							autocomplete="username"
							type="text"
							placeholder="Utilisateur"
							disabled={callPending}
							bind:value={username}
							autofocus
						/>
					</label>
				</div>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Mot de passe de connexion</legend>
					<div>
						<label class="input w-full">
							<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<g
								stroke-linejoin="round"
								stroke-linecap="round"
								stroke-width="2.5"
								fill="none"
								stroke="currentColor"
								>
								<path
									d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
								></path>
								<circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
								</g>
							</svg>
							<input
								id="password"
								type="password"
								placeholder="Mot de passe"
								bind:value={password}
								disabled={callPending}
							/>
						</label>
					</div>

					<div>
						<label class="input w-full">
							<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<g
								stroke-linejoin="round"
								stroke-linecap="round"
								stroke-width="2.5"
								fill="none"
								stroke="currentColor"
								>
								<path
									d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
								></path>
								<circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
								</g>
							</svg>
							<input
								id="password_confirm"
								type="password"
								placeholder="Confirmez-le"
								bind:value={password_confirm}
								disabled={callPending}
							/>
						</label>
					</div>	
				</fieldset>

				<fieldset class="fieldset mb-4">
					<legend class="fieldset-legend">Mot de passe de chiffrement
						<div class="tooltip tooltip-error" data-tip="Attention, ce mot de passe n'étant jamais envoyé sur le serveur, il ne pourra pas être réinitialisé.">
							<div class="badge badge-warning">
								<svg class="size-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><g fill="currentColor"><path d="M7.638,3.495L2.213,12.891c-.605,1.048,.151,2.359,1.362,2.359H14.425c1.211,0,1.967-1.31,1.362-2.359L10.362,3.495c-.605-1.048-2.119-1.048-2.724,0Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path><line x1="9" y1="6.5" x2="9" y2="10" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></line><path d="M9,13.569c-.552,0-1-.449-1-1s.448-1,1-1,1,.449,1,1-.448,1-1,1Z" fill="currentColor" data-stroke="none" stroke="none"></path></g></svg>
							</div>
						</div>
					</legend>
					<div>
						<label class="input w-full">
							<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<g
								stroke-linejoin="round"
								stroke-linecap="round"
								stroke-width="2.5"
								fill="none"
								stroke="currentColor"
								>
								<path
									d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
								></path>
								<circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
								</g>
							</svg>
							<input
								id="master_password"
								type="password"
								placeholder="Mot de passe"
								bind:value={master_password}
								disabled={callPending}
							/>
						</label>
					</div>

					<div>
						<label class="input w-full">
							<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<g
								stroke-linejoin="round"
								stroke-linecap="round"
								stroke-width="2.5"
								fill="none"
								stroke="currentColor"
								>
								<path
									d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
								></path>
								<circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
								</g>
							</svg>
							<input
								id="master_password_confirm"
								type="password"
								placeholder="Confirmez-le"
								bind:value={master_password_confirm}
								disabled={callPending}
							/>
						</label>
					</div>
				</fieldset>

				<button class="btn btn-primary w-full" type="submit" disabled={callPending}>
					{#if callPending}
						<span class="loading loading-dots loading-xl"></span>
					{:else}
						S'inscrire
					{/if}
				</button>
			</form>

			{#if error}
				<div role="alert" class="alert alert-error mt-2" transition:fade>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{error}</span>
				</div>
			{/if}
		</div>
	</div>
</section>
