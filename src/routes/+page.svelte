<script lang="ts">
	import '../app.css';
	
	const TITLE = "Kvault";

</script>

<svelte:head>
	<title>{{TITLE}}</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="bg-base-200 drawer lg:drawer-open">
	<input id="drawer" type="checkbox" class="drawer-toggle">
	<div class="drawer-content">
		<div class="relative max-w-[100vw] px-6 pb-16 xl:pe-2">
			
		</div>
	</div>
	<div class="drawer-side z-40" style="scroll-behavior: smooth; scroll-padding-top: 5rem;">
		<label for="drawer" class="drawer-overlay" aria-label="Close menu"></label>
		<aside class="bg-base-100 min-h-screen w-80"></aside>
	</div>
</div>