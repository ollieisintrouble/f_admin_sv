import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { ApiUrl } from '$lib/utils';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
        return json({ message: 'Missing username or password' }, { status: 400 });
    }

    const response = await fetch(`${ApiUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const { token } = await response.json();
        if (token) {
            cookies.set('authToken', token, {
                httpOnly: false,
                secure: true,
                path: '/',
                sameSite: 'none',
            })
            return json({ token });
        } else {
            return json({ message: 'No cookie received' }, { status: 500 });
        }
    } else { return json({ message: 'Invalid credentials' }, { status: 400 }); }
};