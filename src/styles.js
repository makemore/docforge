const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const STYLES_DIR = path.join(__dirname, '..', 'styles');

const BUILT_IN_STYLES = {
  minimal: {
    name: 'Minimal',
    description: 'Clean, simple styling with good typography',
    file: 'minimal.css',
  },
  professional: {
    name: 'Professional',
    description: 'Business-ready documents with subtle accents',
    file: 'professional.css',
  },
  presentation: {
    name: 'Presentation',
    description: 'Slide-like layout for presentations and decks',
    file: 'presentation.css',
  },
  'mmd-brand': {
    name: 'Make More Digital Brand',
    description: 'Make More Digital branded documents',
    file: 'mmd-brand.css',
  },
  invoice: {
    name: 'Invoice',
    description: 'Clean invoice and billing document style',
    file: 'invoice.css',
  },
  dark: {
    name: 'Dark',
    description: 'Dark mode theme for screen-friendly PDFs',
    file: 'dark.css',
  },
  academic: {
    name: 'Academic',
    description: 'Academic paper style (Times New Roman, double-spaced, citations-friendly)',
    file: 'academic.css',
  },
  report: {
    name: 'Report',
    description: 'Corporate report style with cover page support',
    file: 'report.css',
  },
  resume: {
    name: 'Resume',
    description: 'Clean CV/resume layout',
    file: 'resume.css',
  },
};

function listStyles() {
  console.log(chalk.bold('\n📚 Available Built-in Styles:\n'));
  
  for (const [key, style] of Object.entries(BUILT_IN_STYLES)) {
    console.log(`  ${chalk.cyan(key.padEnd(15))} ${chalk.white(style.name)}`);
    console.log(`  ${' '.repeat(15)} ${chalk.gray(style.description)}\n`);
  }
  
  console.log(chalk.gray('  Use with: docforge md input.md --style <name>\n'));
}

function getStylePath(styleName) {
  const style = BUILT_IN_STYLES[styleName];
  if (!style) {
    return null;
  }
  return path.join(STYLES_DIR, style.file);
}

function getStyleCss(styleName) {
  const stylePath = getStylePath(styleName);
  if (!stylePath || !fs.existsSync(stylePath)) {
    return null;
  }
  return fs.readFileSync(stylePath, 'utf8');
}

function resolveStylesheet(options) {
  // Priority: custom CSS > built-in style > default
  if (options.css) {
    const customPath = path.resolve(options.css);
    if (fs.existsSync(customPath)) {
      return { path: customPath, css: fs.readFileSync(customPath, 'utf8') };
    }
    throw new Error(`Custom CSS file not found: ${options.css}`);
  }
  
  if (options.style) {
    const stylePath = getStylePath(options.style);
    if (stylePath && fs.existsSync(stylePath)) {
      return { path: stylePath, css: fs.readFileSync(stylePath, 'utf8') };
    }
    throw new Error(`Unknown style: ${options.style}. Run 'docforge styles' to see available styles.`);
  }
  
  // Default to professional
  const defaultPath = getStylePath('professional');
  return { path: defaultPath, css: fs.readFileSync(defaultPath, 'utf8') };
}

module.exports = {
  BUILT_IN_STYLES,
  listStyles,
  getStylePath,
  getStyleCss,
  resolveStylesheet,
};

