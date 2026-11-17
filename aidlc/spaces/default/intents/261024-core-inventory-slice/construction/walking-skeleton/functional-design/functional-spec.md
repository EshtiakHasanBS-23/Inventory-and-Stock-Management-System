# Functional Specification — walking-skeleton

Behaviour of the identity module and the app shell as built (`apps/api/src/modules/identity`, `apps/web/src/session`, `apps/web/src/layouts`): sign-up, sign-in, sign-out, sessions, staff and passwords (US-01 to US-04; FR-1 to FR-5). Data shapes are in `entities.md`; decision logic in `rules.md`. The stock module is specified in `construction/backend/functional-design/`.

## Scope of This Unit's Checks

The walking skeleton was the first slice built: sign-up, sign-in, sign-out, the signed-in landing page, password hashing and the theme switch, started with Docker Compose and checked by `npm run verify`. Staff management (WF6) and passwords (WF7) were added to the same module afterwards. Business isolation rests on the caller context, which always carries the business; every data-access function requires it (BR3.1), and the two-business API tests prove that another business's records answer "not found".

## Workflows

### WF1 Sign up a business (US1.1)

1. The person opens the Sign up page and enters business name, their name, phone number and password.
2. The web app sends `POST /api/v1/auth/signup`.
3. The backend validates the fields (BR1.1, BR1.2, BR1.4). On failure it returns the error with the field; the page keeps every typed value and shows the message under the field.
4. The backend checks the phone is not already used in any business (BR1.3). If it is, it returns 409 DUPLICATE for phone.
5. In one transaction it creates the Business and the Owner user with a hashed password (BR1.5, BR1.6). If the phone's uniqueness constraint fails here (a simultaneous sign-up), it returns 409 DUPLICATE for phone and saves nothing.
6. It creates a Session (see Session State Machine), sets the HttpOnly session cookie and returns **201** with the caller and the CSRF token.
7. The web app opens the Dashboard (BR4.1).

Error path: any other failure at step 5 saves nothing and returns 500 INTERNAL_ERROR; the page shows "Couldn't save. Try again." with values kept (BR2.8).

### WF2 Sign in (US1.2)

1. The person enters phone and password on the Sign in page; the web app sends `POST /api/v1/auth/signin`.
2. The backend normalizes the phone (BR1.2) and looks up the user across all businesses.
3. If a field is missing or empty, the phone is invalid, there is no user, or the password does not match, it returns 401 INVALID_CREDENTIALS "Sign-in details are not correct." (BR2.1).
4. If the password matches but the user is inactive, it returns 401 ACCOUNT_DEACTIVATED "This account is deactivated." (BR2.2).
5. Otherwise it creates a Session, sets the cookie and returns **200** with the caller and the CSRF token.
6. The web app opens the page first asked for, otherwise the Dashboard (BR4.1).

### WF3 Sign out (US1.2)

1. The person selects Sign out; the web app sends `POST /api/v1/auth/signout` with the CSRF token (BR2.5).
2. The backend deletes the session and clears the cookie, and returns **204** (BR2.4).
3. The web app shows the Sign in page. Any later request with the old cookie gets 401 NOT_SIGNED_IN.

### WF4 Authenticate a request

1. Every request except sign-up and sign-in must carry the session cookie; without it the backend returns 401 NOT_SIGNED_IN.
2. The backend looks up the session the cookie names. If no session is stored (never existed, or signed out), it returns 401 NOT_SIGNED_IN (BR2.4).
3. If the stored session has expired, it deletes it and returns 401 SESSION_ENDED (BR2.3).
4. It loads the user. If the user is inactive, it deletes the session and returns 401 SESSION_ENDED (BR2.6).
5. For any non-GET request, it compares `X-CSRF-Token` with the session's token; a mismatch returns 403 FORBIDDEN (BR2.5).
6. It extends the session (lastUsedAt now, expiresAt now plus 12 hours) and runs the request with the caller context (see below). Every data-access function requires the caller's businessId (BR3.1).

### Caller Context (contract C2)

| Field | Value |
|---|---|
| userId, businessId, businessName, name, role, active | From the signed-in user and their business |

`authorize(caller, action)` refuses a missing or inactive caller (BR2.7). Role limits are checked inside each service function: staff and password resets by the Owner only (ID-BR6.1), stock limits in the backend rules (BR6–BR19).

### WF5 Open the app

1. On load the web app applies the saved theme, or the device theme if none is saved (BR5.1).
2. It calls `GET /api/v1/auth/me`. On 200 it opens the page asked for (`/` goes to the Dashboard); on any 401 it shows Sign in with no message.

### WF6 Manage staff (US-03; FR-3, FR-4)

