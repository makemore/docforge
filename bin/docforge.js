#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { version, description } = require('../package.json');
const { convertMarkdown } = require('../src/markdown');
const { convertHtml } = require('../src/html');
const { loadConfig, loadGlobalConfig, saveGlobalConfig, getGlobalConfigPath, DEFAULT_CONFIG } = require('../src/config');
const { listStyles, getStylePath, BUILT_IN_STYLES } = require('../src/styles');
const { mergeMarkdownFiles } = require('../src/merge');

// ASCII art banner
const banner = `
${chalk.hex('#ff625a')('╔═══════════════════════════════════════╗')}
${chalk.hex('#ff625a')('║')}  ${chalk.bold.white('🔥 DOCFORGE')}                          ${chalk.hex('#ff625a')('║')}
${chalk.hex('#ff625a')('║')}  ${chalk.gray('Forge beautiful PDFs from docs')}        ${chalk.hex('#ff625a')('║')}
${chalk.hex('#ff625a')('╚═══════════════════════════════════════╝')}
`;

program
  .name('docforge')
  .description(description)
  .version(version, '-v, --version');

// Markdown to PDF command
program
  .command('md <input>')
  .alias('markdown')
  .description('Convert Markdown file(s) to PDF')
  .option('-o, --output <path>', 'Output file or directory')
  .option('-s, --style <name>', 'Built-in style (minimal, professional, presentation, mmd-brand)')
  .option('-c, --css <path>', 'Custom CSS stylesheet path')
  .option('-w, --watch', 'Watch for changes and regenerate')
  .option('--format <size>', 'Page format (A4, Letter, etc.)', 'A4')
  .option('--landscape', 'Use landscape orientation')
  .option('--no-header-footer', 'Disable header and footer')
  .option('--toc', 'Generate table of contents')
  .action(async (input, options) => {
    console.log(banner);
    const config = await loadConfig();
    await convertMarkdown(input, { ...config, ...options });
  });

// HTML to PDF command
program
  .command('html <input>')
  .description('Convert HTML file(s) to PDF')
  .option('-o, --output <path>', 'Output file or directory')
  .option('-s, --style <name>', 'Built-in style to inject (minimal, professional, presentation)')
  .option('-c, --css <path>', 'Custom CSS stylesheet path')
  .option('-w, --watch', 'Watch for changes and regenerate')
  .option('--format <size>', 'Page format (A4, Letter, etc.)', 'A4')
  .option('--landscape', 'Use landscape orientation')
  .option('--wait <ms>', 'Wait time before capture (for JS rendering)', '0')
  .option('--selector <css>', 'Wait for specific CSS selector before capture')
  .action(async (input, options) => {
    console.log(banner);
    const config = await loadConfig();
    await convertHtml(input, { ...config, ...options });
  });

// List available styles
program
  .command('styles')
  .description('List available built-in styles')
  .action(() => {
    console.log(banner);
    listStyles();
  });

