// DocForge - Main exports for programmatic use

const { convertMarkdown } = require('./markdown');
const { convertHtml } = require('./html');
const { loadConfig } = require('./config');
const { listStyles, getStylePath, getStyleCss } = require('./styles');
const { mergeMarkdownFiles } = require('./merge');

module.exports = {
  convertMarkdown,
  convertHtml,
  mergeMarkdownFiles,
  loadConfig,
  listStyles,
  getStylePath,
  getStyleCss,
};

