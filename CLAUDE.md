# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

BarkBook is a pet hotel management system. This repo is the React front end and is currently the unmodified Vite + React template (`src/App.jsx` is still the starter page): no router, state library, HTTP client, or test framework has been added yet. The back end lives in a sibling repo, `C:\Programs\VSCode\BarkBook-BackEnd` (Express 5 + Sequelize/PostgreSQL + Redis + Stripe, CommonJS).

## Commands

```bash
npm run dev       # Vite dev server on http://localhost:5173
npm run build     # production build to dist/
npm run lint      # ESLint (flat config: js recommended + react-hooks + react-refresh)
npm run preview   # serve the built dist/
```

No test runner is configured.

Back end (run from `BarkBook-BackEnd`): `npm start` serves the API on `http://localhost:3000/api`. It needs PostgreSQL and Redis per its `.env.development`. `npm run create:admin` creates an admin user.

## Stack

- React 19, Vite 8 with `@vitejs/plugin-react` (Oxc), plain JavaScript/JSX (no TypeScript), ES modules.
- React Compiler is not enabled.

## Integrating with the back end

The API contract is documented in `BarkBook-BackEnd/docs/API.md`, written in Spanish. When the doc and the code disagree, the back-end code wins: check DTOs in `app/modules/*/DTOs` and routes in `app/modules/*/*.routes.js`. Key points that shape front-end architecture:

- **CORS/credentials:** every request must use `credentials: 'include'` (fetch) or `withCredentials: true` (axios), because the refresh token is an httpOnly cookie. Allowed origins come from the back end's `CORS_ORIGIN` env var, which defaults to `http://localhost:5173`. Keep the dev server on that port.
- **Auth flow:** `POST /auth/signin` returns an `accessToken` in the body and sets the `refreshToken` cookie. Send `Authorization: Bearer <accessToken>` on each request. Access tokens last 15 minutes. On a 401 (`flag: UNAUTHENTICATED`), call `POST /auth/refresh` (no body), then retry the original request. If the refresh fails, go to login. Keep the access token **in memory, not localStorage**, and call `/auth/refresh` on page load to restore the session.
- **Session data:** the JWT payload lacks `uid`, `customerId`, employee id, and permissions. Call `GET /auth/me` after login and after a reload. It returns `user`, `customer`, `employee`, and `permissions`. Show or hide UI based on `permissions` (strings in Spanish, such as `"Gestionar mascotas"`), not on `roleName`, because the admin can edit what each role is allowed to do.
- **Customer profile gate:** new sign-ups have `profileCompleted: false` and must `POST /customers` before they can use other customer endpoints, which return 403 until then. That response includes a **new access token**, and the client must replace the old one with it.
- **Response shape:** success is `{ success, status, message, <resource> }`. The payload key is singular for one record (`pet`) and plural for lists (`pets`). Validation errors (400) include `details: [{ field, message }]` with dot-path fields such as `pets.0.nonadmissionReason`, so they can be shown next to each form field. Business errors carry a `flag` (`RESOURCE_CONFLICT`, `UNAUTHORIZED_ACCESS`, …). Server messages are in Spanish and meant to be shown to users.
- **Ownership:** users with the `Cliente` role can only reach their own resources. Global lists (`GET /pets`, `/customers`, …) are blocked for them, so customer-facing screens must use the filtered routes (e.g. `/pets/customer/:customerId`).
- **Enums and formats:** the API takes exact Spanish enum strings (e.g. `RESERVA PENDIENTE DE CONFIRMAR`, `PEQUENIO`). Section 7 of API.md lists them all. Dates are `YYYY-MM-DD`, phone numbers are `+502` followed by 8 digits, and amounts are in GTQ. All `DELETE`s are soft deletes and have a matching `PATCH /:id/restore`.
- **Booking lifecycle:** pending → confirmed (payment) → `EN ESTANCIA` (check-in) → charges/payments → `FINALIZADA` (check-out, room goes to cleaning). See section 6 of API.md.
- **Known gaps:** there is no file-upload endpoint, so image fields are text references only. Reports, medication, and feeding have permissions defined but no endpoints yet.

## Conventions

The back end's user-facing text and code comments are in Spanish. Follow the same language for UI copy.

## Contrato del backend
Toda llamada a la API debe seguir lo documentado aquí (endpoints, DTOs, códigos de error, permisos):
@../BarkBook-BackEnd/docs/API.md