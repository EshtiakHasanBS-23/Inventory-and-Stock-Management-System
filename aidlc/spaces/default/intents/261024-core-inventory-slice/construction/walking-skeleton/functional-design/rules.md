# Business Rules — walking-skeleton

Rules of the identity module and the app shell as built (`apps/api/src/modules/identity`, `packages/contracts/src/schemas.ts`, `staff.ts`, `phone.ts`; `apps/web/src`): sign-up, sign-in, sessions, business isolation, staff and passwords (FR-1 to FR-5 in `requirements.md`). Stock rules continue from BR6.x in `construction/backend/functional-design/rules.md`; the staff and password rules here carry the prefix ID- (ID-BR6.1 to ID-BR6.5) to keep them apart.

```yaml
rules:
  - id: BR1.1
    statement: Sign-up requires business name, your name, phone number and password
    category: validation
    applies_to: sign-up
    trigger: sign-up submitted
    logic: IF businessName, name or phone is missing or blank after trimming, OR password is missing or empty THEN refuse with VALIDATION_FAILED naming each field; names longer than 100 characters are refused the same way. Passwords are never trimmed
    violation: 400 VALIDATION_FAILED with field; nothing saved; typed values kept on screen
    source: FR-1
  - id: BR1.2
    statement: Phone numbers are normalized and must be 6 to 15 digits
    category: validation
    applies_to: sign-up, sign-in
    trigger: phone received
    logic: remove spaces and dashes; IF the result is not 6 to 15 digits THEN refuse
    violation: sign-up 400 VALIDATION_FAILED field phone; sign-in is treated as wrong details (BR2.1)
    source: FR-1, FR-2
  - id: BR1.3
    statement: A phone number belongs to at most one user across all businesses
    category: constraint
    applies_to: User.phone
    trigger: sign-up, adding a staff member
    logic: IF a user with the same normalized phone exists in any business THEN refuse. The check is backed by a uniqueness constraint, so when two sign-ups with the same phone arrive at the same moment, the one that fails inside its transaction is also reported as DUPLICATE and saves nothing
    violation: 409 DUPLICATE field phone, "This phone number is already registered"
    source: FR-1
  - id: BR1.4
    statement: Passwords are 8 to 128 characters
    category: validation
    applies_to: sign-up
    trigger: password received
    logic: count every character exactly as typed (no trimming); IF length < 8 THEN refuse with "At least 8 characters."; IF length > 128 THEN refuse
    violation: 400 VALIDATION_FAILED field password
    source: FR-1
  - id: BR1.5
    statement: Passwords are stored only as a salted slow hash
    category: policy
    applies_to: User.passwordHash
    trigger: user created or password set
    logic: hash with Argon2id (memory 19 MiB, 2 passes, parallelism 1) and a per-password salt; never store, return or log the plain password
    violation: not applicable (design-time guarantee, checked by test)
    source: NFR-1
  - id: BR1.6
    statement: Sign-up creates the business and its first Owner together, then signs the Owner in
    category: policy
    applies_to: Business, User, Session
    trigger: valid sign-up
    logic: in one transaction create Business and a User with role owner and active true; IF any step fails THEN nothing is saved; on success create a Session (BR2.3)
    violation: 500 INTERNAL_ERROR "Couldn't save. Try again." (BR2.8); no partial business; a phone uniqueness failure inside the transaction is 409 DUPLICATE (BR1.3)
    source: FR-1
  - id: BR2.1
    statement: Sign-in failures never reveal which field was wrong
    category: authorization
    applies_to: sign-in
    trigger: sign-in submitted
    logic: IF phone or password is missing or empty, OR the phone is not valid after normalization, OR no user has that phone, OR the password does not match THEN refuse with the same code, message and similar response time
    violation: 401 INVALID_CREDENTIALS "Sign-in details are not correct."
    source: FR-2
  - id: BR2.2
    statement: Deactivated users cannot sign in
    category: authorization
    applies_to: sign-in
    trigger: phone and password match
    logic: IF the phone and password match AND user.active is false THEN refuse (the deactivated message is only shown after a correct password)
    violation: 401 ACCOUNT_DEACTIVATED "This account is deactivated."
    source: FR-2
  - id: BR2.3
    statement: A session ends 12 hours after its last use
    category: policy
    applies_to: Session
    trigger: any authenticated request
    logic: expired sessions stay stored until their next use; IF the cookie names a stored session AND now > expiresAt THEN delete it and refuse with SESSION_ENDED; ELSE set lastUsedAt to now and expiresAt to now plus 12 hours. A stored session never used again is removed by a daily clean-up after 7 days past expiry
    violation: 401 SESSION_ENDED
    source: FR-2
  - id: BR2.4
    statement: Signing out ends the session at once
    category: policy
    applies_to: Session
    trigger: sign-out
    logic: delete the session and clear the cookie; a later request with the old cookie names no stored session and is refused as NOT_SIGNED_IN (the same as having no cookie)
    violation: 401 NOT_SIGNED_IN on later requests
    source: FR-2
  - id: BR2.5
    statement: Every change request carries the session's CSRF token
    category: authorization
    applies_to: all non-GET requests except sign-up and sign-in
    trigger: request received
    logic: IF the X-CSRF-Token header is missing or differs from the session's csrfToken THEN refuse
    violation: 403 FORBIDDEN
    source: FR-2, NFR-1
  - id: BR2.6
    statement: Every authenticated request runs as an active user
    category: authorization
    applies_to: all authenticated requests
    trigger: session resolved to a caller
    logic: IF the session's user is inactive THEN delete the session and refuse
    violation: 401 SESSION_ENDED
    source: FR-3, FR-4
  - id: BR3.1
    statement: A caller only ever sees their own business's records
    category: authorization
    applies_to: every query
    trigger: any data read or write
    logic: the caller context always carries businessId; every data-access function takes it as a required argument and scopes its query by it; IF a record belongs to another business THEN behave as if it does not exist. The API tests sign in to two businesses and prove each record endpoint answers not found for the other business's ids
    violation: 404 NOT_FOUND
    source: FR-4, NFR-2
  - id: BR2.7
    statement: The caller context handed to every module is complete and safe
    category: authorization
    applies_to: IdentityAccess interface (contract C2)
    trigger: request authenticated (WF4)
    logic: resolveCaller returns a read-only caller with userId, businessId, businessName, name, role and active; authorize(caller, action) refuses a missing or inactive caller; role limits are checked inside each service function (ID-BR6.1 and the backend rules)
    violation: 401 per WF4
    source: FR-4
  - id: BR2.8
    statement: Unexpected server failures save nothing and return a stable code
    category: policy
    applies_to: all endpoints
    trigger: an unexpected error during a request
    logic: roll back the request's transaction; respond with INTERNAL_ERROR and "Couldn't save. Try again."; never include internal details
    violation: 500 INTERNAL_ERROR
    source: NFR-3
  - id: BR4.1
    statement: Every role lands on the Dashboard after sign-in
    category: policy
    applies_to: web app
    trigger: successful sign-up or sign-in, or opening `/` while signed in
    logic: go to the page first asked for when the person was sent to Sign in; otherwise /dashboard for every role. A page the role may not open (/staff for non-Owners, /products/import for roles other than Owner and Manager) sends the person to /dashboard
    violation: not applicable
    source: FR-2, NFR-4
  - id: BR5.1
    statement: The theme follows the device until the user chooses, and the choice is remembered in that browser
    category: policy
    applies_to: web app
    trigger: page load, theme switch
    logic: IF a saved choice exists THEN apply it before first paint; ELSE follow the device setting
    violation: not applicable
    source: NFR-4
  - id: BR5.2
    statement: All screen text comes from one English translation file
    category: policy
    applies_to: web app
    trigger: any text shown
    logic: screens look up text by key in apps/web/src/i18n/en.json; no screen text is written directly in components
    violation: not applicable (checked in review)
    source: NFR-9
  - id: ID-BR6.1
    statement: Only the Owner manages staff
    category: authorization
    applies_to: GET/POST /users, PATCH /users/:id, POST /users/:id/password
    trigger: request
    logic: IF caller.role is not owner THEN refuse; every query is scoped to the Owner's business (BR3.1)
    violation: 403 FORBIDDEN "Only the owner can manage staff."
    source: FR-3, FR-4
  - id: ID-BR6.2
    statement: A staff member has a name, a phone unique across all businesses, a password and one of five roles
    category: validation
    applies_to: POST /users
    trigger: request
    logic: name 1–100 trimmed; phone per BR1.2 and BR1.3; password per BR1.4, hashed per BR1.5; role one of manager, warehouse_worker, sales_rep, supervisor, accountant
    violation: 400 VALIDATION_FAILED; 409 DUPLICATE field phone "This phone number is already registered"
    source: FR-3
  - id: ID-BR6.3
    statement: The Owner deactivates and reactivates staff; the Owner cannot be deactivated
    category: policy
    applies_to: PATCH /users/:id
    trigger: request
    logic: set active true or false for a non-owner user of the business; a deactivated user's sessions end on their next request (BR2.6) and sign-in is refused (BR2.2)
    violation: 403 FORBIDDEN "The owner cannot be deactivated."; 404 NOT_FOUND for another business's user
    source: FR-3
  - id: ID-BR6.4
    statement: Anyone changes their own password with their current password; other sessions end
    category: policy
    applies_to: POST /auth/password
    trigger: request
    logic: verify currentPassword; new password per BR1.4; in one transaction save the new hash and delete the user's other sessions; the session making the change stays
    violation: 400 VALIDATION_FAILED field currentPassword "Your current password is not correct."
    source: FR-5
  - id: ID-BR6.5
    statement: The Owner sets a new password for a staff member; all their sessions end
    category: policy
    applies_to: POST /users/:id/password
    trigger: request
    logic: target must be a non-owner user of the business; in one transaction save the new hash and delete all their sessions; the Owner's own password changes only through ID-BR6.4
    violation: 403 FORBIDDEN "Change your own password on the My password page."; 404 NOT_FOUND
    source: FR-5
```

