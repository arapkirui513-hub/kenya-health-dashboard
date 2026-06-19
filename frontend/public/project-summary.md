# Kenya Health Facilities Dashboard

## Summary

The Kenya Health Facilities Dashboard is a production-ready healthcare analytics dashboard for exploring health facility distribution, ownership patterns, service availability, population-adjusted access, county planning priorities, and health need-access gaps across Kenya.

The project combines a React frontend, a FastAPI backend, public API documentation, county comparison tools, export/reporting features, and production performance optimization.

## Live Links

- Frontend: https://kenya-health-dashboard.vercel.app/
- Backend API: https://kenya-health-dashboard-api.onrender.com
- API Documentation: https://kenya-health-dashboard-api.onrender.com/docs
- GitHub Repository: https://github.com/arapkirui513-hub/kenya-health-dashboard

## What the Dashboard Helps Users Understand

The dashboard helps users explore:

- How health facilities are distributed across Kenyan counties
- Which counties have more or fewer recorded facilities
- How facility ownership varies between public, private, faith-based, NGO, community, and academic categories
- Which selected health services are available across counties
- Where service coverage gaps may exist
- How population-adjusted facility access differs between counties
- Which counties may need closer planning attention
- How health need and facility access gaps compare across Kenya

## Core Features

- National overview of health facilities
- Facility ownership breakdown
- Facility category analysis
- County-level facility distribution
- Service availability analysis
- ART service gap indicators
- Population-adjusted access analysis
- County Explorer and county comparison workflow
- Planning priority indicators
- Health need index
- Need-access gap index
- Facility Finder with search, filtering, pagination, and CSV export
- Public backend API
- API documentation
- Printable and export-ready reporting support

## Technical Stack

Frontend:

- React
- Vite
- Tailwind CSS
- Recharts
- React Router

Backend:

- FastAPI
- Python
- Pandas
- CSV-based data processing
- Render deployment

Infrastructure:

- Vercel frontend deployment
- Render backend deployment
- GitHub Actions keep-awake workflow
- GitHub release/version documentation

## Production Performance

The dashboard was optimized for production performance.

PageSpeed Insights mobile results after optimization:

| Category | Score |
|---|---:|
| Performance | 95 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| Agentic Browsing | 2/3 |

Performance work included:

- Route-level code splitting
- Lazy-loaded dashboard sections
- Deferred Facility Finder API calls
- Reduced Dashboard JavaScript chunk from about 435 kB to about 48 kB
- Prevented the large MapPage bundle from loading during homepage initial load

## Portfolio Value

This project demonstrates:

- Healthcare data analytics
- Public health dashboard design
- Full-stack web development
- FastAPI backend engineering
- React frontend engineering
- Data storytelling
- Accessibility awareness
- SEO readiness
- Performance optimization
- Product thinking for healthcare and public health systems

## Intended Audience

This dashboard is useful for:

- Healthcare planners
- Public health analysts
- County-level decision makers
- Health systems researchers
- Portfolio reviewers
- Recruiters evaluating healthcare data/product work
- Developers reviewing full-stack dashboard implementation

## Project Status

V5.0.1 machine-readable project summary added for LLMs, crawlers, search tools, and portfolio reviewers.
