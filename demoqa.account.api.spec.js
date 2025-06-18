const { test, expect } = require('@playwright/test');

const baseURL = 'https://demoqa.com';

test.describe.serial('API DemoQA: Successful User Lifecycle', () => {
    let userID;
    let token;

    const randomSuffix = Math.random().toString(36).substring(2);
    const userName = `testuser_${randomSuffix}`;
    const password = `Password_123!`;

    test('Positive test: Create a user with valid data', async ({ request }) => {
        const response = await request.post(`${baseURL}/Account/v1/User`, {
            data: { userName, password },
        });
        expect(response.status()).toBe(201);
        const responseBody = await response.json();
        expect(responseBody.userID).toBeDefined();
        userID = responseBody.userID;
    });

    test('Positive test: Generate a token for an existing user', async ({ request }) => {
        const response = await request.post(`${baseURL}/Account/v1/GenerateToken`, {
            data: { userName, password },
        });
        expect(response.ok()).toBeTruthy();
        const responseBody = await response.json();
        expect(responseBody.token).toBeDefined();
        token = responseBody.token;
    });

    test('Positive test: Get user information for an existing user', async ({ request }) => {
        const response = await request.get(`${baseURL}/Account/v1/User/${userID}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        expect(response.ok()).toBeTruthy();
        const responseBody = await response.json();
        expect(responseBody.userId).toBe(userID);
    });

    test('Positive test: Delete an existing user', async ({ request }) => {
        const response = await request.delete(`${baseURL}/Account/v1/User/${userID}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        expect(response.status()).toBe(204);
    });
});

test.describe('API DemoQA: Negative Scenarios', () => {

    test('Negative test: Attempt to create a user with an empty password', async ({ request }) => {
        const response = await request.post(`${baseURL}/Account/v1/User`, {
            data: {
                userName: `invalid_user_${Math.random().toString(36).substring(2)}`,
                password: '',
            },
        });
        expect(response.status()).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.code).toBe('1200');
        expect(responseBody.message).toBe('UserName and Password required.');
    });

    test('Negative test: Attempt to generate a token with an incorrect password', async ({ request }) => {
        const randomSuffix = Math.random().toString(36).substring(2);
        const userName = `testuser_neg_${randomSuffix}`;
        const password = `Password_123!`;
        await request.post(`${baseURL}/Account/v1/User`, { data: { userName, password } });

        const response = await request.post(`${baseURL}/Account/v1/GenerateToken`, {
            data: {
                userName: userName,
                password: 'WrongPassword123!',
            },
        });

        expect(response.ok()).toBeTruthy();
        const responseBody = await response.json();
        expect(responseBody.status).toBe('Failed');
        expect(responseBody.result).toBe('User authorization failed.');
    });

    test('Negative test: Attempt to get or delete a non-existent user', async ({ request }) => {
        const randomSuffix = Math.random().toString(36).substring(2);
        const userName = `testuser_tokenholder_${randomSuffix}`;
        const password = `Password_123!`;
        await request.post(`${baseURL}/Account/v1/User`, { data: { userName, password } });
        const tokenResponse = await request.post(`${baseURL}/Account/v1/GenerateToken`, { data: { userName, password } });
        const token = (await tokenResponse.json()).token;

        const fakeUserID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

        const getResponse = await request.get(`${baseURL}/Account/v1/User/${fakeUserID}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        expect(getResponse.status()).toBe(401);
        expect(await getResponse.json()).toHaveProperty('message', 'User not found!');

        const deleteResponse = await request.delete(`${baseURL}/Account/v1/User/${fakeUserID}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        expect(deleteResponse.status()).toBe(200);
        expect(await deleteResponse.json()).toHaveProperty('message', 'User Id not correct!');
    });
});