## Rules Summary

| ID | Rule | Category | Source |
|---|---|---|---|
| BR1.1 | Sign-up fields required | validation | FR-1 |
| BR1.2 | Phone normalized, 6–15 digits | validation | FR-1, FR-2 |
| BR1.3 | Phone unique across all businesses | constraint | FR-1 |
| BR1.4 | Password 8–128 characters | validation | FR-1 |
| BR1.5 | Password stored only as an Argon2id hash | policy | NFR-1 |
| BR1.6 | Business and Owner created together | policy | FR-1 |
| BR2.1 | Sign-in failure never names the field | authorization | FR-2 |
| BR2.2 | Deactivated users cannot sign in | authorization | FR-2 |
| BR2.3 | Session ends 12 hours after last use | policy | FR-2 |
| BR2.4 | Sign-out ends the session | policy | FR-2 |
| BR2.5 | CSRF token on change requests | authorization | FR-2, NFR-1 |
| BR2.6 | Requests run as an active user | authorization | FR-3, FR-4 |
| BR2.7 | Caller context and authorize | authorization | FR-4 |
| BR2.8 | Unexpected failures save nothing, code INTERNAL_ERROR | policy | NFR-3 |
| BR3.1 | Business isolation | authorization | FR-4, NFR-2 |
| BR4.1 | Landing page: Dashboard | policy | FR-2, NFR-4 |
| BR5.1 | Theme choice | policy | NFR-4 |
| BR5.2 | Translation file | policy | NFR-9 |
| ID-BR6.1 | Staff: Owner only | authorization | FR-3, FR-4 |
| ID-BR6.2 | Add staff | validation | FR-3 |
| ID-BR6.3 | Deactivate / reactivate; not the Owner | policy | FR-3 |
| ID-BR6.4 | Change own password | policy | FR-5 |
| ID-BR6.5 | Owner resets a staff password | policy | FR-5 |

## Assumptions & Open Questions

None.
