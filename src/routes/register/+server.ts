import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
    console.log('POST /register reached');
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
        console.log("form data missing")
        return json({ message: 'Missing username or password' }, { status: 400 });
    }

    const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    });

    console.log('Go API response status:', response.status);
    console.log('Go API response headers:', [...response.headers.entries()]);

    if (response.ok) {
        const setCookie = response.headers.get('Set-Cookie');
        console.log('Set-Cookie header:', setCookie);
        if (setCookie) {
            const match = setCookie.match(/authToken=([^;]+)/);
            if (match && match[1]) {
                const token = match[1].trim();
                console.log('Setting cookie with value:', token);
                cookies.set('authToken', token, {
                    httpOnly: true,
                    secure: false,
                    path: '/',
                    encode: (value) => value
                });
            } else {
                console.log('No valid authToken cookie found');
                return json({ message: 'Invalid cookie format' }, { status: 500 });
            }
        } else {
            console.log('No Set-Cookie header');
            return json({ message: 'No cookie received' }, { status: 500 });
        }
        console.log('Redirecting to /');
        throw redirect(303, '/');
    }

    console.log("fetch fail")
    return json({ message: 'Invalid credentials' }, { status: 401 });
};