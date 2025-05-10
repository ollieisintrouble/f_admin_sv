<script lang="ts">
    import Badge from "$lib/components/ui/badge/Badge.svelte";
    import { currentOrg, user } from "$lib/stores/session";
    import type { Transaction } from "./type";
    import { onMount } from "svelte";
    let transactions: Transaction[] = $state<Transaction[]>([]);
    import { Datepicker, Label, Input, Modal, Button } from "flowbite-svelte";
    import { Trash, Pencil } from "phosphor-svelte";
    import {
        TrashBinOutline,
        EditOutline,
        ChevronDoubleDownOutline,
    } from "flowbite-svelte-icons";

    onMount(async () => {
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

    let totalRevenue = $state(0);
    let paidExpense = $state(0);
    let unpaidExpense = $state(0);
    let upcomingExpense = $state(0);
    let margin = $derived(totalRevenue + paidExpense);

    $effect(() => {
        totalRevenue = transactions
            .filter((transaction) => transaction.amount > 0)
            .reduce((acc, transaction) => acc + transaction.amount, 0);
        paidExpense = transactions
            .filter(
                (transaction) =>
                    transaction.amount < 0 && transaction.status === "Paid",
            )
            .reduce((acc, transaction) => acc + transaction.amount, 0);
        unpaidExpense = transactions
            .filter(
                (transaction) =>
                    transaction.amount < 0 && transaction.status === "Unpaid",
            )
            .reduce((acc, transaction) => acc + transaction.amount, 0);
        upcomingExpense = transactions
            .filter(
                (transaction) =>
                    transaction.amount < 0 && transaction.status === "Planned",
            )
            .reduce((acc, transaction) => acc + transaction.amount, 0);
    });

    let newDate = $state<Date>(new Date());

    async function handleNewTransaction(event: Event) {
        event.preventDefault();

        const newTransaction = {
            amount: Number(
                (
                    document.querySelector(
                        "input[name=newAmount]",
                    ) as HTMLInputElement
                ).value,
            ),
            description:
                (
                    document.querySelector(
                        "textarea[name=newDescription]",
                    ) as HTMLInputElement
                )?.value || null,
            method:
                (
                    document.querySelector(
                        "input[name=newMethod]",
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
            recordedDate: newDate.toISOString(),
        };

        transactions.push({
            id: null,
            amount: newTransaction.amount,
            description: newTransaction.description,
            method: newTransaction.method,
            createdBy: newTransaction.createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: newTransaction.status,
            type: newTransaction.type,
            recordedDate: newDate,
        } as Transaction);

        defaultModal = false;

        try {
            const newTransactionRequest = await fetch(
                `http://localhost:8080/api/transactions?org_id=${$currentOrg!.id}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newTransaction),
                },
            );

            if (newTransactionRequest.ok) {
                console.log("Created success");
            } else {
                transactions.pop();
                console.log("Failed");
            }
        } catch (error) {
            transactions.pop();
            console.log(`Create failed: ${error}`);
        }
    }

    let defaultModal = $state<boolean>(false);
</script>

<div class="flex flex-col gap-6 h-full">
    <div class="w-full flex justify-between items-center">
        <h1 class="text-slate-700 text-4xl">Finance Hub</h1>
        <div>
            <Button on:click={() => (defaultModal = true)} class="bg-sky-800"
                >New Transaction</Button
            >
            <Modal
                title="Create new transaction"
                bind:open={defaultModal}
                dir="ltr"
                footerClass="flex justify-end items-center p-5 gap-3"
            >
                <form class="flex flex-col items-start gap-2">
                    <div class="mb-3 w-full">
                        <Label class="block mb-2">Recorded Date</Label>
                        <Datepicker bind:value={newDate} />
                    </div>
                    <div class="mb-3 w-full" dir="ltr">
                        <Label for="amount" class="block mb-2">Amount</Label>
                        <Input
                            id="amount"
                            name="newAmount"
                            placeholder="Enter amount"
                        />
                        <Label class="mt-1 text-xs text-gray-500"
                            >Add minus "-" at the start of the number if logging
                            expenses.</Label
                        >
                    </div>
                    <div class="mb-3 w-full">
                        <Label for="method" class="block mb-2">Method</Label>
                        <Input
                            id="method"
                            name="newMethod"
                            placeholder="Enter method"
                        />
                    </div>
                    <div class="mb-3 w-full">
                        <Label for="status" class="block mb-2">Status</Label>
                        <Input
                            id="status"
                            name="newStatus"
                            placeholder="Enter status"
                        />
                    </div>
                    <div class="mb-3 w-full">
                        <Label for="type" class="block mb-2">Type</Label>
                        <Input
                            id="type"
                            name="newType"
                            placeholder="Enter type"
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
                            class="rounded-lg border-gray-300 bg-gray-50 text-sm w-full min-h-28"
                        ></textarea>
                    </div>
                </form>
                <svelte:fragment slot="footer">
                    <Button
                        color="alternative"
                        on:click={() => {
                            defaultModal = false;
                        }}>Cancel</Button
                    >
                    <Button on:click={handleNewTransaction}>Confirm</Button>
                </svelte:fragment>
            </Modal>
        </div>
    </div>
    <div class="w-full flex items-center gap-16">
        <div class="flex flex-col gap-1 min-w-32">
            <span class="text-sm text-slate-500">Total Revenue</span>
            <span class="text-xl text-slate-600 font-medium animate-num-in"
                >{totalRevenue.toLocaleString()}<span class="text-slate-400"
                    >{" "}đ</span
                ></span
            >
        </div>
        <div class="flex flex-col gap-1 min-w-32">
            <span class="text-sm text-slate-500">Paid Expense</span>
            <span class="text-xl text-slate-600 font-medium animate-num-in"
                >{paidExpense.toLocaleString()}<span class="text-slate-400"
                    >{" "}đ</span
                ></span
            >
        </div>
        <div class="flex flex-col gap-1 min-w-32">
            <span class="text-sm text-slate-500">Unpaid Expense</span>
            <span class="text-xl text-slate-600 font-medium animate-num-in"
                >{unpaidExpense.toLocaleString()}<span class="text-slate-400"
                    >{" "}đ</span
                ></span
            >
        </div>
        <div class="flex flex-col gap-1 min-w-32">
            <span class="text-sm text-slate-500">Upcoming Expense</span>
            <span class="text-xl text-slate-600 font-medium animate-num-in"
                >{upcomingExpense.toLocaleString()}<span class="text-slate-400"
                    >{" "}đ</span
                ></span
            >
        </div>
        <div class="flex flex-col gap-1 min-w-32">
            <span class="text-sm text-slate-500">Margin</span>
            <div
                class={`flex items-center gap-0 text-xl text-slate-600 font-medium animate-num-in`}
            >
                <ChevronDoubleDownOutline
                    class={`w-6 h-6 -ml-[6px] ${margin > 0 && "text-emerald-700"} ${margin < 0 && "text-rose-700"}`}
                />
                <span
                    class={`${margin > 0 && "text-emerald-800"} ${margin < 0 && "text-rose-800"}`}
                    >{margin.toLocaleString()}</span
                >
                <span class="text-slate-400">{" "}đ</span>
            </div>
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
                            class="text-sm min-w-48 font-normal text-slate-500 pl-4 pr-6 py-2 text-left"
                            >Amount</th
                        >
                        <th
                            class="text-sm min-w-64 font-normal text-slate-500 pl-4 pr-6 py-2 text-left"
                            >Description</th
                        >
                        <th
                            class="text-sm min-w-40 font-normal text-slate-500 pl-4 pr-6 py-2 text-left"
                            >Payment Method</th
                        >
                        <th
                            class="text-sm min-w-32 font-normal text-slate-500 pl-4 pr-6 py-2 text-left"
                            >Status</th
                        >
                        <th
                            class="text-sm min-w-32 font-normal text-slate-500 pl-4 pr-6 py-2 text-left"
                            >Type</th
                        >
                        <th
                            class="text-sm min-w-40 font-normal text-slate-500 pl-4 pr-6 py-2 text-left"
                            >Recorded Date</th
                        >
                        <th
                            class="text-sm min-w-24 font-normal text-slate-500 pl-4 pr-6 py-2 text-left"
                        ></th>
                    </tr>
                </thead>
                <tbody>
                    {#each transactions as transaction}
                        <tr>
                            <td
                                class={`animate-num-in text-base font-medium pl-4 pr-10 py-4 text-left ${transaction.amount < 0 ? "text-rose-900" : "text-emerald-900"}`}
                            >
                                {transaction.amount.toLocaleString()}
                                <span class="text-slate-500">{" "}đ</span>
                            </td>
                            <td
                                class="animate-num-in text-base font-normal text-slate-700 pl-4 pr-10 py-4 text-left"
                            >
                                {#if transaction.description !== null}
                                    {transaction.description ?? "-"}
                                {:else}
                                    <span class="text-slate-400">-</span>
                                {/if}
                            </td>
                            <td
                                class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-4 text-left"
                            >
                                {#if transaction.method !== null}
                                    {transaction.method}
                                {:else}
                                    <span class="text-slate-400">-</span>
                                {/if}
                            </td>
                            <td
                                class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-4 text-left"
                            >
                                {#if transaction.status !== null}
                                    <Badge
                                        content={transaction.status}
                                        type="transactionStatus"
                                    />
                                {:else}
                                    <span class="text-slate-400">-</span>
                                {/if}
                            </td>
                            <td
                                class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-4 text-left"
                            >
                                {#if transaction.type !== null}
                                    <Badge
                                        content={transaction.type}
                                        type="transactionType"
                                    />
                                {:else}
                                    <span class="text-slate-400">-</span>
                                {/if}
                            </td>
                            <td
                                class="animate-num-in text-base font-normal text-slate-700 pl-4 pr-10 py-4 text-left"
                            >
                                {#if transaction.recordedDate === null}
                                    <span class="text-slate-400">-</span>
                                {:else}
                                    {new Date(
                                        transaction.recordedDate as Date,
                                    ).toLocaleDateString("en-GB", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                    })}
                                {/if}
                            </td>
                            <td
                                class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-4 text-right"
                            >
                                <div class="flex items-center gap-2">
                                    <Button
                                        color="alternative"
                                        class="border-0 bg-transparent px-2 py-2 text-slate-700"
                                        ><EditOutline class="h-5 w-5" /></Button
                                    >
                                    <Button
                                        color="alternative"
                                        class="border-0 bg-transparent px-2 py-2 text-rose-700"
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
