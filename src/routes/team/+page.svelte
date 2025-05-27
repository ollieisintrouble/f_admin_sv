<script lang="ts">
    import { onMount } from "svelte";
    import { currentOrg, user } from "$lib/stores/session";
    import type { Member } from "./types";
    import Badge from "$lib/components/ui/badge/Badge.svelte";
    import Empty from "$lib/components/ui/empty/Empty.svelte";
    import {
        Datepicker,
        Label,
        Input,
        Modal,
        Button,
        Spinner,
        Avatar,
    } from "flowbite-svelte";
    import {
        TrashBinOutline,
        EditOutline,
        CirclePlusOutline,
    } from "flowbite-svelte-icons";

    let isLoading = $state<boolean>(false);
    let members: Member[] = $state<Member[]>([]);

    onMount(async () => {
        isLoading = true;
        const fetchAssets = await fetch(
            `http://localhost:8080/api/users?org_id=${$currentOrg!.id}`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
        if (fetchAssets.ok) {
            const memberData = await fetchAssets.json();
            members = memberData;
            isLoading = false;
        } else {
            console.log("Failed to get members");
            isLoading = false;
        }
    });
</script>

<div class="flex flex-col gap-6 h-full">
    <div class="w-full flex justify-between items-center">
        <h1 class="text-slate-700 text-4xl">Members Hub</h1>
        <div></div>
    </div>
    <div class="w-full grid grid-cols-12 h-full gap-6">
        <div
            class="bg-white/70 p-5 rounded-3xl w-full h-full col-span-9 flex flex-col gap-4 animate-fade-in"
        >
            <div class="flex justify-between items-center pt-2 pl-2">
                <h1 class="text-slate-700 text-2xl">All Members</h1>
                <div></div>
            </div>
            {#if isLoading}
                <div class="w-full h-full flex justify-center items-center">
                    <Spinner size="6" class="me-3" />
                    <p class="text-slate-800 text-lg">Hold on a sec...</p>
                </div>
            {:else if members.length === 0}
                <div class="w-full h-full flex items-center justify-center">
                    <Empty />
                </div>
            {:else}
                <table class="w-full">
                    <thead>
                        <tr>
                            <th
                                class="text-sm min-w-40 font-normal text-slate-500 pl-4 pr-6 py-2 text-left overflow-ellipsis"
                                >Member</th
                            >
                            <th
                                class="text-sm min-w-32 font-normal text-slate-500 pl-4 pr-6 py-2 text-left overflow-ellipsis"
                                >Phone</th
                            >
                            <th
                                class="text-sm min-w-32 font-normal text-slate-500 pl-4 pr-6 py-2 text-left overflow-ellipsis"
                                >Email</th
                            >
                            <th
                                class="text-sm min-w-40 font-normal text-slate-500 pl-4 pr-6 py-2 text-left overflow-ellipsis"
                                >Join Date</th
                            >
                            <!-- <th
                                class="text-sm w-24 font-normal text-slate-500 pl-4 pr-6 py-2 text-left overflow-ellipsis"
                            ></th> -->
                        </tr>
                    </thead>
                    <tbody>
                        {#each members as member}
                            <tr
                                class="group hover:bg-white/45 basic-transition h-14"
                            >
                                <td
                                    class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-3 text-left"
                                >
                                    <div
                                        class="flex items-center gap-3 rounded-xl text-slate-700 hover:text-slate-900"
                                    >
                                        {#if member.image}
                                            <Avatar
                                                src={member.image}
                                                class="bg-gradient-to-tr from-cyan-500 to-teal-400"
                                            />
                                        {:else}
                                            <Avatar
                                                class="bg-slate-200 text-slate-400"
                                            />
                                        {/if}
                                        <div class="flex flex-col">
                                            <div
                                                class="flex gap-2 items-center content-center"
                                            >
                                                <span
                                                    class="text-sm font-semibold"
                                                    >{member.fullName}</span
                                                >
                                                <span
                                                    class="text-sm text-slate-400"
                                                    >{member.username}</span
                                                >
                                            </div>

                                            <div
                                                class="flex gap-2 items-center content-center"
                                            >
                                                <span
                                                    class="text-sm text-slate-600"
                                                    >{member.role}</span
                                                >
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td
                                    class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-3 text-left"
                                >
                                    {member.phone ?? "-"}
                                </td>
                                <td
                                    class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-3 text-left"
                                >
                                    {member.email ?? "-"}
                                </td>
                                <td
                                    class="animate-num-in text-base font-normal text-slate-700 pl-4 pr-10 py-3 text-left"
                                >
                                    {new Date(
                                        member.createdAt as Date,
                                    ).toLocaleDateString("en-GB", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                    })}
                                </td>
                                <!-- <td
                                    class="max-w-24 text-base font-medium text-slate-700 pl-4 pr-10 py-3 text-right"
                                >
                                    <div
                                        class="flex items-center basic-transition max-h-7"
                                    >
                                        <Button
                                            color="alternative"
                                            class="border-0 bg-transparent px-2 py-2 text-slate-700 basic-transition hidden group-hover:block animate-enter-from-right"
                                            ><EditOutline
                                                class="h-5 w-5"
                                            /></Button
                                        >
                                        <Button
                                            on:click={() =>
                                                handleDeleteAsset(
                                                    asset.id as number,
                                                )}
                                            color="alternative"
                                            class="border-0 bg-transparent px-2 py-2 text-rose-700 basic-transition hidden group-hover:block animate-enter-from-right"
                                            ><TrashBinOutline
                                                class="h-5 w-5"
                                            /></Button
                                        >
                                    </div>
                                </td> -->
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>
        <div
            class="w-full h-full col-span-3 bg-white/40 backdrop-blur-2xl p-5 rounded-3xl animate-fade-in"
        >
            <div class="flex justify-between items-center pt-2 pl-2">
                <h1 class="text-slate-700 text-2xl">Insights</h1>
                <div></div>
            </div>
        </div>
    </div>
</div>
