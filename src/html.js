const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const ora = require('ora');
const { resolveStylesheet } = require('./styles');

async function convertHtml(input, options = {}) {
  const spinner = ora(`Converting ${input}`).start();
  
  let browser;
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
        outputPath = path.join(options.output, path.basename(input).replace(/\.html?$/, '') + '.pdf');
      } else {
        outputPath = options.output;
      }
    } else {
      outputPath = inputPath.replace(/\.html?$/, '.pdf');
    }
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    
    // Load HTML file
    const htmlContent = fs.readFileSync(inputPath, 'utf8');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Inject stylesheet if specified
    if (options.style || options.css) {
      try {
        const { css } = resolveStylesheet(options);
        if (css) {
          await page.addStyleTag({ content: css });
        }
      } catch (e) {
        // Style not found, continue without
      }
    }
    
    // Add custom CSS
    if (options.customCss) {
      await page.addStyleTag({ content: options.customCss });
    }
    
    // Wait if specified
    const waitTime = parseInt(options.wait) || 0;
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Wait for selector if specified
    if (options.selector) {
      await page.waitForSelector(options.selector, { timeout: 30000 });
    }
    
    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: options.format || 'A4',
      landscape: options.landscape || false,
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });
    
    spinner.succeed(`${chalk.green('✓')} ${path.basename(input)} → ${chalk.cyan(path.basename(outputPath))}`);
    return true;
    
  } catch (error) {
    spinner.fail(`Error: ${error.message}`);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { convertHtml };

