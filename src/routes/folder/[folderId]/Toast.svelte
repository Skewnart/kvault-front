<script lang="ts">
    import { onDestroy } from 'svelte';

    let { visible = false, message = '', alertType = 'success', onConfirm, onCancel, duration = 3000 }: {
        visible?: boolean;
        message?: string;
        alertType?: 'info' | 'success' | 'warning' | 'error';
        onConfirm?: () => void;
        onCancel?: () => void;
        duration?: number;
    } = $props();

    let toastTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

    function clearToastTimeout() {
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastTimeout = undefined;
        }
    }

    function startTimeout() {
        clearToastTimeout();
        toastTimeout = setTimeout(() => {
            onCancel?.();
        }, duration);
    }

    $effect(() => {
        if (visible) {
            startTimeout();
        } else {
            clearToastTimeout();
        }
    });

    onDestroy(() => {
        clearToastTimeout();
    });
</script>

{#if visible}
    <div class="toast toast-bottom toast-center">
        <div class="alert alert-{alertType} flex-col sm:flex-row gap-2">
            <span>{message}</span>
            <div class="flex gap-2">
                {#if onConfirm}
                    <button class="btn btn-sm btn-error" type="button" onclick={() => {
                        onConfirm?.();
                    }}>Confirmer</button>
                    <button class="btn btn-sm btn-ghost" type="button" onclick={() => {
                        onCancel?.();
                    }}>Annuler</button>
                {/if}
            </div>
        </div>
    </div>
{/if}
