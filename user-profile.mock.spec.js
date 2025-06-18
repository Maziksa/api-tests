const { test, expect } = require('@playwright/test');

const apiEndpoint = 'https://api.example.com/users/';

const successfulUserData = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    username: 'johndoe',
    phone: '+1-555-123-4567',
    address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipcode: '10001',
        country: 'USA'
    },
    company: {
        name: 'Doe Enterprises',
        industry: 'Technology',
        position: 'Software Engineer'
    },
    dob: '1990-05-15',
    profile_picture_url: 'https://example.com/images/johndoe.jpg',
    is_active: true,
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-10-01T12:00:00Z',
    preferences: {
        language: 'en',
        timezone: 'America/New_York',
        notifications_enabled: true
    }
};

const errorResponseData = {
    error: "Not Found",
    details: "User with ID 999 not found."
};

test.describe('API Mocking for /users/:id', () => {

    test('Validate the structure of a successful response (200 OK)', async ({ page }) => {
        await page.route(`${apiEndpoint}1`, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(successfulUserData),
            });
        });

        const response = await page.evaluate(async (url) => {
            const fetchResponse = await fetch(url);
            return {
                status: fetchResponse.status,
                data: await fetchResponse.json()
            };
        }, `${apiEndpoint}1`);

        expect(response.status).toBe(200);
        expect(response.data.id).toBe(1);
        expect(typeof response.data.name).toBe('string');
        expect(response.data.name).toBe('John Doe');
        expect(typeof response.data.email).toBe('string');
        expect(response.data.address.city).toBe('New York');
        expect(typeof response.data.is_active).toBe('boolean');
        expect(response.data).toEqual(successfulUserData);
    });

    test('Validate the structure of an error response (404 Not Found)', async ({ page }) => {
        await page.route(`${apiEndpoint}999`, async route => {
            await route.fulfill({
                status: 404,
                contentType: 'application/json',
                body: JSON.stringify(errorResponseData),
            });
        });

        const response = await page.evaluate(async (url) => {
            const fetchResponse = await fetch(url);
            return {
                status: fetchResponse.status,
                data: await fetchResponse.json()
            };
        }, `${apiEndpoint}999`);

        expect(response.status).toBe(404);
        expect(response.data.error).toBe('Not Found');
        expect(response.data.details).toBeDefined();
        expect(response.data).toEqual(errorResponseData);
    });

    test('Simulate and verify various status codes', async ({ page }) => {
        await page.route(`${apiEndpoint}204`, route => route.fulfill({ status: 204 }));
        const status204 = await page.evaluate(url => fetch(url).then(r => r.status), `${apiEndpoint}204`);
        expect(status204).toBe(204);

        await page.route(`${apiEndpoint}403`, route => route.fulfill({ status: 403, contentType: 'application/json', body: '{"error": "Forbidden"}' }));
        const response403 = await page.evaluate(async url => ({ status: (await fetch(url)).status, data: await (await fetch(url)).json() }), `${apiEndpoint}403`);
        expect(response403.status).toBe(403);
        expect(response403.data.error).toBe("Forbidden");

        await page.route(`${apiEndpoint}502`, route => route.fulfill({ status: 502, contentType: 'application/json', body: '{"error": "Bad Gateway"}' }));
        const status502 = await page.evaluate(url => fetch(url).then(r => r.status), `${apiEndpoint}502`);
        expect(status502).toBe(502);
    });
});