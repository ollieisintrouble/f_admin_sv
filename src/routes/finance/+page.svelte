<script lang="ts">
    import Badge from "$lib/components/ui/badge/Badge.svelte";
    import Empty from "$lib/components/ui/empty/Empty.svelte";
    import { currentOrg, user } from "$lib/stores/session";
    import type { Transaction } from "./type";
    import { onMount } from "svelte";
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
        ChevronDoubleDownOutline,
        PlusOutline,
        ChevronLeftOutline,
        ChevronRightOutline,
        ChevronDoubleLeftOutline,
        ChevronDoubleRightOutline,
        DotsHorizontalOutline,
    } from "flowbite-svelte-icons";
    import type { Page } from "$lib/types/types";
    import { CalcPages, CalcVisiblePages } from "$lib/pagination/helpers";
    import { toast } from "svelte-sonner";
    import { apiUrl } from "$lib/utils";

    let isLoading = $state<boolean>(false);
    let transactions = $state<Transaction[]>([]);
    let totalRevenue = $state(0);
    let paidExpense = $state(0);
    let upcomingExpense = $state(0);
    let margin = $derived(totalRevenue + paidExpense);
    let defaultModal = $state<boolean>(false);
    let newDate = $state<Date>(new Date());
    const pageBucket = 10;
    let currentPage = $state(1);
    let total = $derived(transactions.length);
    let pageCount = $derived(Math.ceil(total / pageBucket));
    let pages = $state<Page[]>([]);
    let pagesVisible = $state<Page[]>([]);
    function setPage(page: number) {
        currentPage = page;
        pagesVisible = CalcVisiblePages(pages, page);
    }

    onMount(async () => {
        isLoading = true;
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
            pages = CalcPages(transactions);
            pagesVisible = CalcVisiblePages(pages, currentPage);
            isLoading = false;
        } else {
            toast.error("Failed to get transactions");
            isLoading = false;
        }
    });

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
        upcomingExpense = transactions
            .filter(
                (transaction) =>
                    transaction.amount < 0 && transaction.status === "Planned",
            )
            .reduce((acc, transaction) => acc + transaction.amount, 0);
    });

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
                `${apiUrl}/api/transactions?org_id=${$currentOrg!.id}`,
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
                const response = await newTransactionRequest.json();
                const lastTransaction = transactions.at(-1);
                if (lastTransaction) {
                    lastTransaction.id = response;
                }
                pages = CalcPages(transactions);
                pagesVisible = CalcVisiblePages(pages, currentPage);
                toast.success("Logged transaction successfully");
            } else {
                transactions.pop();
                toast.error("Failed to log transaction");
            }
        } catch (error) {
            transactions.pop();
            toast.error("Unexpected error occurred", {
                description: `${error}`,
            });
        }
    }

    async function handleDeleteTransaction(id: number) {
        try {
            const deleteTransactionRequest = await fetch(
                `${apiUrl}/api/transactions?org_id=${$currentOrg!.id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(id),
                },
            );

            if (deleteTransactionRequest.ok) {
                const deletedIndex = transactions.indexOf(
                    transactions.find((i) => i.id === id) as Transaction,
                );
                if (deletedIndex > -1) {
                    transactions.splice(deletedIndex, 1);
                }
                pages = CalcPages(transactions);
                pagesVisible = CalcVisiblePages(pages, currentPage);
                toast.success("Deleted transaction successfully");
            } else {
                toast.error("Failed to delete transaction");
            }
        } catch (error) {
            toast.error("Unexpected error occurred", {
                description: `${error}`,
            });
        }
    }
</script>

<div class="flex flex-col gap-5 h-full">
    <div class="w-full flex justify-between items-center">
        <h1 class="text-slate-700 text-4xl">Finance Hub</h1>
        <div>
            <Button
                on:click={() => (defaultModal = true)}
                class="bg-sky-700 pl-4 basic-transition"
                ><PlusOutline class="h-4 w-4 me-2" />New Transaction</Button
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
                            class="basic-transition"
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
                            class="rounded-lg basic-transition border-gray-300 bg-gray-50 text-sm w-full min-h-28"
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
                    <Button on:click={handleNewTransaction}>Confirm</Button>
                </svelte:fragment>
            </Modal>
        </div>
    </div>
    <div class="w-full grid grid-cols-12 h-full gap-6">
        <div
            class="bg-white/70 p-5 rounded-3xl w-full h-full col-span-9 flex flex-col gap-5 animate-fade-in"
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
            {:else if transactions.length === 0}
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
                                        class="text-sm min-w-40 font-normal text-slate-500 pl-4 pr-6 py-2 text-left truncate"
                                        >Amount</th
                                    >
                                    <th
                                        class="text-sm min-w-64 font-normal text-slate-500 pl-4 pr-6 py-2 text-left truncate"
                                        >Description</th
                                    >
                                    <th
                                        class="text-sm min-w-40 font-normal text-slate-500 pl-4 pr-6 py-2 text-left truncate"
                                        >Payment Method</th
                                    >
                                    <th
                                        class="text-sm min-w-32 font-normal text-slate-500 pl-4 pr-6 py-2 text-left truncate"
                                        >Status</th
                                    >
                                    <th
                                        class="text-sm min-w-32 font-normal text-slate-500 pl-4 pr-6 py-2 text-left truncate"
                                        >Type</th
                                    >
                                    <th
                                        class="text-sm min-w-32 font-normal text-slate-500 pl-4 pr-6 py-2 text-left truncate"
                                        >Recorded Date</th
                                    >
                                    <th
                                        class="text-sm w-24 font-normal text-slate-500 pl-4 pr-6 py-2 text-left truncate"
                                    ></th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each pages[currentPage - 1].items as transaction (transaction.id)}
                                    <tr
                                        class="group hover:bg-white/60 basic-transition !h-14"
                                    >
                                        <td
                                            class={`animate-num-in text-base font-medium pl-4 pr-10 py-3 text-left ${transaction.amount < 0 ? "text-rose-900" : "text-emerald-900"}`}
                                        >
                                            {transaction.amount.toLocaleString()}
                                            <span class="text-slate-500"
                                                >{" "}đ</span
                                            >
                                        </td>
                                        <td
                                            class="animate-num-in text-base font-normal text-slate-700 pl-4 pr-10 py-3 text-left truncate"
                                        >
                                            {#if transaction.description !== null}
                                                {transaction.description ?? "-"}
                                            {:else}
                                                <span class="text-slate-400"
                                                    >-</span
                                                >
                                            {/if}
                                        </td>
                                        <td
                                            class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-3 text-left truncate"
                                        >
                                            {#if transaction.method !== null}
                                                {transaction.method}
                                            {:else}
                                                <span class="text-slate-400"
                                                    >-</span
                                                >
                                            {/if}
                                        </td>
                                        <td
                                            class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-3 text-left"
                                        >
                                            {#if transaction.status !== null}
                                                <Badge
                                                    content={transaction.status}
                                                    type="transactionStatus"
                                                />
                                            {:else}
                                                <span class="text-slate-400"
                                                    >-</span
                                                >
                                            {/if}
                                        </td>
                                        <td
                                            class="animate-num-in text-base font-medium text-slate-700 pl-4 pr-10 py-3 text-left"
                                        >
                                            {#if transaction.type !== null}
                                                <Badge
                                                    content={transaction.type}
                                                    type="transactionType"
                                                />
                                            {:else}
                                                <span class="text-slate-400"
                                                    >-</span
                                                >
                                            {/if}
                                        </td>
                                        <td
                                            class="animate-num-in text-base font-normal text-slate-700 pl-4 pr-10 py-3 text-left"
                                        >
                                            {#if transaction.recordedDate === null}
                                                <span class="text-slate-400"
                                                    >-</span
                                                >
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
                                                    on:click={() => {
                                                        handleDeleteTransaction(
                                                            transaction.id as number,
                                                        );
                                                    }}
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
                        >Found {transactions.length} records</span
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
                    <span class="text-base text-slate-500">Margin</span>
                    <div
                        class={`flex items-center gap-1 text-base text-slate-600 font-medium animate-num-in`}
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
                <div class="flex gap-1 justify-between w-full h-8">
                    <span class="text-base text-slate-500">Total Revenue</span>
                    <div
                        class={`flex items-center gap-1 text-base text-slate-600 font-medium animate-num-in`}
                    >
                        <span>{totalRevenue.toLocaleString()}</span>
                        <span class="text-slate-400">{" "}đ</span>
                    </div>
                </div>
                <div class="flex gap-1 justify-between w-full h-8">
                    <span class="text-base text-slate-500">Paid Expense</span>
                    <div
                        class={`flex items-center gap-1 text-base text-slate-600 font-medium animate-num-in`}
                    >
                        <span>{paidExpense.toLocaleString()}</span>
                        <span class="text-slate-400">{" "}đ</span>
                    </div>
                </div>
                <div class="flex gap-1 justify-between w-full h-8">
                    <span class="text-base text-slate-500"
                        >Upcoming Expense</span
                    >
                    <div
                        class={`flex items-center gap-1 text-base text-slate-600 font-medium animate-num-in`}
                    >
                        <span>{upcomingExpense.toLocaleString()}</span>
                        <span class="text-slate-400">{" "}đ</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
