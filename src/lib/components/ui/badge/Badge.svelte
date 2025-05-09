<script lang="ts">
    import { getColor } from ".";
    import { onMount } from "svelte";

    let { content, type } = $props();
    let dynamicClasses = $state("text-gray-800 bg-gray-200");
    let isMounted = false;

    onMount(() => {
        isMounted = true;
        updateStyles();
    });

    function updateStyles() {
        if (!isMounted) return;

        const color = getColor(type, content) || "gray";
        dynamicClasses = `text-${color}-800 bg-${color}-200`;
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
