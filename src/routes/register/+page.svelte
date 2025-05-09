<script lang="ts">
    import { Label, Input, Button } from "flowbite-svelte";

    async function handleSubmit(event: Event) {
        event.preventDefault();

        const data = {
            username:
                (
                    document.querySelector(
                        'input[name="username"]',
                    ) as HTMLInputElement
                )?.value || "",
            password:
                (
                    document.querySelector(
                        'input[name="password"]',
                    ) as HTMLInputElement
                )?.value || "",
            fullName: "",
            email: "",
            phone: "",
        };

        try {
            const response = await fetch("http://localhost:8080/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.token) {
                    localStorage.setItem("authToken", result.token);
                    console.log("Registration successful");
                    window.location.href = "/";
                } else {
                    console.error("Token not found in response.");
                }
            } else {
                console.error("Registration failed:", response.statusText);
            }
        } catch (error) {
            console.error("Error during registration:", error);
        }
    }

    let pw = $state();
    let pwcf = $state();
    let notMatch = $state<boolean>(false);

    $effect(() => {
        if (pw !== pwcf) {
            notMatch = true;
        } else {
            notMatch = false;
        }
    });
</script>

<div class="space-y-4 p-6 sm:p-8 md:space-y-6">
    <form class="flex flex-col space-y-6">
        <h3 class="p-0 text-xl font-medium text-gray-900 dark:text-white">
            Create an account
        </h3>
        <div class="mb-3">
            <Label for="amount" class="block mb-2">Amount</Label>
            <Input
                type="text"
                id="username"
                name="username"
                placeholder="Your awesome username"
                required
            />
        </div>
        <div class="mb-3">
            <Label for="amount" class="block mb-2">Amount</Label>
            <Input
                type="password"
                id="password"
                name="password"
                placeholder="•••••"
                required
            />
        </div>
        <div class="mb-3">
            <Label for="amount" class="block mb-2">Amount</Label>
            <Input
                type="password"
                id="confirm-password"
                name="confirm-password"
                placeholder="•••••"
                required
            />
        </div>
        {#if notMatch}
            <div class="text-sm font-medium text-red-800 dark:text-red-500">
                Password re-confirmation does not match
            </div>
        {/if}
        <button
            class="rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 inline-flex h-12 items-center justify-center px-[21px] text-[15px] font-semibold active:scale-[0.98] active:transition-all"
            type="submit"
            disabled={notMatch}
            onclick={handleSubmit}
        >
            Create account
        </button>
        <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
            Already have an account? <a
                href="/login"
                class="text-primary-600 dark:text-primary-500 font-medium hover:underline"
                >Login here</a
            >
        </div>
    </form>
</div>
