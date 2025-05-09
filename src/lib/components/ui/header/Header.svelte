<script lang="ts">
    import NavDock from "../navdock/NavDock.svelte";
    import UserCard from "../usercard/UserCard.svelte";
    import type { SessionProps } from "$lib/types/types";
    import { currentOrg } from "$lib/stores/session";

    let { user, orgs, memberships }: SessionProps = $props();
    currentOrg.set(orgs![0]);

    let name = $derived(user!.fullName);
    let avatarFallback = $state<string>("");
    if (user!.fullName === null) {
        avatarFallback = "U";
    } else {
        avatarFallback = (user!.fullName as string)
            .match(/\b\w/g)
            ?.slice(0, 2)
            ?.join("")
            .toUpperCase() as string;
    }
    let avatar = user!.image;
    let role = $derived(
        memberships!.find(
            (membership) => membership.organizationId === $currentOrg?.id,
        )?.role,
    );
</script>

<div class="flex pl-10 pr-12 py-2 justify-between items-center bg-white">
    <div class="flex gap-4 items-center">
        {#if $currentOrg!.image !== null}
            <img src={$currentOrg!.image} alt="Logo" class="w-12 h-12" />
        {:else}
            <img src="/img/logo.png" alt="Logo" class="w-12 h-12" />
        {/if}
    </div>
    <NavDock />
    <UserCard
        name={name as string}
        avatar={avatar as string}
        avatarFallback={avatarFallback as string}
        role={role as string}
    />
</div>
