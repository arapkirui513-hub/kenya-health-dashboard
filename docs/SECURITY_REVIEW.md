# Security Review

## Project

Kenya Health Facilities Dashboard

## Current Security Scope

This application is a public, read-only health facility analytics dashboard. It is designed for facility-level and county-level insights, not patient-level clinical records.

The current system does not include user accounts, admin roles, patient records, file uploads, payment workflows, or protected facility portals.

## Security Boundary

| Constraint | Status | Rationale |
|---|---:|---|
| Patient-level data | None | Public facility analytics only |
| Personally identifiable information | None expected | Dataset should not include patient or staff PII |
| User authentication | None | Current app is read-only and public |
| Admin roles | None | No admin workflows currently |
| File uploads | None | No upload surface exists |
| Payments | None | No payment workflow exists |
| API write operations | None | Public API is GET-only |
| Rate limiting | Implemented | SlowAPI limits public endpoint abuse |
| CORS restriction | Implemented | Backend allows Vercel frontend and localhost only |
| Security headers | Implemented | Backend and frontend set browser security controls |
| Source maps | Disabled | Production build should not expose source maps |
| Audit logging | Not required yet | No user actions or patient access currently |

## Current Controls

### Frontend

- Vercel security headers added in `frontend/vercel.json`
- Content Security Policy added
- Frame embedding blocked with `X-Frame-Options: DENY`
- MIME sniffing blocked with `X-Content-Type-Options: nosniff`
- Referrer leakage reduced with `Referrer-Policy`
- Camera, microphone, and geolocation disabled through `Permissions-Policy`
- Production source maps explicitly disabled in `frontend/vite.config.js`

### Backend

- FastAPI CORS restricted to:
  - `https://kenya-health-dashboard.vercel.app`
  - `http://localhost:5173`
- API methods restricted to `GET`
- Public endpoints protected with SlowAPI rate limits
- Backend security headers added through middleware
- No patient-level endpoints are part of the current API

## Public API Testing Scope

Safe production checks include:

- Browsing the public frontend
- Inspecting network requests
- Reviewing public API responses
- Checking browser storage for exposed keys or sensitive data
- Checking headers with `curl`
- Testing harmless invalid query parameters
- Testing non-persistent search/filter input handling

Production testing must not include:

- High-volume stress testing
- Brute forcing
- Destructive scans
- Data modification attempts
- File upload attacks
- Patient data extraction attempts
- Automated exploit tools against the live app

## Future Security Requirements

If the system later adds authentication, patient records, facility accounts, uploads, or admin workflows, the security model must be expanded before release.

Future controls should include:

- Authentication and authorization
- Role-based access control
- Audit logging
- Secure session/token handling
- CSRF protection for state-changing actions
- Stronger API abuse controls
- Data retention policy
- Formal privacy review
- Staging environment for active security testing

## Review Status

This document reflects the current public read-only version of the dashboard.
