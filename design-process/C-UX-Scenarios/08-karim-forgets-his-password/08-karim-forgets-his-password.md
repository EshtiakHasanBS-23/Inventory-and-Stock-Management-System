# 08: Karim Forgets His Password

**Project:** Mojud
**Updated:** 2026-11-16 (as built)
**Method:** Whiteport Design Studio (WDS)
**Priority:** P3
**Status:** ✅ Built

---

## Transaction (Q1)

The Owner sets a new password for a staff member who forgot theirs; the staff member then changes it to one only they know.

## Business Goal (Q2)

Each action stays attributable to the right person: nobody signs in as someone else because they were locked out.

## User & Situation (Q3)

**Personas:** [Karim, Warehouse worker](../../B-Trigger-Map/personas/02-Karim-the-Warehouse-Worker.md); [Mr. Abdul Haque, Owner](../../B-Trigger-Map/personas/03-Haque-the-Owner.md)
**Situation:** Karim is back from a week off and his password does not work; Sign in says "Sign-in details are not correct." He phones Haque.

## Driving Forces (Q4)

**Karim's hope:** Get back in quickly, as himself.
**Karim's worry:** Someone else recording under his name.
**Haque's hope:** Control who does what, from his own phone.

## Device & Starting Point (Q5 + Q6)

**Haque:** phone or desktop, menu "Staff".
**Karim:** phone, Sign in page.

## Best Outcome (Q7)

**User success:** Haque sees "Karim's password is changed. Tell them the new one." Karim signs in with it, opens "My password" and sees "Password changed. Other phones signed in as you are signed out."
**Business success:** Any old session for Karim ended at the reset; after his own change, only his current phone stays signed in.

## Shortest Path (Q8)

1. **Staff: reset password (08.1), Haque:** taps "Reset password" on Karim's row; the panel "New password for Karim" replaces the add form; types a new password; "Set password". Sees the notice and tells Karim the password.
2. **Sign in ([02.1](../02-karim-records-the-morning-delivery/02.1-sign-in/02.1-sign-in.md)), Karim:** signs in with the new password.
3. **My password (08.2), Karim:** enters the password Haque gave him as "Current password", his own as "New password", "Change password". ✓

## Scenario Steps

| Step | Folder | Purpose | Exit action |
|------|--------|---------|-------------|
| 08.1 | `08.1-staff-reset-password/` | Owner sets a new password for a staff member | "Set password" |
| 08.2 | `08.2-my-password/` | Change your own password | "Change password" |

## Stories and Requirements Covered

| Story | Requirements |
|---|---|
| US-04 Passwords | FR-5 |

## Trigger Map Connections

- ✅ **Want (Haque):** control who does what (staff, roles, passwords).
- ✅ **Want (Karim):** his name on his own work.
