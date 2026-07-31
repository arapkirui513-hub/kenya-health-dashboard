# V5 Production Portfolio Release

## Release Name

V5.0.0 - Production Portfolio Release

## Date

June 19, 2026

## Summary

This release marks the Kenya Health Facilities Dashboard as a production-polished portfolio project.

The dashboard now combines healthcare analytics, county-level planning intelligence, Need vs Access Gap analysis, public API access, accessibility improvements, SEO readiness, and production performance optimization into a deployable full-stack portfolio application.

Frontend Release: V5.0.0

Backend API: v5.0.2

## Key Highlights

- Production frontend deployed on Vercel
- Backend API deployed on Render
- Public API documentation available
- County Explorer and comparison workflow
- Population-adjusted access analysis
- Ownership and market dynamics analysis
- Planning priority indicators
- Need vs Access Gap Index for county prioritization
- Printable and export-ready reporting support
- SEO and accessibility polish
- PageSpeed performance optimization

## Production Performance Results

Latest PageSpeed Insights mobile results:

| Category | Score |
|---|---:|
| Performance | 95 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| Agentic Browsing | 2/3 |

## Performance Improvements

The frontend was optimized by:

- Adding route-level code splitting
- Lazy-loading heavy dashboard sections
- Deferring Facility Finder API calls until needed
- Reducing the Dashboard JavaScript chunk from about 435 kB to about 48 kB
- Preventing the large MapPage bundle from loading during homepage initial load

## System Architecture

Frontend
- React
- TypeScript
- Vite

Backend
- FastAPI
- PostgreSQL
- Pandas

Deployment
- Frontend hosted on Vercel
- Backend API hosted on Render

## Portfolio Value

This release demonstrates:

- Healthcare data analytics
- Full-stack web development
- FastAPI backend design
- React frontend engineering
- Data storytelling
- Accessibility awareness
- SEO readiness
- Performance optimization
- Product thinking for public health dashboards

## Live Links

- Frontend: https://kenya-health-dashboard.vercel.app/
- Backend: https://kenya-health-dashboard-api.onrender.com
- API Docs: https://kenya-health-dashboard-api.onrender.com/docs
- GitHub Repository: https://github.com/arapkirui513-hub/kenya-health-dashboard

## Release Status

Production portfolio release complete.