// Global config command
program
  .command('config [key] [value]')
  .description('Get or set global configuration')
  .option('--list', 'List all global config values')
  .option('--reset', 'Reset global config to defaults')
  .option('--path', 'Show config file path')
  .action((key, value, options) => {
    console.log(banner);

    // Show config file path
    if (options.path) {
      console.log(chalk.cyan('Global config path:'), getGlobalConfigPath());
      return;
    }

    // Reset config
    if (options.reset) {
      saveGlobalConfig({});
      console.log(chalk.green('✅ Global config reset to defaults'));
      return;
    }

    const globalConfig = loadGlobalConfig();

    // List all config
    if (options.list || (!key && !value)) {
      console.log(chalk.bold('Global Configuration:\n'));
      const effectiveConfig = { ...DEFAULT_CONFIG, ...globalConfig };

      for (const [k, v] of Object.entries(effectiveConfig)) {
        if (typeof v === 'object') {
          console.log(`  ${chalk.cyan(k)}:`);
          for (const [subK, subV] of Object.entries(v)) {
            const isCustom = globalConfig[k]?.[subK] !== undefined;
            console.log(`    ${chalk.gray(subK)}: ${subV}${isCustom ? chalk.yellow(' (custom)') : ''}`);
          }
        } else {
          const isCustom = globalConfig[k] !== undefined;
          console.log(`  ${chalk.cyan(k)}: ${v}${isCustom ? chalk.yellow(' (custom)') : ''}`);
        }
      }
      console.log(chalk.gray(`\n  Config file: ${getGlobalConfigPath()}`));
      return;
    }

    // Get a specific value
    if (key && !value) {
      const effectiveConfig = { ...DEFAULT_CONFIG, ...globalConfig };
      if (key in effectiveConfig) {
        const val = effectiveConfig[key];
        if (typeof val === 'object') {
          console.log(`${chalk.cyan(key)}:`, JSON.stringify(val, null, 2));
        } else {
          console.log(`${chalk.cyan(key)}: ${val}`);
        }
      } else {
        console.log(chalk.yellow(`Unknown config key: ${key}`));
        console.log(chalk.gray('Valid keys: ' + Object.keys(DEFAULT_CONFIG).join(', ')));
      }
      return;
    }

    // Set a value
    if (key && value) {
      // Validate style if setting style
      if (key === 'style') {
        if (!BUILT_IN_STYLES[value]) {
          console.log(chalk.red(`Unknown style: ${value}`));
          console.log(chalk.gray('Available styles: ' + Object.keys(BUILT_IN_STYLES).join(', ')));
          return;
        }
      }

      // Parse value (handle booleans and numbers)
      let parsedValue = value;
      if (value === 'true') parsedValue = true;
      else if (value === 'false') parsedValue = false;
      else if (!isNaN(value) && value !== '') parsedValue = Number(value);

      globalConfig[key] = parsedValue;
      saveGlobalConfig(globalConfig);
      console.log(chalk.green(`✅ Set ${chalk.cyan(key)} = ${parsedValue}`));
    }
  });

// Init config file
program
  .command('init')
  .description('Create a docforge.config.js file in current directory')
  .action(async () => {
    console.log(banner);
    const fs = require('fs');
    const configTemplate = `// docforge.config.js
module.exports = {
  // Default style for all conversions
  style: 'professional',
  
  // PDF options
  format: 'A4',
  landscape: false,
  
  // Markdown-specific options
  markdown: {
    toc: false,
    headerFooter: true,
  },
  
  // HTML-specific options  
  html: {
    wait: 0,
    selector: null,
  },
  
  // Custom CSS to inject (in addition to style)
  customCss: '',
};
`;
    
    if (fs.existsSync('docforge.config.js')) {
      console.log(chalk.yellow('⚠️  docforge.config.js already exists'));
      return;
    }
    
    fs.writeFileSync('docforge.config.js', configTemplate);
    console.log(chalk.green('✅ Created docforge.config.js'));
  });

// Merge multiple markdown files into single PDF
program
  .command('merge <files...>')
  .description('Merge multiple markdown files into a single PDF')
  .option('-o, --output <path>', 'Output PDF file', 'merged.pdf')
  .option('-s, --style <name>', 'Built-in style')
  .option('-c, --css <path>', 'Custom CSS stylesheet path')
  .option('--toc', 'Generate table of contents')
  .option('--sort', 'Sort files alphabetically')
  .option('--format <size>', 'Page format (A4, Letter, etc.)', 'A4')
  .option('--landscape', 'Use landscape orientation')
  .option('--no-auto-page-break', 'Disable automatic page breaks between merged files')
  .action(async (files, options) => {
    console.log(banner);
    const config = await loadConfig();
    await mergeMarkdownFiles(files, { ...config, ...options });
  });

// Batch conversion command
program
  .command('batch <pattern>')
  .description('Convert multiple files matching a glob pattern')
  .option('-o, --output <dir>', 'Output directory', './pdf')
  .option('-t, --type <type>', 'Input type (md or html)', 'md')
  .option('-s, --style <name>', 'Built-in style')
  .option('-c, --css <path>', 'Custom CSS stylesheet path')
  .action(async (pattern, options) => {
    console.log(banner);
    const config = await loadConfig();
    const glob = require('path');
    const fs = require('fs');

    // Simple glob matching
    const files = fs.readdirSync('.').filter(f => {
      if (options.type === 'md') return f.endsWith('.md');
      if (options.type === 'html') return f.endsWith('.html') || f.endsWith('.htm');
      return false;
    });

    console.log(chalk.cyan(`📁 Found ${files.length} files to convert\n`));

    for (const file of files) {
      if (options.type === 'md') {
        await convertMarkdown(file, { ...config, ...options });
      } else {
        await convertHtml(file, { ...config, ...options });
      }
    }
  });

program.parse();

