# Performance Optimization Note

## Date

June 19, 2026

## Summary

The Kenya Health Facilities Dashboard frontend was optimized to improve initial page load performance.

## Before Optimization

PageSpeed Insights mobile score:

- Performance: 56
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- Agentic Browsing: 2/3

## After Optimization

PageSpeed Insights mobile score:

- Performance: 95
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- Agentic Browsing: 2/3

## Key Changes

- Added route-level code splitting for Dashboard, County Explorer, and Map pages.
- Lazy-loaded heavy dashboard sections.
- Added a reusable `LazySection` component using `IntersectionObserver`.
- Deferred Facility Finder API calls until the user scrolls near the Facility Finder section.
- Reduced the Dashboard JavaScript chunk from approximately 435 kB to approximately 48 kB.
- Prevented the large MapPage bundle from loading during the homepage initial load.

## Result

The dashboard now loads significantly faster while preserving the existing user experience, accessibility score, SEO score, and production functionality.
