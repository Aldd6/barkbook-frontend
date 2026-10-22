# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

BarkBook is a pet hotel management system (brand: Guau & Miau Club). This repo is the React front end, built in phases (base → auth → cliente → recepción → operación → administración). No test framework has been added. The back end lives in a sibling repo, `C:\Programs\VSCode\BarkBook-BackEnd` (Express 5 + Sequelize/PostgreSQL + Redis + Stripe, CommonJS).

Layout of `src/`:
- `api/` — `client.js` is the single axios instance (base URL from `VITE_API_URL`, `withCredentials`, Bearer interceptor, deduplicated `/auth/refresh` on 401 with one retry). Errors are normalized to `ApiError { status, flag, message, details, fieldErrors }` (`errors.js`). One module per resource: queries return the payload key (`r.data.pet`); mutations return the whole body so screens can show the API `message` in a toast (`useToast`).
- `hooks/` — `useApiQuery(fetcher)` (memoize the fetcher with `useCallback`; returns `{ data, error, loading, reload }`, render with `<QueryState>`), `useForm` (local validation + API `details[]` per field), `useRoomCatalog` (branches/room types/room branches to resolve a booking's `branchRoomId`).
- `payments/` — Stripe Elements: wrap the form in `<StripeProvider>`, render `<CardField>`, call `useCardPayment().createPaymentMethodId()` and send it as `stripePaymentMethodId`.
- Customer screens ("Mi cuenta") sit behind `RequireCustomer` and nav items with `requiresCustomer`, since they call the routes filtered by `customer.id`.
- `auth/` — `AuthProvider` keeps the access token in memory and `user/customer/employee/permissions` from `/auth/me`; route guards (`RequireAuth`, `RequireProfile`, `RequirePermission`, `GuestOnly`). Use `hasPermission()` for UI decisions; the Administrador passes every check, as in the back end.
- `constants/` — exact API enums (`enums.js`, with `*_OPTIONS` for selects) and permission names (`permissions.js`).
- `utils/` — form validators matching the back-end DTOs, and formatters (GTQ, dates).
- `layout/` (CoreUI sidebar/header), `nav/_nav.js` (menu items declare their required permission), `components/`, `views/`, `routes.jsx`.

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
- CoreUI 5 (`@coreui/react`, `@coreui/icons-react`) without Sass: the brand palette overrides CoreUI CSS variables in `src/styles/theme.css`. Routing with `react-router-dom`, HTTP with `axios`, global state with React Context (no Redux).
- Env vars (`.env.example`): `VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`.
- In this Windows setup, run npm scripts from PowerShell; Git Bash can't find `node`.

## Integrating with the back end

The API contract is documented in `BarkBook-BackEnd/docs/API.md`, written in Spanish. When the doc and the code disagree, the back-end code wins: check DTOs in `app/modules/*/DTOs` and routes in `app/modules/*/*.routes.js`. Key points that shape front-end architecture:

- **CORS/credentials:** every request must use `credentials: 'include'` (fetch) or `withCredentials: true` (axios), because the refresh token is an httpOnly cookie. Allowed origins come from the back end's `CORS_ORIGIN` env var, which defaults to `http://localhost:5173`. Keep the dev server on that port.
- **Auth flow:** `POST /auth/signin` returns an `accessToken` in the body and sets the `refreshToken` cookie. Send `Authorization: Bearer <accessToken>` on each request. Access tokens last 15 minutes. On a 401 (`flag: UNAUTHENTICATED`), call `POST /auth/refresh` (no body), then retry the original request. If the refresh fails, go to login. Keep the access token **in memory, not localStorage**, and call `/auth/refresh` on page load to restore the session.
- **Session data:** the JWT payload lacks `uid`, `customerId`, employee id, and permissions. Call `GET /auth/me` after login and after a reload. It returns `user`, `customer`, `employee`, and `permissions`. Show or hide UI based on `permissions` (strings in Spanish, such as `"Gestionar mascotas"`), not on `roleName`, because the admin can edit what each role is allowed to do.
- **Customer profile gate:** new sign-ups have `profileCompleted: false` and must `POST /customers` before they can use other customer endpoints, which return 403 until then. That response includes a **new access token**, and the client must replace the old one with it.
- **Response shape:** success is `{ success, status, message, <resource> }`. The payload key is singular for one record (`pet`) and plural for lists (`pets`). Validation errors (400) include `details: [{ field, message }]` with dot-path fields such as `pets.0.nonadmissionReason`, so they can be shown next to each form field. Business errors carry a `flag` (`RESOURCE_CONFLICT`, `UNAUTHORIZED_ACCESS`, …). Server messages are in Spanish and meant to be shown to users.
- **Ownership:** users with the `Cliente` role can only reach their own resources. Global lists (`GET /pets`, `/customers`, …) are blocked for them, so customer-facing screens must use the filtered routes (e.g. `/pets/customer/:customerId`).
- **Enums and formats:** the API takes exact Spanish enum strings (e.g. `RESERVA PENDIENTE DE CONFIRMAR`, `PEQUENIO`). Section 7 of API.md lists them all. Dates are `YYYY-MM-DD`, phone numbers are `+502` followed by 8 digits, and amounts are in GTQ. All `DELETE`s are soft deletes and have a matching `PATCH /:id/restore`.
- **Booking lifecycle:** pending → confirmed (payment) → `EN ESTANCIA` (check-in) → service orders (the customer orders, a caregiver of the branch completes it and only then is the `CARGO` posted) → `FINALIZADA` (check-out, room goes to cleaning). Before check-in, the customer can request a cancellation (`/booking-cancellations`), which a receptionist of the booking's branch approves (cancel + refunds) or rejects. See section 6 of API.md.
- **Files (S3):** photos and the vaccination card go through `PUT`/`DELETE` on `.../profile-picture` and `.../vaccination-card` (multipart, field `file`, max 5 MB), never in create/update bodies. Use `putFile`/`deleteFile` from `api/files.js` (they override the client's JSON Content-Type) and the `<FileUpload>` / `<Avatar>` components. Responses carry signed URLs that expire in 1 hour: render them directly and don't store them.
- **Known gaps:** reports, medication, and feeding have permissions defined but no endpoints yet.

## Conventions

The back end's user-facing text and code comments are in Spanish. Follow the same language for UI copy.

## Contrato del backend
Toda llamada a la API debe seguir lo documentado aquí (endpoints, DTOs, códigos de error, permisos):
@../BarkBook-BackEnd/docs/API.md