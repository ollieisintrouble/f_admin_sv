<script lang="ts">
    import {
        Avatar,
        Dropdown,
        DropdownHeader,
        DropdownItem,
    } from "flowbite-svelte";
    import { user, memberships, currentOrg, orgs } from "$lib/stores/session";

    let name = $derived($user!.fullName);
    let username = $derived($user!.username);
    let email = $derived($user!.email);
    let avatarFallback = $state<string>("");
    if ($user!.fullName === null) {
        avatarFallback = "U";
    } else {
        avatarFallback = ($user!.fullName as string)
            .match(/\b\w/g)
            ?.slice(0, 2)
            ?.join("")
            .toUpperCase() as string;
    }
    let avatar = $user!.image;
    let role = $derived(
        $memberships!.find(
            (membership) => membership.organizationId === $currentOrg?.id,
        )?.role,
    );

    async function handleLogout() {
        const response = await fetch("api/logout", { method: "POST" });
        if (response.ok) {
            user.set(null);
            memberships.set([]);
            orgs.set([]);
            document.cookie =
                "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";
            window.location.href = "/";
        } else {
            user.set(null);
            memberships.set([]);
            orgs.set([]);
            document.cookie =
                "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";
            window.location.href = "/";
        }
    }
</script>

<div
    class="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100"
>
    {#if avatar}
        <Avatar src={avatar} />
    {:else}
        <Avatar
            class="bg-gradient-to-tr from-cyan-200 to-emerald-100 text-slate-700"
            >{avatarFallback}</Avatar
        >
    {/if}
    <div class="flex flex-col gap-0">
        <span class="text-sm font-semibold">{name}</span>
        <span class="text-sm text-slate-500">{role}</span>
    </div>
</div>
<Dropdown>
    <DropdownHeader>
        <span class="block truncate text-sm text-slate-800">{username}</span>
        <span class="block truncate text-sm text-slate-600 font-medium"
            >{email}</span
        >
    </DropdownHeader>
    <DropdownItem on:click={handleLogout} class="basic-transition"
        >Log out</DropdownItem
    >
</Dropdown>
