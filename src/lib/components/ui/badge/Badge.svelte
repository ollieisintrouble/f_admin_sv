<script lang="ts">
    import { getColor } from ".";
    import { onMount } from "svelte";

    let { content, type } = $props();
    let dynamicClasses = $state("text-slate-800 bg-slate-200");
    let isMounted = false;

    onMount(() => {
        isMounted = true;
        updateStyles();
    });

    function updateStyles() {
        if (!isMounted) return;

        const color = getColor(type, content) || "slate";
        dynamicClasses = `text-${color}-700 bg-${color}-100`;
    }

    $effect(() => {
        if (isMounted && (content || type)) {
            updateStyles;
        }
    });
</script>

<div
    class={`w-fit text-sm font-normal py-1 px-3 rounded-2xl flex items-center gap-2 ${dynamicClasses}`}
>
    {content}
</div>
