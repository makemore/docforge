const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const ora = require('ora');
const { resolveStylesheet } = require('./styles');
const glob = require('glob');

/**
 * Merge multiple markdown files into a single PDF
 */
async function mergeMarkdownFiles(patterns, options = {}) {
  const spinner = ora('Collecting files...').start();
  
  try {
    // Resolve all file patterns to actual files
    let files = [];
    
    for (const pattern of patterns) {
      if (glob.hasMagic(pattern)) {
        // It's a glob pattern
        const matches = glob.sync(pattern, { nodir: true });
        files.push(...matches);
      } else if (fs.existsSync(pattern)) {
        files.push(pattern);
      } else {
        spinner.warn(`File not found: ${pattern}`);
      }
    }
    
    // Filter to only .md files and remove duplicates
    files = [...new Set(files)].filter(f => f.endsWith('.md'));
    
    if (files.length === 0) {
      spinner.fail('No markdown files found');
      return false;
    }
    
    // Sort files if requested
    if (options.sort) {
      files.sort();
    }
    
    spinner.text = `Found ${files.length} files to merge`;
    
    // Read and combine all markdown content
    let combinedContent = '';
    const tocEntries = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = fs.readFileSync(file, 'utf8');
      
      // Extract first heading for TOC
      const headingMatch = content.match(/^#\s+(.+)$/m);
      const title = headingMatch ? headingMatch[1] : path.basename(file, '.md');
      const anchor = `file-${i}`;
      
      tocEntries.push({ title, anchor, file });
      
      // Add page break between files (except before first)
      if (i > 0) {
        combinedContent += '\n\n<div style="page-break-before: always;"></div>\n\n';
      }
      
      // Add anchor for TOC linking
      combinedContent += `<a id="${anchor}"></a>\n\n`;
      combinedContent += content;
      combinedContent += '\n\n';
    }
    
    // Generate TOC if requested
    if (options.toc) {
      let tocContent = '# Table of Contents\n\n';
      tocEntries.forEach((entry, index) => {
        tocContent += `${index + 1}. [${entry.title}](#${entry.anchor})\n`;
      });
      tocContent += '\n<div style="page-break-before: always;"></div>\n\n';
      combinedContent = tocContent + combinedContent;
    }
    
    // Resolve output path
    const outputPath = options.output || 'merged.pdf';
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (outputDir && outputDir !== '.' && !fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    spinner.text = 'Generating PDF...';
    
    // Resolve stylesheet
    const { path: stylePath } = resolveStylesheet(options);
    
    // Build PDF options
    const pdfOptions = {
      stylesheet: stylePath ? [stylePath] : [],
      css: buildMergeCss(options),
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
    
    const pdf = await mdToPdf({ content: combinedContent }, pdfOptions);
    
    if (pdf) {
      fs.writeFileSync(outputPath, pdf.content);
      spinner.succeed(
        `${chalk.green('✓')} Merged ${files.length} files → ${chalk.cyan(outputPath)}`
      );
      
      // List merged files
      console.log(chalk.gray('\n  Files merged:'));
      files.forEach((f, i) => {
        console.log(chalk.gray(`    ${i + 1}. ${f}`));
      });
      console.log('');
      
      return true;
    }
    
    spinner.fail('Failed to generate PDF');
    return false;
    
  } catch (error) {
    spinner.fail(`Error: ${error.message}`);
    return false;
  }
}

function buildMergeCss(options) {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    @page {
      margin: 25mm 20mm;
      size: ${options.format || 'A4'}${options.landscape ? ' landscape' : ''};
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `;
}

module.exports = { mergeMarkdownFiles };

