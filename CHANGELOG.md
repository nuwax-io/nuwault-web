# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-06-05

### Added

- **password:** Modularize generator flow and strengthen PWA, CI, and test coverage (#1)

## [1.2.0] - 2025-10-29

### Added

- **styles:** Implement centralized brand color system
- **password:** Persist password length preference using localStorage
- **seo:** Add canonical link for improved SEO
- **seo:** Add client-side redirects to canonical URL

### Fixed

- **styles:** Escape colon in Tailwind class selector
- **seo:** Prevent canonical redirects in local/dev environments
- **pwa:** Remove obsolete logo from service worker cache list

## [1.1.0] - 2025-07-15

### Added

- **seo:** Add robots.txt and sitemap.xml for improved search engine optimization
- **generator:** Improve password generation accuracy and UX responsiveness

### Fixed

- **ui:** Blur keyword input on clear to close mobile keyboard

### Security

- **release:** V1.1.0

## [1.0.1] - 2025-07-08

### Fixed

- **password:** Resolve race condition in mobile password generation

## [1.0.0] - 2025-07-07

### Added

- **core:** Implement comprehensive password vault application

### Security

- **v1.0.0:** Initial stable release


