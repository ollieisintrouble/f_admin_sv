<script lang="ts">
    import NavDock from "../navdock/NavDock.svelte";
    import UserCard from "../usercard/UserCard.svelte";
    import {
        Avatar,
        Dropdown,
        DropdownHeader,
        DropdownItem,
        DropdownDivider,
        Tooltip,
    } from "flowbite-svelte";
    import { currentOrg } from "$lib/stores/session";
</script>

<div class="flex pl-10 pr-12 py-2 justify-between items-center bg-white">
    <div class="flex gap-4 items-center">
        {#if $currentOrg!.image !== null}
            <img src={$currentOrg!.image} alt="" class="w-12 h-12" />
        {:else}
            <img src="/img/logo.png" alt="" class="w-12 h-12" />
        {/if}
    </div>
    <NavDock />
    <UserCard />
</div>
