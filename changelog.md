# Changelog

All notable changes to the WiseTogether project are documented here.

---

## [Unreleased]

### Changed
- Used toast notifications for all key user actions [#14](https://github.com/WiseTogether/wisetogether-web/issues/14)

---

## [2025-06-07]

### Documentation
- Completed and finalized self-review analysis document
- Organized GitHub issues for better task management

---

## [2025-06-08]

### Changed
- Refactored API authentication to use Supabase access tokens [#10](https://github.com/WiseTogether/wisetogether-web/issues/10) ([#20](https://github.com/WiseTogether/wisetogether-web/pull/20))

### Added
- Implemented edit transaction functionality [#5](https://github.com/WiseTogether/wisetogether-web/issues/5) ([#21](https://github.com/WiseTogether/wisetogether-web/pull/21))
- Implemented delete transaction functionality [#11](https://github.com/WiseTogether/wisetogether-web/issues/11) ([#22](https://github.com/WiseTogether/wisetogether-web/pull/22))

---

## [2025-06-09]

### Added
- Fixed incorrect label assignment for newly created transactions [#7](https://github.com/WiseTogether/wisetogether-web/issues/7) ([#23](https://github.com/WiseTogether/wisetogether-web/pull/23))
- Added fallback handling for cases where partner is undefined [#8](https://github.com/WiseTogether/wisetogether-web/issues/8) ([#23](https://github.com/WiseTogether/wisetogether-web/pull/23))

### Changed
- Form Validation with Zod [#6](https://github.com/WiseTogether/wisetogether-web/issues/6) ([#24](https://github.com/WiseTogether/wisetogether-web/pull/24))

---

## [2025-06-10]

### Added
- Google OAuth login flow [#9](https://github.com/WiseTogether/wisetogether-web/issues/9) ([#25](https://github.com/WiseTogether/wisetogether-web/pull/25))
- Global error handling for render failures and API errors [#12](https://github.com/WiseTogether/wisetogether-web/issues/12) ([#26](https://github.com/WiseTogether/wisetogether-web/pull/26))

### Fixed
- Improved the loading state handling and prevented premature UI rendering [#13](https://github.com/WiseTogether/wisetogether-web/issues/13)