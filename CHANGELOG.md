# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2026-05-13

### Fixed
- Fixed heading rendering issue where markdown headings after page breaks were not being parsed correctly

## [1.2.0] - 2026-05-13

### Added
- **Page break support**: Use `\newpage` or `\pagebreak` on its own line to force a page break in markdown documents
  - Works with both `docforge md` and `docforge merge` commands
  - Compatible with Pandoc's page break syntax
- **Auto page breaks in merge**: Page breaks are now automatically inserted between merged files (default behaviour)
  - Use `--no-auto-page-break` flag to disable automatic page breaks between files
- Added test infrastructure with Jest
- Added `src/preprocess.js` module for markdown transformations

### Changed
- Markdown conversion now uses content-based rendering with basedir for proper relative path resolution

## [1.1.0] - 2026-01-29

### Added
- **New styles**: `dark`, `academic`, `report`, and `resume` built-in stylesheets
- **Merge command**: Combine multiple markdown files into a single PDF
  - Support for glob patterns (`docforge merge *.md`)
  - Optional table of contents generation (`--toc`)
  - Page breaks between files
  - Alphabetical sorting option (`--sort`)
- Prepared package for npm publishing
  - Added comprehensive README with usage examples
  - Added MIT LICENSE
  - Added .npmignore for cleaner package
  - Added CHANGELOG

### Changed
- Updated package.json with all required npm fields

## [1.0.0] - 2024-01-01

### Added
- Initial release
- Markdown to PDF conversion
- HTML to PDF conversion
- Built-in styles: minimal, professional, presentation, invoice, mmd-brand
- Watch mode for live regeneration
- Batch conversion support
- Configuration file support (docforge.config.js)
- Custom CSS injection
- Multiple page formats (A4, Letter, etc.)
- Landscape orientation support
- Table of contents generation for single files

