# Observability Requirements — walking-skeleton

Logging and health checks for a local-only app (Q4: pino JSON logs). There is no monitoring service, alerting or monitoring dashboard, because nothing is deployed (`project.md` Forbidden).

## Logging

| ID | Requirement | Check |
|---|---|---|
| NFR8.9 | The backend writes structured JSON logs with pino to stdout. Each request produces one line containing `requestId`, `method`, `route`, `status`, `durationMs` and, when signed in, `userId` and `businessId`. | Integration test captures one log line and checks the fields |
| NFR8.10 | Each request gets a request ID: the incoming `X-Request-Id` if it is valid, otherwise a new UUID. The ID is returned in the `X-Request-Id` response header and included in 500 error bodies as `requestId`, so a user-reported error can be found in the log. | Integration test |
| NFR1.18 | Redaction: the logger removes `password`, `cookie`, `set-cookie`, `x-csrf-token` and `csrfToken` from every log entry (pino `redact`). | Test from NFR1.2 also checks the cookie and token |
| NFR8.11 | Events are logged at `info` level: sign-up (businessId, userId), sign-in success, sign-in failure (reason code only, never the phone), sign-out, session ended, password changed, staff added, staff active changed, staff password reset, and every stock change (`stock.*` events in the backend functional spec). `error` level is used for every 500, with the stack trace in the log only. | Integration test for sign-in failure |
| NFR8.12 | The log level comes from `LOG_LEVEL` (default `info`). Tests run at `silent` unless a test captures logs. Pretty printing is used only in development (`pino-pretty`). | Config test |

## Health Metrics

| ID | Requirement | Check |
|---|---|---|
| NFR8.13 | `GET /api/v1/health` returns 200 `{status: "ok", db: "ok"}` when the database answers `SELECT 1`, and 503 `{status: "error", db: "down"}` otherwise. Docker uses it as the backend's health check. | Integration test |
| NFR8.14 | Error rate is visible from the logs: each 5xx line has `level: 50`, and `npm run logs:errors` filters them. | Manual check |

## Tracing, Alerting and Dashboards

- **Tracing:** not required. This is one backend process, and the request ID covers it.
- **Alerting:** none; the app runs only locally.
- **Monitoring dashboards:** none.

## Assumptions & Open Questions

None.
