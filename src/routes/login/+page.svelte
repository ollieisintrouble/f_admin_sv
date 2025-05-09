<script lang="ts">
    import { goto } from "$app/navigation";
    import { Label, Input, Button } from "flowbite-svelte";
    let username = "";
    let password = "";
    let error: string | null = null;

    async function handleSubmit(event: Event) {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        try {
            const response = await fetch("/login", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                window.location.href = "/";
            } else {
                const data = await response.json();
                error = data.message || "Login failed";
            }
        } catch (err) {
            error = `An unexpected error occurred: ${err}`;
        }
    }
</script>

<div class="space-y-4 p-6 sm:p-8 md:space-y-6">
    <form class="flex flex-col space-y-6" on:submit={handleSubmit}>
        <h3 class="p-0 text-xl font-medium text-gray-900 dark:text-white">
            Login
        </h3>
        <div class="mb-3">
            <Label for="amount" class="block mb-2">Amount</Label>
            <Input
                type="text"
                bind:value={username}
                name="username"
                placeholder="Your awesome username"
                required
            />
        </div>
        <div class="mb-3">
            <Label for="amount" class="block mb-2">Amount</Label>
            <Input
                type="password"
                bind:value={password}
                name="password"
                placeholder="•••••"
                required
            />
        </div>
        {#if error}
            <p style="color: red">{error}</p>
        {/if}
        <Button type="submit">Login</Button>
        <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
            No account? <a
                href="/register"
                class="text-primary-600 dark:text-primary-500 font-medium hover:underline"
                >Register here</a
            >
        </div>
    </form>
</div>
