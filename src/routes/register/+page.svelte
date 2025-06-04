<script lang="ts">
    import { Label, Input, Button } from "flowbite-svelte";
    let username = "";
    let password = "";
    let pwcf = "";
    let error: string | null = null;
    let mismatch = false;

    async function handleSubmit(event: Event) {
        event.preventDefault();

        if (password !== pwcf) {
            error = "Passwords do not match";
            return;
        }

        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        try {
            const response = await fetch("/register", {
                method: "POST",
                body: formData,
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            });
            const responseBody = await response.text();

            if (response.ok) {
                window.location.href = "/";
            } else {
                let data;
                try {
                    data = JSON.parse(responseBody);
                } catch {
                    data = { message: "Registration failed" };
                }
                error = data.message || "Registration failed";
            }
        } catch (err) {
            error = `An unexpected error occurred: ${err}`;
        }
    }

    $: mismatch = password !== pwcf;
</script>

<div
    class="space-y-4 p-6 sm:p-8 md:space-y-6 min-w-80 w-[480px] border-2 border-white/60 bg-white/40 backdrop-blur-2xl rounded-2xl"
>
    <form
        action="/register"
        class="flex flex-col space-y-6"
        on:submit={handleSubmit}
    >
        <h3 class="text-4xl font-medium text-slate-800 dark:text-white mb-5">
            Register
        </h3>
        <div class="mb-3">
            <Label for="username" class="block mb-1">Username</Label>
            <Input
                type="text"
                bind:value={username}
                name="username"
                id="username"
                placeholder="Your awesome username"
                required
            />
        </div>
        <div class="mb-3">
            <Label for="password" class="block mb-1">Password</Label>
            <Input
                type="password"
                bind:value={password}
                name="password"
                id="password"
                placeholder="Your secret password"
                required
            />
        </div>
        <div class="mb-3">
            <Label for="confirm-password" class="block mb-1"
                >Confirm Password</Label
            >
            <Input
                type="password"
                bind:value={pwcf}
                name="confirm-password"
                id="confirm-password"
                placeholder="Re-type password just to be sure"
                required
            />
        </div>
        {#if error}
            <p style="color: red">{error}</p>
        {/if}
        {#if mismatch}
            <div class="text-sm font-medium text-rose-800 dark:text-rose-500">
                Password re-confirmation does not match
            </div>
        {/if}
        <Button
            type="submit"
            class="mt-2 transition-color duration-300"
            size="lg"
            disabled={mismatch}
        >
            Create account
        </Button>
        <div class="text-sm font-medium text-slate-500 dark:text-slate-300">
            Already have an account? <a
                href="/login"
                class="text-primary-600 dark:text-primary-400 font-medium hover:underline"
                >Login here</a
            >
        </div>
    </form>
</div>
