# Secure-User-Authentication-and-Account-Management-API


[![CI/CD Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=github)](https://github.com/your-username/your-repo/actions)
[![Language](https://img.shields.io/badge/language-Node.js-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/database-MongoDB-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Nodemailer](https://img.shields.io/npm/v/nodemailer?style=for-the-badge&logo=npm&label=Nodemailer&color=333)](https://www.npmjs.com/package/nodemailer)
[![Mailtrap](https://img.shields.io/badge/Mailtrap-Email%20Testing-25C6D8?style=for-the-badge&logo=Mailtrap)](https://mailtrap.io/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io/)
[![Bcrypt](https://img.shields.io/badge/Bcrypt-Hashing-624098?style=for-the-badge)](https://www.npmjs.com/package/bcrypt)


An enterprise-ready, secure-by-design authentication and authorization API built with a modern stack. This backend system provides a complete, battle-tested solution for user management, from registration to secure password resets, all secured by a state-of-the-art JWT and refresh token strategy.

---

## 📖 Table of Contents

* [✨ Philosophy & Key Features](#-philosophy--key-features)
* [🛡️ Security & Authentication Flow](#️-security--authentication-flow)
* [🛠️ Tech Stack](#️-tech-stack)
* [🏁 Getting Started](#-getting-started)
* [⚙️ Environment Configuration](#️-environment-configuration)
* [🔬 API Endpoints Deep-Dive](#-api-endpoints-deep-dive)
* [🚀 Live Showcase (Postman)](#-live-showcase-postman)
* [🤝 Contributing](#-contributing)

---

## ✨ Philosophy & Key Features

This isn't just another login system. It's built on a philosophy of **security first, developer-friendly second**.

* **Stateful Security, Stateless Scalability:** Implements a `JWT Access Token` + `HTTP-Only Cookie Refresh Token` strategy. This gives you the speed and scalability of stateless JWTs while retaining the ability to revoke sessions (by invalidating the refresh token), offering the best of both worlds.
* **Proactive Validation:** Utilizes `express-validator` to create a strict validation layer. Malicious or malformed requests are rejected at the door, *before* they ever touch your business logic.
* **Secure Password Handling:** All passwords are hashed using `bcrypt`, the industry standard. No plaintext passwords ever cross the network or touch the database.
* **Complete User Lifecycle Management:**
    * Secure Registration & Login
    * Email Verification Flow (In Progress)
    * Secure "Forgot Password" & "Reset Password" Flow
    * Authenticated-Only "Change Password"
* **Clean Code Architecture:** Built with a modular, scalable structure (MVC-like) that separates routes, controllers, models, and middleware for easy maintenance and testing.

---

## 🛡️ Security & Authentication Flow

Understanding the security model is key to using this API. The system uses two types of tokens:

1.  **Access Token (JWT):** A short-lived (e.g., 15 minutes) token sent in the `Authorization` header. This token is used to access protected routes. Its short life minimizes the risk if it's ever compromised.
2.  **Refresh Token:** A long-lived (e.g., 7 days) token stored in a secure, `HttpOnly` cookie. This token's *only* job is to contact the `/refresh-token` endpoint to get a new Access Token. It is inaccessible to JavaScript, which prevents XSS attacks.



### The Flow:
1.  User calls `POST /login` with email/password.
2.  Server verifies credentials, generates an **Access Token** and a **Refresh Token**.
3.  The Access Token is returned in the JSON response. The Refresh Token is set in an `HttpOnly` cookie.
4.  Client stores the Access Token (e.g., in memory) and attaches it as a `Bearer` token for all future protected requests.
5.  When the Access Token expires, the client gets a `401 Unauthorized`.
6.  The client then calls `POST /refresh-token` (with no body; the cookie is sent automatically).
7.  The server verifies the Refresh Token and issues a *new* Access Token.
8.  The client retries the original failed request with the new token.

---

## 🛠️ Tech Stack

This project uses a curated set of modern, production-ready technologies.

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Core** | [Node.js](https://nodejs.org/) | Event-driven, non-blocking I/O runtime |
| **Framework** | [Express.js](https://expressjs.com/) | Fast, unopinionated web framework |
| **Database** | [MongoDB](https://www.mongodb.com/) | NoSQL database for scalability |
| **ODM** | [Mongoose](https://mongoosejs.com/) | Elegant object data modeling for Mongo |
| **Security** | [JSON Web Token](https://jwt.io/) | Secure token-based authentication |
| **Security** | [Bcrypt](https://www.npmjs.com/package/bcrypt) | Password hashing & verification |
| **Validation** | [Express-Validator](https://express-validator.github.io/docs/) | Server-side validation middleware |
| **Email** | [Nodemailer](https://nodemailer.com/) | Sending emails (for password reset, etc.) |
| **Email Testing** | [MailTrap](https://mailtrap.com/) | Check & testing of emails in sandbox  |
| **Helpers** | [Cookie-Parser](https://www.npmjs.com/package/cookie-parser) | Handling `HttpOnly` refresh tokens |

---

## 🏁 Getting Started

### Prerequisites

* Node.js (v18.x or higher)
* NPM / Yarn
* MongoDB (local instance or an [Atlas](https://www.mongodb.com/cloud/atlas) cluster)
* Postman (for testing)

### Local Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/your-repo.git](https://github.com/your-username/your-repo.git)
    cd your-repo
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Configure your environment:**
    Create a `.env` file in the root. Copy the contents from `.env.example` and fill in your values. (See details below).
4.  **Run the server:**
    ```sh
    npm run dev
    ```
    The API will be live at `http://localhost:8000` (or your configured port).

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root. **Never commit this file.**

```dotenv
# .env.example
# --- Server Config ---
PORT=8000

# --- Database Config ---
MONGODB_URI=your_mongodb_connection_string

# --- Security & Token Config ---
# Use strong, random strings for these
ACCESS_TOKEN_SECRET=a_very_strong_secret_for_access_token
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=a_different_very_strong_secret_for_refresh_token
REFRESH_TOKEN_EXPIRY=7d

# These are for the email verification & password reset flows
VERIFICATION_TOKEN_SECRET=a_secret_for_email_verification
VERIFICATION_TOKEN_EXPIRY=1d
RESET_TOKEN_SECRET=a_secret_for_password_reset
RESET_TOKEN_EXPIRY=1h

# --- Email Service Config (e.g., Mailtrap, SendGrid) ---
MAIL_HOST=your_smtp_host
MAIL_PORT=your_smtp_port
MAIL_USER=your_smtp_username
MAIL_PASS=your_smtp_password
```
---
## 🔬 API Endpoints Deep-Dive


- **All endpoints are prefixed with /api/v1.** 



| Method | Endpoint | Security | Description | Status |
|--------|----------|---------|-------------|--------|
| POST   | /register | Validation: userRegisterValidator | Register a new user account. | ✅ Live |
| POST   | /login | Validation: userLoginValidator | Log in a user and receive tokens. | ✅ Live |
| POST   | /refresh-token | HttpOnly Cookie required | Get a new Access Token. | ✅ Live |
| POST   | /forgot-password | Validation: userForgotPasswordValidator | Send a password reset email. | ✅ Live |
| GET    | /verify-email/:vToken | Token Check | Verify a user's email address. | ⏳ Planned |
| POST   | /reset-password/:rToken | Validation: userResetForgotPasswordValidator | Set a new password. | ⏳ Planned |

---

These routes require a valid Authorization: Bearer <accessToken> header and are first processed by the verifyJWT middleware.
---



| Method | Endpoint | Security | Description |
|--------|----------|---------|-------------|
| POST   | /logout | verifyJWT, HttpOnly Cookie | Log out user (invalidates refresh token). |
| POST   | /current-user | verifyJWT | Get profile of the currently logged-in user. |
| POST   | /change-password | verifyJWT, userResetForgotPasswordValidator | Allow logged-in user to change their password. |
| POST   | /resend-email-verification | verifyJWT | Resend the email verification link. |

---
## 🚀 Live Showcase (Postman)

**This isn't just a list of features; it's tangible proof of the API's security, validation, and functionality. The system is tested from the simplest health check to the multi-step secure authentication flow.**

[Click here to download the Postman Collection & Environment] (Link your exported .json files)

- ### Proof 1: API Health & Response Structure
Before any logic, we confirm the server is online and see its standard response format.

**Example:** `GET /api/v1/healthcheck`
> A simple request to the health check endpoint. This confirms the server is running and shows the consistent JSON response wrapper (`statusCode`, `data`, `message`, `success`) that is used for *all* API responses.
>
> ![API HealthCheck](/.github/images/postman-healthcheck.png)

- ### Proof 2: Server-Side Input Validation
This API is secure-by-design. It rejects invalid data before it ever touches the database or controllers.
**Example:** `POST /api/v1/auth/register  (400 Bad Request)`
> A POST /register request with an invalid email and a short password. The API correctly returns a 400 Bad Request with a clear, array-based error message, as defined in the userRegisterValidator.
>
> ![API HealthCheck](/.github/images/postman-healthcheck.png)
- ### Proof 3: The Complete Authentication Flow (JWT)
This sequence demonstrates the core security model: Login, access a protected route, and Logout.
- Step 1: Login & Token Generation
A successful POST /login with correct credentials. The Tests tab in Postman (not shown) would capture the accessToken and save it to an environment variable for the next requests. The refreshToken is automatically set as a secure HttpOnly cookie.

- Step 2: Accessing a Protected Route (The verifyJWT test)
Access Denied (No Token): An attempt to access GET /current-user without the Authorization: Bearer <token> header. The verifyJWT middleware correctly intercepts and returns a 401 Unauthorized.

Access Granted (With Token): The same request, now with the accessToken automatically added. The request succeeds and returns the user's profile.

- Step 3: Logout & Token Invalidation
A POST /logout request. The server's verifyJWT middleware first confirms the user is valid, then the controller clears the HttpOnly refresh token cookie, securely ending the session.
>
> ![API HealthCheck](/.github/images/postman-healthcheck.png)

- ### Proof 4: Secure Password Management
This demonstrates the multi-step "Forgot Password" flow, which relies on secure, short-lived tokens.

**Example:** `POST /forgot-password`
> A user provides their email. The API generates a unique, single-use reset token, saves its hash to the database, and emails the user a reset link (not shown).
**Example:** `POST /change-password`
> This demonstrates an authenticated user changing their own password. They must provide their old password and a new one. This proves the verifyJWT middleware is active on this route as well.
>
> ![API HealthCheck](/.github/images/postman-healthcheck.png)
