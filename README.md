# Playwright API and Mocking Tests

This project is demo for testing a real-world API and simulating API responses using mocks. All tests are written in JavaScript using the Playwright framework.

## Requirements

-   Node.js (v18 or higher)
-   npm

## Useful links

-   [Playwright Documentation](https://playwright.dev/)
-   [Node.js](https://nodejs.org/en)

## Test Suites Description

### `demoqa.account.api.spec.js`

This file contains end-to-end tests for the live **DemoQA Account API**. The tests are split into two main suites:

* **Successful User Lifecycle (`describe.serial`)**
    * This suite tests the complete "happy path" flow in a specific, sequential order to ensure the user lifecycle works as expected.
    1.  `POST /Account/v1/User`: Creates a new user with valid data.
    2.  `POST /Account/v1/GenerateToken`: Generates a token for the newly created user.
    3.  `GET /Account/v1/User/{UUID}`: Retrieves the user's data using the token.
    4.  `DELETE /Account/v1/User/{UUID}`: Deletes the user to clean up the state.

* **Negative Scenarios (`describe`)**
    * This suite contains independent tests for various error conditions, running in parallel.
    * It covers scenarios like:
        * Attempting to create a user with invalid data (e.g., an empty password).
        * Attempting to generate a token with an incorrect password.
        * Attempting to get and delete a user with a non-existent UUID.

### `user-profile.mock.spec.js`

This file demonstrates API mocking capabilities. **These tests do not send any real network requests.** Instead, they intercept requests and provide predefined responses to test the application's behavior.

* **Successful Response Test:**
    * Mocks a `200 OK` response for a `GET /users/1` request.
    * Validates that the structure and data of the returned user object are correct according to the specification.

* **Error Response Test:**
    * Mocks a `404 Not Found` error response for a request to a non-existent user.
    * Validates the structure of the error object (e.g., presence of `error` and `details` fields).

* **Various Status Codes Test:**
    * Simulates multiple other HTTP statuses (`204 No Content`, `403 Forbidden`, `502 Bad Gateway`) to verify that different server responses can be handled correctly.


### Installation & Execution

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Maziksa/api-tests.git
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Run the tests:**
    ```sh
    npm run test


##  Project Structure

```
/
├── demoqa.account.api.spec.js   # Tests for the DemoQA API
├── user-profile.mock.spec.js  # Tests with API mocking
├── package.json               # Project settings and dependencies
├── package-lock.json          # Exact versions of all dependencies
└── README.md
```