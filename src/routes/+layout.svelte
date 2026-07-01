<script>
	import { page } from '$app/state';

	let { children } = $props();

	const hideBanner = $derived(
		page.url.pathname === '/login' || page.url.pathname.startsWith('/register')
	);
</script>

{#if !hideBanner}
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
{/if}

{@render children()}