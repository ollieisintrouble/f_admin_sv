<script lang="ts">
	import "../app.css";
	import { page } from "$app/state";
	import type { Organization, User, Membership } from "$lib/types/types";
	import { orgs, user, memberships, currentOrg } from "$lib/stores/session";
	import Header from "$lib/components/ui/header/Header.svelte";
	import { Toaster } from "svelte-sonner";

	let { data, children } = $props();
	if (data.user) {
		user.set(data.user as User);
		memberships.set(data.memberships as Membership[]);
		orgs.set(data.orgs as Organization[]);
		currentOrg.set(data.orgs![0] as Organization);
	}

	const currentPath = page.url.pathname;
	let altLayout = $state(false);

	if (
		currentPath === "/login" ||
		currentPath === "/register" ||
		currentPath === "/neworg" ||
		currentPath === "/payment" ||
		currentPath === "/error"
	) {
		altLayout = true;
	}
</script>

<main class="h-screen flex flex-col bg-white">
	{#if !altLayout}
		<Header />
	{/if}
	<div
		class={`h-full px-10 py-8 bg-gradient-to-b from-sky-100 via-sky-200 via-35% to-teal-100 ${!altLayout && "rounded-t-[3rem]"} ${altLayout && "flex justify-center items-center"}`}
	>
		{@render children()}
	</div>
	<Toaster position="bottom-center" expand={false} closeButton />
</main>
