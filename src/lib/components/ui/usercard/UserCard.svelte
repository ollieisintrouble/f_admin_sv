<script lang="ts">
    import {
        Avatar,
        Dropdown,
        DropdownHeader,
        DropdownItem,
        DropdownDivider,
        Tooltip,
    } from "flowbite-svelte";

    const {
        avatar,
        avatarFallback,
        name,
        role,
    }: {
        avatar?: string;
        avatarFallback?: string;
        name?: string;
        role?: string;
    } = $props();
</script>

<div
    class="flex items-center gap-3 p-3 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100"
>
    {#if avatar}
        <Avatar
            src={avatar}
            class="bg-gradient-to-tr from-cyan-500 to-teal-400"
        />
    {:else}
        <Avatar>{avatarFallback}</Avatar>
    {/if}
    <div class="flex flex-col gap-0">
        <span class="text-sm font-semibold">{name}</span>
        <span class="text-sm text-slate-500">{role}</span>
    </div>
</div>
