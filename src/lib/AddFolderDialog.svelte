<script lang="ts">
  export let folder_name: string;
  export let callPending: boolean = false;
  export let onSubmit: (e: Event) => void = () => {};
</script>

<dialog id="add_folder_modal" class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Ajouter un dossier</h3>
    <form on:submit={onSubmit} class="mt-4">
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
            id="folder_name"
            autocomplete="off"
            type="text"
            placeholder="Nom"
            bind:value={folder_name}
            required
          />
        </label>
      </div>

      <button class="btn btn-primary w-full" type="submit" disabled={callPending}>
        {#if callPending}
          <span class="loading loading-dots loading-xl"></span>
        {:else}
          Ajouter
        {/if}
      </button>
    </form>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn" disabled={callPending}>Fermer</button>
      </form>
    </div>
  </div>
</dialog>
