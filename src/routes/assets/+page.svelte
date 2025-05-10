<script lang="ts">
    import Badge from "$lib/components/ui/badge/Badge.svelte";
    import type { Asset } from "./type";
    import type { Transaction } from "../finance/type";
    import { onMount } from "svelte";
    import { currentOrg } from "$lib/stores/session";

    let assets: Asset[] = $state<Asset[]>([]);
    let transactions: Transaction[] = $state<Transaction[]>([]);

    let totalValue = $state(0);
    let maintenance = $state(0);

    let revenue = $state(0);
    let noOfCutomers = $state(0);

    let revenueRatio = $state(0);
    let customerRatio = $state(0);

    onMount(async () => {
        const fetchAssets = await fetch(
            `http://localhost:8080/api/assets?org_id=${$currentOrg!.id}`,
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
        } else {
            console.log("Failed to get assets");
        }

        const fetchTransactions = await fetch(
            `http://localhost:8080/api/transactions?org_id=${$currentOrg!.id}`,
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
            console.log("Failed to get financial data");
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
</script>

<div class="flex flex-col gap-6 h-full">
    <div class="w-full flex justify-between items-center">
        <h1 class="text-slate-700 text-4xl">Assets Management</h1>
        <div></div>
    </div>
    <div class="w-full flex items-center gap-16">
        <div class="flex flex-col gap-1">
            <span class="text-sm text-slate-500">Total Value</span>
            <span class="text-xl text-slate-600 font-medium animate-num-in"
                >{totalValue.toLocaleString()}<span class="text-slate-500"
                    >{" "}VND</span
                ></span
            >
        </div>
        <div class="flex flex-col gap-1">
            <span class="text-sm text-slate-500">Require Maintenance</span>
            <span class="text-xl text-slate-600 font-medium animate-num-in"
                >{maintenance}</span
            >
        </div>
        <div class="flex flex-col gap-1">
            <span class="text-sm text-slate-500">Revenue-to-Asset Ratio</span>
            <span class="text-xl text-slate-600 font-medium animate-num-in"
                >{revenueRatio}</span
            >
        </div>
        <div class="flex flex-col gap-1">
            <span class="text-sm text-slate-500">Customer-to-Asset Ratio</span>
            <span class="text-xl text-slate-600 font-medium animate-num-in"
                >{customerRatio}</span
            >
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
            <table class="w-full">
                <thead>
                    <tr>
                        <th
                            class="text-sm min-w-48 font-normal text-slate-500 pl-4 pr-10 py-2 text-left"
                            >Name</th
                        >
                        <th
                            class="text-sm min-w-72 font-normal text-slate-500 pl-4 pr-10 py-2 text-left"
                            >Description</th
                        >
                        <th
                            class="text-sm min-w-36 font-normal text-slate-500 pl-4 pr-10 py-2 text-left"
                            >Status</th
                        >
                        <th
                            class="text-sm min-w-36 font-normal text-slate-500 pl-4 pr-10 py-2 text-left"
                            >Type</th
                        >
                        <th
                            class="text-sm min-w-48 font-normal text-slate-500 pl-4 pr-10 py-2 text-left"
                            >Cost</th
                        >
                        <th
                            class="text-sm min-w-36 font-normal text-slate-500 pl-4 pr-10 py-2 text-left"
                            >Purchase Date</th
                        >
                    </tr>
                </thead>
                <tbody>
                    {#each assets as asset}
                        <tr>
                            <td
                                class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-4 text-left"
                            >
                                {asset.title}
                            </td>
                            <td
                                class="animate-num-in text-base font-normal text-slate-700 pl-4 pr-10 py-4 text-left"
                            >
                                {asset.description ?? "-"}
                            </td>
                            <td
                                class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-4 text-left"
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
                                class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-4 text-left"
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
                                class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-4 text-left"
                            >
                                {asset.cost.toLocaleString()}
                                <span class="text-slate-500">{" "}VND</span>
                            </td>
                            <td
                                class="animate-num-in text-base font-normal text-slate-700 pl-4 pr-10 py-4 text-left"
                            >
                                {new Date(
                                    asset.purchaseDate as Date,
                                ).toLocaleDateString("en-GB", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                })}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <div
            class="w-full h-full col-span-3 bg-white/50 backdrop-blur-2xl p-5 rounded-3xl animate-fade-in"
        >
            <div class="flex justify-between items-center pt-2 pl-2">
                <h1 class="text-slate-700 text-2xl">Insights</h1>
                <div></div>
            </div>
        </div>
    </div>
</div>
