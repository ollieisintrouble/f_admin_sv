import { redirect } from '@sveltejs/kit'
import { TokenExpired } from '$lib/session/session';
import type { Handle } from '@sveltejs/kit';
import { apiUrl } from '$lib/utils';

export const handle: Handle = async ({ event, resolve }) => {
    const token = event.cookies.get('authToken');
    const currentRoute = event.url.pathname;
    const publicRoutes = ['/login', '/register', '/neworg', 'payment', 'error'];

    if (!token && !publicRoutes.includes(currentRoute)) {
        throw redirect(303, '/login');
    }

    if (token && TokenExpired(token as string) === true) {
        event.cookies.delete('authToken', { path: '/' })
        throw redirect(303, '/login');
    }

    if (token) {
        const response = await fetch(`${apiUrl}/api/valtok`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            credentials: 'include'
        })

        if (response.ok) {
            const result = await response.json();
            event.locals.user = result.user
            event.locals.orgs = result.orgs
            event.locals.memberships = result.memberships
        } else if (response.status === 400) {
            event.cookies.delete('authToken', { path: '/' })
            if (currentRoute !== "/login") {
                throw redirect(303, "/login");
            }
        } else if (response.status === 404) {
            event.cookies.delete('authToken', { path: '/' })
            if (currentRoute !== "/register") {
                throw redirect(303, "/register");
            }
        } else if (response.status === 406) {
            if (currentRoute !== "/neworg") {
                throw redirect(303, "/neworg");
            }
        } else if (response.status === 402) {
            if (currentRoute !== "/payment") {
                throw redirect(303, "/payment");
            }
        } else {
            event.cookies.delete('authToken', { path: '/' })
            if (currentRoute !== "/error") {
                throw redirect(303, "/error");
            }
        }
    }

    return resolve(event);
}