export const ApiUrl = import.meta.env.VITE_API_URL

export function GetAuthToken(): string | null {
    const cookies = document.cookie.split(';').reduce((acc, c) => {
        const index = c.indexOf('=');
        if (index === -1) return acc;

        const key = c.slice(0, index).trim();
        const value = c.slice(index + 1);
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    return cookies.authToken || null;
}