<script lang="ts">
	import "../app.css";
	import { page } from "$app/state";
	import type { Organization, User, Membership } from "$lib/types/types";
	import Header from "$lib/components/ui/header/Header.svelte";

	let { data, children } = $props();
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
		<Header
			user={data.user as User}
			orgs={data.orgs as Organization[]}
			memberships={data.memberships as Membership[]}
		/>
	{/if}
	<div
		class={`h-full px-10 py-8 ${!altLayout && "bg-gradient-to-b from-sky-100 via-cyan-100 via-15% to-emerald-50 rounded-t-[3rem]"} ${altLayout && "flex justify-center items-center"}`}
	>
		{@render children()}
	</div>
</main>
