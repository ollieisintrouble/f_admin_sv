<script lang="ts">
    import { Label, Input, Button } from "flowbite-svelte";
    let username = "";
    let password = "";
    let error: string | null = null;

    async function handleSubmit(event: Event) {
        event.preventDefault();

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

<div
    class="space-y-4 p-6 sm:p-8 md:space-y-6 min-w-80 w-[480px] border-2 border-white/60 bg-white/40 backdrop-blur-2xl rounded-2xl"
>
    <form class="flex flex-col space-y-6" on:submit={handleSubmit}>
        <h2 class="text-4xl font-medium text-slate-800 dark:text-white mb-5">
            Login
        </h2>
        <div class="mb-3">
            <Label for="amount" class="block mb-1">Username</Label>
            <Input
                type="text"
                bind:value={username}
                name="username"
                placeholder="Your awesome username"
                required
                class="transition-all duration-300"
            />
        </div>
        <div class="mb-3">
            <Label for="amount" class="block mb-1">Password</Label>
            <Input
                type="password"
                bind:value={password}
                name="password"
                placeholder="Your secret password"
                required
                class="transition-all duration-300"
            />
        </div>
        {#if error}
            <p style="color: red">{error}</p>
        {/if}
        <Button
            type="submit"
            class="mt-2 transition-color duration-300"
            size="lg">Login</Button
        >
        <div class="text-sm font-medium text-slate-500 dark:text-slate-300">
            No account? <a
                href="/register"
                class="text-primary-600 dark:text-primary-400 font-medium hover:underline"
                >Register here</a
            >
        </div>
    </form>
</div>
