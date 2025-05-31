<script lang="ts">
    import { onMount } from "svelte";
    import { currentOrg, user } from "$lib/stores/session";
    import type { Asset } from "./type";
    import type { Transaction } from "../finance/type";
    import Badge from "$lib/components/ui/badge/Badge.svelte";
    import Empty from "$lib/components/ui/empty/Empty.svelte";
    import {
        Datepicker,
        Label,
        Input,
        Modal,
        Button,
        Spinner,
    } from "flowbite-svelte";
    import {
        TrashBinOutline,
        EditOutline,
        CirclePlusOutline,
        PlusOutline,
        ChevronLeftOutline,
        ChevronRightOutline,
        ChevronDoubleLeftOutline,
        ChevronDoubleRightOutline,
        DotsHorizontalOutline,
    } from "flowbite-svelte-icons";
    import type { Page } from "$lib/types/types";
    import { CalcPages, CalcVisiblePages } from "$lib/pagination/helpers";

    let isLoading = $state<boolean>(false);
    let assets: Asset[] = $state<Asset[]>([]);
    let transactions: Transaction[] = $state<Transaction[]>([]);
    let totalValue = $state(0);
    let maintenance = $state(0);
    let revenue = $state(0);
    let noOfCutomers = $state(0);
    let revenueRatio = $state(0);
    let customerRatio = $state(0);
    let defaultModal = $state<boolean>(false);
    let newDate = $state<Date>(new Date());
    const pageBucket = 10;
    let currentPage = $state(1);
    let total = $derived(assets.length);
    let pageCount = $derived(Math.ceil(total / pageBucket));
    let pages = $state<Page[]>([]);
    let pagesVisible = $state<Page[]>([]);
    function setPage(page: number) {
        currentPage = page;
        pagesVisible = CalcVisiblePages(pages, page);
    }
    import { toast } from "svelte-sonner";
    import { apiUrl } from "$lib/utils";

    onMount(async () => {
        isLoading = true;
        const fetchAssets = await fetch(
            `${apiUrl}/api/assets?org_id=${$currentOrg!.id}`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
        if (fetchAssets.ok) {
            const assetData = await fetchAssets.json();
            assets = assetData;
            pages = CalcPages(assets);
            pagesVisible = CalcVisiblePages(pages, currentPage);
            isLoading = false;
        } else {
            toast.error("Failed to get assets");
            isLoading = false;
        }

        const fetchTransactions = await fetch(
            `${apiUrl}/api/transactions?org_id=${$currentOrg!.id}`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
        if (fetchTransactions.ok) {
            const transactionsData = await fetchTransactions.json();
            transactions = transactionsData;
        } else {
            toast.error("Failed to get financial data");
        }
    });

    $effect(() => {
        totalValue = assets.reduce((acc, asset) => acc + asset.cost, 0);
        maintenance = assets.filter(
            (asset) => asset.status === "Maintenance",
        ).length;
        revenue = transactions
            .filter((transaction) => transaction.amount > 0)
            .reduce((acc, transaction) => acc + transaction.amount, 0);
        revenueRatio = revenue / totalValue;
        customerRatio = noOfCutomers / totalValue;
    });

    async function handleNewAsset(event: Event) {
        event.preventDefault();

        const newAsset = {
            title: (
                document.querySelector(
                    "input[name=newTitle]",
                ) as HTMLInputElement
            )?.value,
            cost: Number(
                (
                    document.querySelector(
                        "input[name=newCost]",
                    ) as HTMLInputElement
                ).value,
            ),
            description:
                (
                    document.querySelector(
                        "textarea[name=newDescription]",
                    ) as HTMLInputElement
                )?.value || null,
            createdBy: $user?.fullName || null,
            status:
                (
                    document.querySelector(
                        "input[name=newStatus]",
                    ) as HTMLInputElement
                )?.value || null,
            type:
                (
                    document.querySelector(
                        "input[name=newType]",
                    ) as HTMLInputElement
                )?.value || null,
            purchaseDate: newDate.toISOString(),
        };

        assets.push({
            id: null,
            title: newAsset.title,
            cost: newAsset.cost,
            description: newAsset.description,
            createdBy: newAsset.createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: newAsset.status,
            type: newAsset.type,
            purchaseDate: newDate,
        } as Asset);

        defaultModal = false;

        try {
            const newAssetRequest = await fetch(
                `${apiUrl}/api/assets?org_id=${$currentOrg!.id}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newAsset),
                },
            );

            if (newAssetRequest.ok) {
                const response = await newAssetRequest.json();
                const lastAsset = assets.at(-1);
                if (lastAsset) {
                    lastAsset.id = response;
                }
                pages = CalcPages(assets);
                pagesVisible = CalcVisiblePages(pages, currentPage);
                toast.success("New asset logged successfully");
            } else {
                assets.pop();
                toast.error("Failed to log asset");
            }
        } catch (error) {
            assets.pop();
            toast.error("Unexpected error occurred", {
                description: `${error}`,
            });
        }
    }

    async function handleDeleteAsset(id: number) {
        try {
            const deleteAssetRequest = await fetch(
                `${apiUrl}/api/assets?org_id=${$currentOrg!.id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(id),
                },
            );

            if (deleteAssetRequest.ok) {
                const deletedIndex = assets.indexOf(
                    assets.find((i) => i.id === id) as Asset,
                );
                if (deletedIndex > -1) {
                    assets.splice(deletedIndex, 1);
                }
                pages = CalcPages(assets);
                pagesVisible = CalcVisiblePages(pages, currentPage);
                toast.success("Deleted asset successfully");
            } else {
                toast.error("Failed to delete asset");
            }
        } catch (error) {
            toast.error("Unexpected error occurred", {
                description: `${error}`,
            });
        }
    }
</script>

<div class="flex flex-col gap-6 h-full">
    <div class="w-full flex justify-between items-center">
        <h1 class="text-slate-700 text-4xl">Assets Hub</h1>
        <div>
            <Button
                on:click={() => (defaultModal = true)}
                class="bg-sky-700 pl-4 basic-transition"
                ><PlusOutline class="h-4 w-4 me-2" />New Transaction</Button
            >
            <Modal
                title="Create new asset"
                bind:open={defaultModal}
                dir="ltr"
                footerClass="flex justify-end items-center p-5 gap-3"
            >
                <form class="flex flex-col items-start gap-2">
                    <div class="mb-3 w-full">
                        <Label class="block mb-2">Purchase Date</Label>
                        <Datepicker bind:value={newDate} />
                    </div>
                    <div class="mb-3 w-full">
                        <Label for="title" class="block mb-2">Title</Label>
                        <Input
                            id="title"
                            name="newTitle"
                            placeholder="Enter title"
                            class="basic-transition"
                        />
                    </div>
                    <div class="mb-3 w-full">
                        <Label for="cost" class="block mb-2">Cost</Label>
                        <Input
                            id="cost"
                            name="newCost"
                            placeholder="Enter cost"
                            class="basic-transition"
                        />
                    </div>
                    <div class="mb-3 w-full">
                        <Label for="status" class="block mb-2">Status</Label>
                        <Input
                            id="status"
                            name="newStatus"
                            placeholder="Enter status"
                            class="basic-transition"
                        />
                    </div>
                    <div class="mb-3 w-full">
                        <Label for="type" class="block mb-2">Type</Label>
                        <Input
                            id="type"
                            name="newType"
                            placeholder="Enter type"
                            class="basic-transition"
                        />
                    </div>
                    <div class="mb-3 w-full">
                        <Label for="description" class="block mb-2"
                            >Description</Label
                        >
                        <textarea
                            id="description"
                            name="newDescription"
                            placeholder="Enter description"
                            class="basic-transition rounded-lg border-gray-300 bg-gray-50 text-sm w-full min-h-28"
                        ></textarea>
                    </div>
                </form>
                <svelte:fragment slot="footer">
                    <Button
                        class="basic-transition"
                        color="alternative"
                        on:click={() => {
                            defaultModal = false;
                        }}>Cancel</Button
                    >
                    <Button class="basic-transition" on:click={handleNewAsset}
                        >Confirm</Button
                    >
                </svelte:fragment>
            </Modal>
        </div>
    </div>
    <div class="w-full grid grid-cols-12 h-full gap-6">
        <div
            class="bg-white/70 p-5 rounded-3xl w-full h-full col-span-9 flex flex-col gap-4 animate-fade-in"
        >
            <div class="flex justify-between items-center pt-2 pl-2">
                <h1 class="text-slate-700 text-2xl">Listing</h1>
                <div></div>
            </div>
            {#if isLoading}
                <div class="w-full h-full flex justify-center items-center">
                    <Spinner size="6" class="me-3" />
                    <p class="text-slate-800 text-lg">Hold on a sec...</p>
                </div>
            {:else if assets.length === 0}
                <div class="w-full h-full flex items-center justify-center">
                    <Empty />
                </div>
            {:else}
                {#if pages[currentPage - 1]}
                    <div class="h-full">
                        <table class="w-full">
                            <thead>
                                <tr>
                                    <th
                                        class="text-sm min-w-40 font-normal text-slate-500 pl-4 pr-6 py-2 text-left overflow-ellipsis"
                                        >Name</th
                                    >
                                    <th
                                        class="text-sm min-w-64 font-normal text-slate-500 pl-4 pr-6 py-2 text-left overflow-ellipsis"
                                        >Description</th
                                    >
                                    <th
                                        class="text-sm min-w-32 font-normal text-slate-500 pl-4 pr-6 py-2 text-left overflow-ellipsis"
                                        >Status</th
                                    >
                                    <th
                                        class="text-sm min-w-32 font-normal text-slate-500 pl-4 pr-6 py-2 text-left overflow-ellipsis"
                                        >Type</th
                                    >
                                    <th
                                        class="text-sm min-w-40 font-normal text-slate-500 pl-4 pr-6 py-2 text-left overflow-ellipsis"
                                        >Cost</th
                                    >
                                    <th
                                        class="text-sm min-w-36 font-normal text-slate-500 pl-4 pr-6 py-2 text-left overflow-ellipsis"
                                        >Purchase Date</th
                                    >
                                    <th
                                        class="text-sm w-24 font-normal text-slate-500 pl-4 pr-6 py-2 text-left overflow-ellipsis"
                                    ></th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each pages[currentPage - 1].items as asset (asset.id)}
                                    <tr
                                        class="group hover:bg-white/60 basic-transition !h-14"
                                    >
                                        <td
                                            class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-3 text-left"
                                        >
                                            {asset.title}
                                        </td>
                                        <td
                                            class="animate-num-in text-base font-normal text-slate-700 pl-4 pr-10 py-3 text-left"
                                        >
                                            {asset.description ?? "-"}
                                        </td>
                                        <td
                                            class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-3 text-left"
                                        >
                                            {#if asset.status !== null}
                                                <Badge
                                                    content={asset.status}
                                                    type="assetStatus"
                                                />
                                            {:else}
                                                -
                                            {/if}
                                        </td>
                                        <td
                                            class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-3 text-left"
                                        >
                                            {#if asset.type !== null}
                                                <Badge
                                                    content={asset.type}
                                                    type="assetType"
                                                />
                                            {:else}
                                                -
                                            {/if}
                                        </td>
                                        <td
                                            class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-3 text-left"
                                        >
                                            {asset.cost.toLocaleString()}
                                            <span class="text-slate-500"
                                                >{" "}đ</span
                                            >
                                        </td>
                                        <td
                                            class="animate-num-in text-base font-normal text-slate-700 pl-4 pr-10 py-3 text-left"
                                        >
                                            {new Date(
                                                asset.purchaseDate as Date,
                                            ).toLocaleDateString("en-GB", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                            })}
                                        </td>
                                        <td
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
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
                <div class="flex justify-between items-center px-3">
                    <span class="text-slate-500 text-sm"
                        >Found {assets.length} records</span
                    >
                    <div class="flex gap-1 items-center">
                        <Button
                            disabled={currentPage === 1}
                            color="alternative"
                            class="border-0 bg-transparent px-2 py-2 text-slate-700 basic-transition"
                            on:click={() => setPage(1)}
                            ><ChevronDoubleLeftOutline
                                class="h-5 w-5"
                            /></Button
                        >
                        <Button
                            disabled={currentPage === 1}
                            color="alternative"
                            class="border-0 bg-transparent px-2 py-2 text-slate-700 basic-transition"
                            on:click={() => setPage(currentPage - 1)}
                            ><ChevronLeftOutline class="h-5 w-5" /></Button
                        >
                        {#if pageCount > 5 && currentPage > 5}
                            <Button
                                color="alternative"
                                class={`border-0 px-2 py-2 hover:bg-transparent bg-transparent`}
                                ><DotsHorizontalOutline
                                    class="h-5 w-5"
                                /></Button
                            >
                        {/if}
                        {#each pagesVisible as page (page.num)}
                            <Button
                                disabled={currentPage === page.num}
                                color="alternative"
                                class={`w-9 h-9 border-0 bg-transparent px-2 py-2 text-slate-700 basic-transition ${page.num === currentPage && "border border-slate-500"}`}
                                on:click={() => setPage(page.num)}
                                ><span>{page.num}</span></Button
                            >
                        {/each}
                        {#if pageCount > 5 && currentPage < pageCount - 4}
                            <Button
                                color="alternative"
                                class={`border-0 px-2 py-2 hover:bg-transparent bg-transparent`}
                                ><DotsHorizontalOutline
                                    class="h-5 w-5"
                                /></Button
                            >
                        {/if}
                        <Button
                            disabled={currentPage === pageCount}
                            color="alternative"
                            class="border-0 bg-transparent px-2 py-2 text-slate-700 basic-transition"
                            on:click={() => setPage(currentPage + 1)}
                            ><ChevronRightOutline class="h-5 w-5" /></Button
                        >
                        <Button
                            disabled={currentPage === pageCount}
                            color="alternative"
                            class="border-0 bg-transparent px-2 py-2 text-slate-700 basic-transition"
                            on:click={() => setPage(pages.length)}
                            ><ChevronDoubleRightOutline
                                class="h-5 w-5"
                            /></Button
                        >
                    </div>
                </div>
            {/if}
        </div>
        <div
            class="w-full h-full flex flex-col gap-4 col-span-3 bg-white/40 backdrop-blur-2xl p-5 rounded-3xl animate-fade-in"
        >
            <div class="flex justify-between items-center pt-2 pl-2">
                <h1 class="text-slate-700 text-2xl">Insights</h1>
                <div></div>
            </div>
            <div class="w-full p-4 rounded-2xl bg-white/50 flex flex-col gap-2">
                <div class="flex gap-1 justify-between w-full h-8">
                    <span class="text-base text-slate-500">Total Value</span>
                    <div
                        class={`flex items-center gap-1 text-base text-slate-600 font-medium animate-num-in`}
                    >
                        <span>{totalValue.toLocaleString()}</span>
                        <span class="text-slate-400">{" "}đ</span>
                    </div>
                </div>
                <div class="flex gap-1 justify-between w-full h-8">
                    <span class="text-base text-slate-500"
                        >Require Maintenance</span
                    >
                    <div
                        class={`flex items-center gap-1 text-base text-slate-600 font-medium animate-num-in`}
                    >
                        <span>{maintenance}</span>
                    </div>
                </div>
                <div class="flex gap-1 justify-between w-full h-8">
                    <span class="text-base text-slate-500"
                        >Revenue-to-Asset Ratio</span
                    >
                    <div
                        class={`flex items-center gap-1 text-base text-slate-600 font-medium animate-num-in`}
                    >
                        <span>{revenueRatio}</span>
                    </div>
                </div>
                <div class="flex gap-1 justify-between w-full h-8">
                    <span class="text-base text-slate-500"
                        >Customer-to-Asset Ratio</span
                    >
                    <div
                        class={`flex items-center gap-1 text-base text-slate-600 font-medium animate-num-in`}
                    >
                        <span>{customerRatio}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
