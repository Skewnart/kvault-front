<script lang="ts">
    import { onDestroy } from 'svelte';

    let { visible = false, message = '', alertType = 'success', onTimeoutEnds, duration = 3000 }: {
        visible?: boolean;
        message?: string;
        alertType?: 'info' | 'success' | 'warning' | 'error';
        onTimeoutEnds?: () => void;
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
            onTimeoutEnds?.();
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
        </div>
    </div>
{/if}
