# Entities — walking-skeleton

Entities of the identity module (`apps/api/src/modules/identity`, migration `apps/api/migrations/0001_identity.sql`), built first as the walking skeleton and later extended with staff management and passwords. They serve US-01 to US-04 (FR-1 to FR-5 in `requirements.md`). Stock entities are in `construction/backend/functional-design/entities.md`.

```yaml
entities:
  - name: Business
    description: One customer company using Mojud; every record belongs to exactly one business
    attributes:
      - { name: id, type: identifier, required: true, unique: true, default: generated }
      - { name: name, type: text, required: true, min: 1, max: 100, constraints: [trimmed, not blank] }
      - { name: createdAt, type: timestamp, required: true, default: now }
    relationships:
      - { to: User, cardinality: one-to-many, direction: Business has Users }

  - name: User
    description: A person who signs in; belongs to one business and has one role
    attributes:
      - { name: id, type: identifier, required: true, unique: true, default: generated }
      - { name: businessId, type: identifier, required: true, references: Business.id }
      - { name: name, type: text, required: true, min: 1, max: 100, constraints: [trimmed, not blank] }
      - { name: phone, type: text, required: true, unique: true, constraints: [spaces and dashes removed, 6 to 15 digits (users_phone_format), unique across all businesses (users_phone_key)] }
      - { name: role, type: enum, required: true, allowed: [owner, manager, supervisor, warehouse_worker, sales_rep, accountant] }
      - { name: passwordHash, type: text, required: true, constraints: [Argon2id hash, never returned or logged] }
      - { name: active, type: boolean, required: true, default: true }
      - { name: createdAt, type: timestamp, required: true, default: now }
    constraints:
      - each business has exactly one owner, created at sign-up; staff are added with the other five roles and the owner can never be deactivated
    relationships:
      - { to: Business, cardinality: many-to-one, direction: User belongs to Business }
      - { to: Session, cardinality: one-to-many, direction: User has Sessions }

  - name: Session
    description: A signed-in browser session referenced by an HttpOnly cookie
    attributes:
      - { name: idHash, type: char(64), required: true, unique: true, constraints: [SHA-256 of the random session token in the cookie; the token itself is never stored] }
      - { name: userId, type: identifier, required: true, references: User.id }
      - { name: csrfToken, type: opaque random token, required: true }
      - { name: createdAt, type: timestamp, required: true, default: now }
      - { name: lastUsedAt, type: timestamp, required: true, default: now }
      - { name: expiresAt, type: timestamp, required: true, constraints: [lastUsedAt plus 12 hours] }
    relationships:
      - { to: User, cardinality: many-to-one, direction: Session belongs to User }
```

## Summary

| Entity | Purpose | Key rules |
|---|---|---|
| Business | The customer company | Name required; owns every other record |
| User | A person who signs in | Phone unique across all businesses; one of six roles; password stored only as a hash |
| Session | A signed-in browser | Ends 12 hours after last use, at sign-out, on deactivation, or when the password changes elsewhere; carries the CSRF token |

## Assumptions & Open Questions

None.
