<script lang="ts">

	import { fade } from 'svelte/transition';
	import "../../app.css";
    import { login } from '$lib/api';

	const TITLE = "Connexion";

	let username = $state('');
	let password = $state('');

	let error = $state("");
	let callPending = $state(false);
	let showPassword = $state(false);
	let logged_in = $state(false);
	let token_result = $state("");

	async function onsubmit(event: Event) {
		error = "";
		callPending = true;
		event.preventDefault();

		if (!showPassword) {
			try {
				const response = await login(username, "");
				if (response.status === 204) {
					showPassword = true;
				} else {
					error = "Utilisateur inconnu";
				}
			} catch (e) {
				error = "Erreur réseau";
			}
			finally {
				callPending = false;
			}

		} else {
			try {
				const response = await login(username, password)
				if (response.status === 200) {
					logged_in = true;

					response.text().then(function (text) {
						token_result = text;
						console.log("token_result",token_result);

					});
				} else {
					error = "Mot de passe erroné";
				}
			} catch (e) {
				error = "Erreur réseau";
			}
			finally {
				callPending = false;
			}
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
							disabled={showPassword}
							bind:value={username}
							autofocus
						/>
					</label>
				</div>

				{#if showPassword}
					<div class="mb-4" transition:fade>
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
								use:giveFocus
							/>
						</label>
					</div>
				{/if}

				<button class="btn btn-primary w-full" type="submit" disabled={callPending}>
					{#if callPending}
						<span class="loading loading-dots loading-xl"></span>
					{:else}
						{showPassword ? 'Connexion' : 'Suivant'}
					{/if}
				</button>
			</form>

			{#if error}
				<p class="text-error text-center mt-4" transition:fade>{error}</p>
			{/if}

			{#if logged_in}
				<h2 class="text-success text-center mt-4">Hello {username}!</h2>
			{/if}
		</div>
	</div>
</section>
