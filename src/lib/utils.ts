export const ApiUrl = import.meta.env.VITE_API_URL

export function GetAuthToken(): string | null {
    const cookies = document.cookie.split(';').reduce((acc, c) => {
        const [key, value] = c.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);
    return cookies.authToken || null;
}