1. The Owner opens Staff; `GET /api/v1/users` lists everyone in the business with name, phone, role, status (ID-BR6.1).
2. `POST /api/v1/users` adds a person with name, phone, password and one of the roles manager, warehouse_worker, sales_rep, supervisor, accountant (ID-BR6.2). A phone used anywhere returns 409 DUPLICATE "This phone number is already registered". Returns **201**.
3. `PATCH /api/v1/users/:id` with `{active}` deactivates or reactivates a person (ID-BR6.3). A deactivated person's sessions end on their next request (WF4 step 4) and sign-in is refused (BR2.2). The Owner cannot be deactivated.
4. `GET /api/v1/users/names` lists the names of everyone in the business for any signed-in person (history and record filters).

### WF7 Passwords (US-04; FR-5)

1. Anyone changes their own password on My password: `POST /api/v1/auth/password` with current and new password (ID-BR6.4). A wrong current password returns 400 "Your current password is not correct.". On success the person's other sessions end; this one stays. Returns **204**.
2. The Owner sets a new password for a staff member: `POST /api/v1/users/:id/password` (ID-BR6.5). All that person's sessions end. The Owner's own password is changed only through step 1. Returns **204**.

## Session State Machine

| Current state | Event | Guard | Next state | Actions |
|---|---|---|---|---|
| (none) | Sign-up or sign-in succeeds | — | Active | Create session, set cookie, expiresAt = now + 12 h |
| Active | Authenticated request | now ≤ expiresAt and user active | Active | Extend expiresAt to now + 12 h |
| Active | Authenticated request | now > expiresAt | Ended | Delete session; 401 SESSION_ENDED |
| Active | Authenticated request | user inactive | Ended | Delete session; 401 SESSION_ENDED |
| Active | Sign out | — | Ended | Delete session; clear cookie; 204 |
| Active | Own password changed in another session, or reset by the Owner | — | Ended | Session deleted |
| Active | Not used for 7 days past expiresAt | — | Ended | Removed by the daily clean-up |

Ended is terminal and the session is no longer stored, so a later request with its cookie gets NOT_SIGNED_IN; a new sign-in creates a new session.

## Entity-Relationship View (derived from entities.md)

```mermaid
erDiagram
  Business ||--o{ User : "has"
  User ||--o{ Session : "has"
  Business {
    identifier id
    text name
    timestamp createdAt
  }
  User {
    identifier id
    identifier businessId
    text name
    text phone
    enum role
    text passwordHash
    boolean active
  }
  Session {
    text idHash
    identifier userId
    token csrfToken
    timestamp lastUsedAt
    timestamp expiresAt
  }
```

<!-- Text fallback: A Business has many Users. A User has many Sessions. Business holds id, name and createdAt. User holds id, businessId, name, phone, role, passwordHash and active. Session holds idHash, userId, csrfToken, lastUsedAt and expiresAt. -->

## Rules Summary (derived from rules.md)

| Group | Rules |
|---|---|
| Sign-up | BR1.1 required fields, BR1.2 phone format, BR1.3 phone unique, BR1.4 password length, BR1.5 hashing, BR1.6 all-or-nothing |
| Sign-in and sessions | BR2.1 generic failure, BR2.2 deactivated refused, BR2.3 12-hour expiry, BR2.4 sign-out, BR2.5 CSRF, BR2.6 active user, BR2.7 caller context, BR2.8 unexpected failures |
| Isolation | BR3.1 business scoping |
| Web app | BR4.1 landing page, BR5.1 theme, BR5.2 translation file |
| Staff and passwords | ID-BR6.1 Owner only, ID-BR6.2 add staff, ID-BR6.3 deactivate, ID-BR6.4 change own password, ID-BR6.5 Owner reset |

## Error Catalogue

| Code | Status | When | Message shown |
|---|---|---|---|
| VALIDATION_FAILED | 400 | BR1.1, BR1.2, BR1.4, ID-BR6.2, ID-BR6.4 | Field-specific message under the field |
| DUPLICATE | 409 | BR1.3, ID-BR6.2 | "This phone number is already registered" |
| NOT_SIGNED_IN | 401 | No cookie, or the cookie names no stored session (never existed or signed out) | Sign in page, no message |
| SESSION_ENDED | 401 | Stored session expired, or user inactive | Sign in page with "Your session ended. Sign in again." |
| INVALID_CREDENTIALS | 401 | BR2.1 | "Sign-in details are not correct." on the Sign in form |
| ACCOUNT_DEACTIVATED | 401 | BR2.2 | "This account is deactivated." on the Sign in form |
| FORBIDDEN | 403 | BR2.5 (CSRF), ID-BR6.1 (not the Owner), ID-BR6.3 (deactivate the Owner), ID-BR6.5 (reset the Owner) | The server's message, e.g. "Only the owner can manage staff." |
| NOT_FOUND | 404 | BR3.1 | "Not found" |
| INTERNAL_ERROR | 500 | BR2.8 | "Couldn't save. Try again." |

The stock module adds INSUFFICIENT_STOCK (409); see the backend functional spec.

## Assumptions & Open Questions

None.
