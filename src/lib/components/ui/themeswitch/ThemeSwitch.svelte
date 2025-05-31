<script lang="ts">
    import { onMount } from "svelte";

    // Reactive state for current theme
    let currentTheme = $state("light");

    // Function to apply theme
    function applyTheme(theme: string) {
        const html = document.documentElement;

        // Remove all theme classes
        html.classList.remove("dark");

        // Apply new theme class
        if (theme === "dark") {
            html.classList.add("dark");
        }

        // Store preference
        localStorage.setItem("theme", theme);
        currentTheme = theme;
    }

    // Toggle between light and dark
    function toggleTheme() {
        const newTheme = currentTheme === "light" ? "dark" : "light";
        applyTheme(newTheme);
    }

    // Initialize theme on mount
    onMount(() => {
        // Check for saved theme preference or default to 'light'
        const savedTheme = localStorage.getItem("theme") || "light";

        // Check for system preference if no saved preference
        const systemPrefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;
        const initialTheme =
            savedTheme === "auto"
                ? systemPrefersDark
                    ? "dark"
                    : "light"
                : savedTheme;

        applyTheme(initialTheme);

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: any) => {
            if (localStorage.getItem("theme") === "auto") {
                applyTheme(e.matches ? "dark" : "light");
            }
        };

        mediaQuery.addEventListener("change", handleChange);

        // Cleanup
        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    });
</script>

<!-- Simple toggle button -->
<button
    onclick={toggleTheme}
    class="inline-flex items-center justify-center rounded-md border border-border-input px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    aria-label="Toggle theme"
>
    {#if currentTheme === "light"}
        🌙 Dark Mode
    {:else}
        ☀️ Light Mode
    {/if}
</button>

<!-- Or a more advanced dropdown -->
<div class="relative inline-block text-left">
    <select
        bind:value={currentTheme}
        onchange={(e) => applyTheme((e.target as HTMLSelectElement).value)}
        class="rounded-md border border-border-input bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="auto">System</option>
    </select>
</div>
