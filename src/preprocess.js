/**
 * DocForge - Markdown Preprocessing
 * 
 * Handles transformations on markdown content before it's passed to md-to-pdf.
 */

/**
 * Regex to match \newpage or \pagebreak on its own line (with optional whitespace)
 * This follows the Pandoc convention for page breaks in markdown.
 */
const PAGE_BREAK_REGEX = /^[ \t]*\\(?:newpage|pagebreak)[ \t]*$/gm;

/**
 * HTML replacement for page breaks.
 * Wrapped in blank lines so marked treats it as a raw HTML block.
 */
const PAGE_BREAK_HTML = '\n\n<div class="page-break"></div>\n\n';

/**
 * Transform \newpage and \pagebreak markers into HTML page break divs.
 * 
 * @param {string} content - The raw markdown content
 * @returns {string} - The transformed content with page break divs
 * 
 * @example
 * const input = `# Section A
 * 
 * Some text.
 * 
 * \\newpage
 * 
 * # Section B`;
 * 
 * const output = applyPageBreaks(input);
 * // output contains <div class="page-break"></div> instead of \newpage
 */
function applyPageBreaks(content) {
  if (!content) return content;
  // Keep the surrounding blank lines so markdown parser treats the div as a block element
  return content.replace(PAGE_BREAK_REGEX, PAGE_BREAK_HTML);
}

/**
 * Check if content contains any page break markers
 *
 * @param {string} content - The markdown content to check
 * @returns {boolean} - True if content contains \newpage or \pagebreak
 */
function hasPageBreaks(content) {
  if (!content) return false;
  // Use a fresh regex to avoid lastIndex issues with the global flag
  const regex = /^[ \t]*\\(?:newpage|pagebreak)[ \t]*$/m;
  return regex.test(content);
}

/**
 * CSS rule for the page-break class.
 * This should be injected into the PDF styles.
 */
const PAGE_BREAK_CSS = `
.page-break {
  page-break-after: always;
  break-after: page;
  height: 0;
  margin: 0;
  padding: 0;
  border: none;
}
`;

module.exports = {
  applyPageBreaks,
  hasPageBreaks,
  PAGE_BREAK_CSS,
  PAGE_BREAK_REGEX,
};
