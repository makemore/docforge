const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const ora = require('ora');
const { resolveStylesheet } = require('./styles');

async function convertMarkdown(input, options = {}) {
  const spinner = ora(`Converting ${input}`).start();
  
  try {
    const inputPath = path.resolve(input);
    
    if (!fs.existsSync(inputPath)) {
      spinner.fail(`File not found: ${input}`);
      return false;
    }
    
    // Resolve output path
    let outputPath;
    if (options.output) {
      const outputStat = fs.existsSync(options.output) && fs.statSync(options.output);
      if (outputStat && outputStat.isDirectory()) {
        outputPath = path.join(options.output, path.basename(input, '.md') + '.pdf');
      } else {
        outputPath = options.output;
      }
    } else {
      outputPath = inputPath.replace(/\.md$/, '.pdf');
    }
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Resolve stylesheet
    const { path: stylePath, css: styleCss } = resolveStylesheet(options);
    
    // Build PDF options
    const pdfOptions = {
      stylesheet: stylePath ? [stylePath] : [],
      css: buildPrintCss(options),
      pdf_options: {
        format: options.format || 'A4',
        landscape: options.landscape || false,
        margin: {
          top: '25mm',
          right: '20mm',
          bottom: '25mm',
          left: '20mm',
        },
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: options.headerFooter !== false,
      },
      launch_options: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      marked_options: {
        gfm: true,
        breaks: false,
        headerIds: true,
      },
    };
    
    // Add custom CSS if provided
    if (options.customCss) {
      pdfOptions.css += '\n' + options.customCss;
    }
    
    const pdf = await mdToPdf({ path: inputPath }, pdfOptions);
    
    if (pdf) {
      fs.writeFileSync(outputPath, pdf.content);
      spinner.succeed(`${chalk.green('✓')} ${path.basename(input)} → ${chalk.cyan(path.basename(outputPath))}`);
      return true;
    }
    
    spinner.fail(`Failed to convert ${input}`);
    return false;
    
  } catch (error) {
    spinner.fail(`Error: ${error.message}`);
    return false;
  }
}

function buildPrintCss(options) {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    @page {
      margin: 25mm 20mm;
      size: ${options.format || 'A4'}${options.landscape ? ' landscape' : ''};
      
      @bottom-center {
        content: counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 10px;
        color: #6b7280;
      }
    }
    
    @page :first {
      @bottom-center {
        content: none;
      }
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      h1, h2, h3 {
        page-break-after: avoid;
      }
      
      table, pre, blockquote {
        page-break-inside: avoid;
      }
    }
  `;
}

module.exports = { convertMarkdown };

