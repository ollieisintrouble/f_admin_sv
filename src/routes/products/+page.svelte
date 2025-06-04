<script lang="ts">
    import { onMount } from "svelte";
    import type { Product } from "./type";
    import { currentOrg, user } from "$lib/stores/session";
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
    } from "flowbite-svelte-icons";
    import { toast } from "svelte-sonner";
    import { ApiUrl, GetAuthToken } from "$lib/utils";

    let isLoading = $state<boolean>(false);
    let products = $state<Product[]>([]);
    let defaultModal = $state<boolean>(false);
    let newDate = $state<Date | null>(null);
    const token = GetAuthToken();

    onMount(async () => {
        isLoading = true;

        if (!token) {
            toast.error("No auth token found");
            return;
        }

        const fetchProducts = await fetch(
            `${ApiUrl}/api/products?org_id=${$currentOrg!.id}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );
        if (fetchProducts.ok) {
            const productsData = await fetchProducts.json();
            products = productsData;
            isLoading = false;
        } else {
            toast.error("Failed to get transactions");
            isLoading = false;
        }
    });

    async function handleNewProduct(event: Event) {
        event.preventDefault();

        const newProduct = {
            productName: (
                document.querySelector(
                    "input[name=newName]",
                ) as HTMLInputElement
            )?.value,
            description:
                (
                    document.querySelector(
                        "textarea[name=newDescription]",
                    ) as HTMLInputElement
                )?.value || null,
            productUrl:
                (
                    document.querySelector(
                        "input[name=newProductUrl]",
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
            launchDate: newDate?.toISOString() || null,
            metricUrl:
                (
                    document.querySelector(
                        "input[name=newMetricUrl]",
                    ) as HTMLInputElement
                )?.value || null,
            logo:
                (
                    document.querySelector(
                        "input[name=newLogo]",
                    ) as HTMLInputElement
                )?.value || null,
        };

        products.push({
            id: null,
            productName: newProduct.productName,
            description: newProduct.description,
            productUrl: newProduct.productUrl,
            createdBy: newProduct.createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: newProduct.status,
            type: newProduct.type,
            launchDate: newDate,
            metricsUrl: newProduct.metricUrl,
            logo: newProduct.logo,
        } as Product);

        defaultModal = false;

        try {
            const newProductRequest = await fetch(
                `${ApiUrl}/api/products?org_id=${$currentOrg!.id}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newProduct),
                },
            );

            if (newProductRequest.ok) {
                const response = await newProductRequest.json();
                const lastProduct = products.at(-1);
                if (lastProduct) {
                    lastProduct.id = response;
                }
                toast.success("Logged transaction successfully");
            } else {
                products.pop();
                toast.error("Failed to log transaction");
            }
        } catch (error) {
            products.pop();
            toast.error("Unexpected error occurred", {
                description: `${error}`,
            });
        }
    }

    async function handleDeleteProduct(id: number) {
        try {
            const deleteProductRequest = await fetch(
                `${ApiUrl}/api/products?org_id=${$currentOrg!.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(id),
                },
            );

            if (deleteProductRequest.ok) {
                const deletedIndex = products.indexOf(
                    products.find((i) => i.id === id) as Product,
                );
                if (deletedIndex > -1) {
                    products.splice(deletedIndex, 1);
                }
                toast.success("Deleted product successfully");
            } else {
                toast.error("Failed to delete product");
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
        <h1 class="text-slate-700 text-4xl">Products Hub</h1>
        <div>
            <Button
                on:click={() => (defaultModal = true)}
                class="bg-sky-700 basic-transition pl-4"
                ><CirclePlusOutline class="h-5 w-5 me-2" /> New Product</Button
            >
            <Modal
                title="Create new product"
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
                        <Label for="name" class="block mb-2">Product name</Label
                        >
                        <Input
                            id="name"
                            name="newName"
                            placeholder="Enter Name"
                            class="basic-transition"
                        />
                    </div>
                    <div class="mb-3 w-full">
                        <Label for="logo" class="block mb-2">Logo</Label>
                        <Input
                            id="logo"
                            name="newLogo"
                            placeholder="Enter Logo URL"
                            class="basic-transition"
                        />
                    </div>
                    <div class="mb-3 w-full">
                        <Label for="productUrl" class="block mb-2"
                            >Product URL</Label
                        >
                        <Input
                            id="productUrl"
                            name="newProductUrl"
                            placeholder="Enter Product URL"
                            class="basic-transition"
                        />
                    </div>
                    <div class="mb-3 w-full">
                        <Label for="metricUrl" class="block mb-2"
                            >Metric URL</Label
                        >
                        <Input
                            id="metricUrl"
                            name="newMetricUrl"
                            placeholder="Enter Metric URL"
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
                    <Button on:click={handleNewProduct}>Confirm</Button>
                </svelte:fragment>
            </Modal>
        </div>
    </div>
    <div class="w-full h-full flex justify-center items-center">
        {#if isLoading}
            <div class="flex items-center">
                <Spinner size="6" class="me-3" />
                <p class="text-slate-800 text-lg">Hold on a sec...</p>
            </div>
        {:else if products.length === 0}
            <div class="w-full h-full flex items-center justify-center">
                <Empty />
            </div>
        {:else}
            <div class="grid grid-cols-2 gap-5 content-start w-full h-full">
                {#each products as product (product.id)}
                    <div
                        class="group flex flex-col w-full h-fit min-h-48 justify-between gap-2 px-4 py-6 rounded-2xl bg-white/45 hover:bg-white/70 basic-transition border-2 border-white/45 backdrop-blur-md animate-enter-from-left"
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                {#if product.logo}
                                    <img
                                        src={product.logo}
                                        alt=""
                                        width="28px"
                                        height="28px"
                                    />
                                {/if}
                                <h2 class="text-2xl text-slate-800">
                                    {product.productName}
                                </h2>
                            </div>
                            <div class="flex items-center gap-1">
                                <Badge
                                    type="productType"
                                    content={product.type}
                                />
                                <Badge
                                    type="productStatus"
                                    content={product.status}
                                />
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <p class="text-sm text-slate-700">
                                {product.description}
                            </p>
                            <div
                                class="flex justify-between items-center w-full h-7"
                            >
                                <p class="text-sm text-slate-500">
                                    {#if product.launchDate === null}
                                        No date
                                    {:else}
                                        {new Date(
                                            product.launchDate as Date,
                                        ).toLocaleDateString("en-GB", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                        })}
                                    {/if}
                                </p>
                                <div
                                    class="flex items-center basic-transition max-h-7"
                                >
                                    <Button
                                        color="alternative"
                                        class="border-0 bg-transparent px-2 py-2 text-slate-700 basic-transition hidden group-hover:block animate-enter-from-right"
                                        ><EditOutline class="h-5 w-5" /></Button
                                    >
                                    <Button
                                        on:click={() => {
                                            handleDeleteProduct(
                                                product.id as number,
                                            );
                                        }}
                                        color="alternative"
                                        class="border-0 bg-transparent px-2 py-2 text-rose-700 basic-transition hidden group-hover:block animate-enter-from-right"
                                        ><TrashBinOutline
                                            class="h-5 w-5"
                                        /></Button
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
