<script lang="ts">
    import {
        SquaresFour,
        Speedometer,
        Stack,
        Invoice,
        AppWindow,
        UsersThree,
        Megaphone,
        AddressBookTabs,
        ChartLineUp,
    } from "phosphor-svelte";
    import { page } from "$app/state";

    const navItems = [
        {
            name: "",
            icon: Speedometer,
        },
        {
            name: "Products",
            icon: AppWindow,
        },
        {
            name: "Assets",
            icon: Stack,
        },
        {
            name: "Finance",
            icon: Invoice,
        },
        {
            name: "Team",
            icon: UsersThree,
        },
        {
            name: "Marketing",
            icon: Megaphone,
        },
        {
            name: "Customers",
            icon: AddressBookTabs,
        },
        {
            name: "Sale",
            icon: ChartLineUp,
        },
    ];
    let activeItem = $state(page.url.pathname);
    $effect(() => {
        activeItem = page.url.pathname;
    });
</script>

<div class="flex items-center">
    {#each navItems as item}
        <a href={`/${item.name.toLowerCase()}`}>
            <div
                class={`flex items-center px-4 py-3 gap-2 cursor-pointer text-slate-400 hover:text-slate-600 hover:bg-slate-100 basic-transition rounded-xl ${activeItem === `/${item.name.toLowerCase()}` && "bg-cyan-100! text-cyan-800! hover:bg-cyan-100! hover:text-cyan-800!"}`}
            >
                <item.icon
                    size={24}
                    class={`${activeItem === `/${item.name.toLowerCase()}` && ""}`}
                />
                <span
                    class={`text-sm ${activeItem === `/${item.name.toLowerCase()}` && ""}`}
                >
                    {#if item.name === ""}
                        Home
                    {:else}
                        {item.name}
                    {/if}
                </span>
            </div>
        </a>
    {/each}
</div>
