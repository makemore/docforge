# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

