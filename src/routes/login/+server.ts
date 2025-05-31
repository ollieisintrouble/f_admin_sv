import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { apiUrl } from '$lib/utils';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
        return json({ message: 'Missing username or password' }, { status: 400 });
    }

    const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    });

    if (response.ok) {
        const setCookie = response.headers.get('Set-Cookie');
        if (setCookie) {
            const match = setCookie.match(/authToken=([^;]+)/);
            if (match && match[1]) {
                const token = match[1].trim();
                cookies.set('authToken', token, {
                    httpOnly: true,
                    secure: true,
                    path: '/',
                    encode: (value) => value
                });
            } else {
                return json({ message: 'Invalid cookie format' }, { status: 500 });
            }
        } else {
            return json({ message: 'No cookie received' }, { status: 500 });
        }
        throw redirect(303, '/');
    }

    return json({ message: 'Invalid credentials' }, { status: 401 });
};