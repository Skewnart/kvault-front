<script lang="ts">
	import '../../app.css';
	
	const TITLE = "Kvault";

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
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.00024 0V9H7.00024V0H8.00024ZM12.3873 1.79159L12.7447 2.14129C14.1345 3.50125 15 5.39628 15 7.49548C15 11.6345 11.6437 15 7.5 15C3.35837 15 0 11.6346 0 7.49548C0 5.39135 0.877013 3.49961 2.26871 2.14089L2.62648 1.7916L3.32506 2.50714L2.96729 2.85642C1.75699 4.03804 1 5.67618 1 7.49548C1 11.0833 3.91163 14 7.5 14C11.0903 14 14 11.0834 14 7.49548C14 5.67725 13.2515 4.03641 12.0453 2.85602L11.6879 2.50632L12.3873 1.79159Z" /> </svg>
		</a>
	</div>
  </div>
</div>

<div class="flex justify-center">
	<ul class="list bg-base-100 rounded-box shadow-md ">
	
		<li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Most played songs this week</li>
		
		<li class="list-row">
			<div><img class="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/1@94.webp"/></div>
			<div>
			<div>Dio Lupa</div>
			<div class="text-xs uppercase font-semibold opacity-60">Remaining Reason</div>
			</div>
			<button class="btn btn-square btn-ghost">
			<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
			</button>
			<button class="btn btn-square btn-ghost">
			<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></g></svg>
			</button>
		</li>
		
		<li class="list-row">
			<div><img class="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/4@94.webp"/></div>
			<div>
			<div>Ellie Beilish</div>
			<div class="text-xs uppercase font-semibold opacity-60">Bears of a fever</div>
			</div>
			<button class="btn btn-square btn-ghost">
			<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
			</button>
			<button class="btn btn-square btn-ghost">
			<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></g></svg>
			</button>
		</li>
		
		<li class="list-row">
			<div><img class="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/3@94.webp"/></div>
			<div>
			<div>Sabrino Gardener</div>
			<div class="text-xs uppercase font-semibold opacity-60">Cappuccino</div>
			</div>
			<button class="btn btn-square btn-ghost">
			<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
			</button>
			<button class="btn btn-square btn-ghost">
			<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></g></svg>
			</button>
		</li>
	</ul>
</div>