<script lang="ts">
    import { onMount } from "svelte";

    // Available themes
    const themes = [
        { value: "light", label: "☀️ Light", category: "default" },
        { value: "dark", label: "🌙 Dark", category: "default" },
        { value: "fire-light", label: "🔥 Fire Light", category: "fire" },
        { value: "fire-dark", label: "🔥 Fire Dark", category: "fire" },
        { value: "water-light", label: "💧 Water Light", category: "water" },
        { value: "water-dark", label: "💧 Water Dark", category: "water" },
        { value: "forest-light", label: "🌲 Forest Light", category: "forest" },
        { value: "forest-dark", label: "🌲 Forest Dark", category: "forest" },
    ];

    // Current theme state
    let currentTheme = $state("light");
    let dropdownOpen = $state(false);

    // Apply theme function
    function applyTheme(theme: string) {
        const html = document.documentElement;

        // Remove all theme classes
        const themeClasses = themes.map((t) => t.value);
        html.classList.remove(...themeClasses);

        // Apply new theme class (except for 'light' which is default)
        if (theme !== "light") {
            html.classList.add(theme);
        }

        // Store preference
        localStorage.setItem("theme", theme);
        currentTheme = theme;
        dropdownOpen = false;
    }

    // Get current theme label
    function getCurrentThemeLabel() {
        const theme = themes.find((t) => t.value === currentTheme);
        return theme ? theme.label : "☀️ Light";
    }

    // Group themes by category
    function getThemesByCategory() {
        const grouped: Record<string, (typeof themes)[0][]> = {};
        themes.forEach((theme) => {
            if (!grouped[theme.category]) {
                grouped[theme.category] = [];
            }
            grouped[theme.category].push(theme);
        });
        return grouped;
    }

    // Initialize theme on mount
    onMount(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        applyTheme(savedTheme);

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest(".theme-switcher")) {
                dropdownOpen = false;
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    });

    const categoryLabels = {
        default: "Default",
        fire: "Fire Themes",
        water: "Water Themes",
        forest: "Forest Themes",
    };
</script>

<div class="theme-switcher relative inline-block text-left">
    <!-- Trigger Button -->
    <button
        onclick={() => (dropdownOpen = !dropdownOpen)}
        class="inline-flex w-full justify-between items-center rounded-md border border-border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-btn hover:bg-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors"
        type="button"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
    >
        <span>{getCurrentThemeLabel()}</span>
        <svg
            class="ml-2 h-4 w-4 transition-transform duration-200 {dropdownOpen
                ? 'rotate-180'
                : ''}"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
            />
        </svg>
    </button>

    <!-- Dropdown Menu -->
    {#if dropdownOpen}
        <div
            class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-background border border-border-card shadow-popover ring-1 ring-black/5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            tabindex="-1"
        >
            <div class="py-1 max-h-96 overflow-y-auto">
                {#each Object.entries(getThemesByCategory()) as [category, categoryThemes]}
                    <div class="px-3 py-2">
                        <h3
                            class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1"
                        >
                            {categoryLabels[
                                category as keyof typeof categoryLabels
                            ]}
                        </h3>
                        {#each categoryThemes as theme}
                            <button
                                onclick={() => applyTheme(theme.value)}
                                class="group flex w-full items-center rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted transition-colors {currentTheme ===
                                theme.value
                                    ? 'bg-accent text-accent-foreground'
                                    : ''}"
                                role="menuitem"
                                tabindex="-1"
                            >
                                {theme.label}
                                {#if currentTheme === theme.value}
                                    <svg
                                        class="ml-auto h-4 w-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                {/if}
                            </button>
                        {/each}
                    </div>
                    {#if category !== "forest"}
                        <div class="border-t border-border-card my-1"></div>
                    {/if}
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    /* Custom scrollbar for the dropdown */
    .max-h-96::-webkit-scrollbar {
        width: 6px;
    }

    .max-h-96::-webkit-scrollbar-track {
        background: hsl(var(--muted));
    }

    .max-h-96::-webkit-scrollbar-thumb {
        background: hsl(var(--muted-foreground));
        border-radius: 3px;
    }

    .max-h-96::-webkit-scrollbar-thumb:hover {
        background: hsl(var(--foreground-alt));
    }
</style>
