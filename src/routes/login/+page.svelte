<script lang="ts">
	import { fade } from 'svelte/transition';
	import "../../app.css";

	const TITLE = "Connexion";
	const GOOD_USERNAME = "user"; // temp
	const GOOD_PASSWORD = "password"; //temp

	let username = $state('');
	let password = $state('');

	let error = $state("");
	let showPassword = $state(false);
	let logged_in = $state(false);

	function onsubmit() {
		error = "";

		if (!showPassword) {
			if (username == GOOD_USERNAME) {
				showPassword = true;
			}
			else {
				error = "Utilisateur inconnu";
			}
		}
		else {
			if (username == GOOD_USERNAME && password == GOOD_PASSWORD) {
				logged_in = true;
			}
			else {
				error = "Mot de passe erroné";
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

				<button class="btn btn-primary w-full" type="submit">
					{showPassword ? 'Connexion' : 'Suivant'}
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
