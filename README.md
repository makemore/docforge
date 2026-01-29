# 🔥 DocForge

> Forge beautiful PDFs from Markdown and HTML — perfect for LLM-generated documents, presentations, and reports.

[![npm version](https://img.shields.io/npm/v/docforge-cli.svg)](https://www.npmjs.com/package/docforge-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 📝 Convert **Markdown** to PDF with syntax highlighting
- 🌐 Convert **HTML** to PDF with full CSS support
- 🎨 **9 built-in styles**: minimal, professional, presentation, invoice, dark, academic, report, resume, and mmd-brand
- 📚 **Merge multiple files** into a single PDF with optional table of contents
- ⚙️ Configurable via CLI options or config file
- 🔄 Watch mode for live regeneration
- 📦 Batch conversion support

## Installation

```bash
npm install -g docforge-cli
```

## Quick Start

```bash
# Convert a markdown file to PDF
docforge md document.md

# Convert with a specific style
docforge md report.md --style professional

# Convert HTML to PDF
docforge html page.html -o output.pdf

# Merge multiple files into one PDF
docforge merge chapter1.md chapter2.md chapter3.md -o book.pdf

# Merge with table of contents
docforge merge *.md -o combined.pdf --toc
```

## Commands

### `docforge md <input>` / `docforge markdown <input>`

Convert Markdown file(s) to PDF.

```bash
docforge md README.md                      # Basic conversion
docforge md doc.md -o output.pdf           # Specify output
docforge md doc.md --style dark            # Use dark theme
docforge md doc.md --format Letter         # US Letter size
docforge md doc.md --landscape             # Landscape orientation
docforge md doc.md --toc                   # Include table of contents
docforge md doc.md -w                      # Watch for changes
```

### `docforge html <input>`

Convert HTML file(s) to PDF.

```bash
docforge html page.html                    # Basic conversion
docforge html page.html --style minimal    # Inject a style
docforge html page.html --wait 2000        # Wait for JS rendering
docforge html page.html --selector ".ready" # Wait for element
```

### `docforge merge <files...>`

Merge multiple markdown files into a single PDF.

```bash
docforge merge ch1.md ch2.md ch3.md -o book.pdf
docforge merge *.md -o combined.pdf --toc  # With table of contents
docforge merge docs/*.md --sort            # Sort alphabetically
docforge merge *.md --style academic       # Use academic style
```

### `docforge styles`

List all available built-in styles.

### `docforge init`

Create a `docforge.config.js` configuration file.

### `docforge batch <pattern>`

Convert multiple files matching a pattern.

```bash
docforge batch "*.md" -o ./pdfs
docforge batch "docs/*.html" -t html
```

## Built-in Styles

| Style | Description |
|-------|-------------|
| `minimal` | Clean, simple styling with good typography |
| `professional` | Business-ready documents with subtle accents |
| `presentation` | Slide-like layout for presentations and decks |
| `dark` | Dark mode theme for screen-friendly PDFs |
| `academic` | Academic paper style (Times New Roman, double-spaced) |
| `report` | Corporate report style with cover page support |
| `resume` | Clean CV/resume layout |
| `invoice` | Clean invoice and billing document style |
| `mmd-brand` | Make More Digital branded documents |

<!-- Screenshots placeholder -->
<!-- ![Style Examples](./docs/screenshots/styles.png) -->

## Configuration

Create a `docforge.config.js` file in your project root:

```javascript
module.exports = {
  style: 'professional',
  format: 'A4',
  landscape: false,
  markdown: {
    toc: false,
    headerFooter: true,
  },
  html: {
    wait: 0,
    selector: null,
  },
  customCss: '',
};
```

## Programmatic Usage

```javascript
const { convertMarkdown, convertHtml, mergeMarkdownFiles } = require('docforge-cli');

// Convert markdown
await convertMarkdown('input.md', { style: 'professional', output: 'output.pdf' });

// Convert HTML
await convertHtml('page.html', { format: 'Letter' });

// Merge files
await mergeMarkdownFiles(['ch1.md', 'ch2.md'], { toc: true, output: 'book.pdf' });
```

## Requirements

- Node.js >= 18.0.0
- Chromium (automatically installed with Puppeteer)

## License

MIT © [Make More Digital](https://github.com/makemoredigital)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

