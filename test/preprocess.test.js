/**
 * Tests for the preprocess module
 */

const { applyPageBreaks, hasPageBreaks, PAGE_BREAK_CSS } = require('../src/preprocess');
const fs = require('fs');
const path = require('path');

describe('applyPageBreaks', () => {
  test('replaces \\newpage on its own line', () => {
    const input = `# Section A

Some text.

\\newpage

# Section B

More text.`;

    const output = applyPageBreaks(input);
    
    expect(output).toContain('<div class="page-break"></div>');
    expect(output).not.toContain('\\newpage');
  });

  test('replaces \\pagebreak on its own line', () => {
    const input = `# Section A

\\pagebreak

# Section B`;

    const output = applyPageBreaks(input);
    
    expect(output).toContain('<div class="page-break"></div>');
    expect(output).not.toContain('\\pagebreak');
  });

  test('handles leading/trailing whitespace on page break lines', () => {
    const input = `# Section A

   \\newpage   

# Section B`;

    const output = applyPageBreaks(input);
    
    expect(output).toContain('<div class="page-break"></div>');
    expect(output).not.toContain('\\newpage');
  });

  test('handles tabs around page break markers', () => {
    const input = `# Section A

\t\\pagebreak\t

# Section B`;

    const output = applyPageBreaks(input);
    
    expect(output).toContain('<div class="page-break"></div>');
  });

  test('does not replace inline \\newpage', () => {
    const input = 'Use \\newpage to insert a page break.';
    const output = applyPageBreaks(input);
    
    // Should keep original since it's inline, not on its own line
    expect(output).toBe(input);
  });

  test('handles multiple page breaks', () => {
    const input = `# A

\\newpage

# B

\\pagebreak

# C`;

    const output = applyPageBreaks(input);
    const matches = output.match(/<div class="page-break"><\/div>/g);
    
    expect(matches).toHaveLength(2);
  });

  test('returns empty/null content unchanged', () => {
    expect(applyPageBreaks('')).toBe('');
    expect(applyPageBreaks(null)).toBe(null);
    expect(applyPageBreaks(undefined)).toBe(undefined);
  });

  test('processes the test fixture correctly', () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'page-breaks.md');
    const content = fs.readFileSync(fixturePath, 'utf8');
    const output = applyPageBreaks(content);
    
    // Should have 2 page breaks (one \newpage and one \pagebreak)
    const matches = output.match(/<div class="page-break"><\/div>/g);
    expect(matches).toHaveLength(2);
    
    // Original markers should be gone
    expect(output).not.toMatch(/^[ \t]*\\newpage[ \t]*$/m);
    expect(output).not.toMatch(/^[ \t]*\\pagebreak[ \t]*$/m);
  });
});

describe('hasPageBreaks', () => {
  test('returns true when content has \\newpage', () => {
    expect(hasPageBreaks('text\n\\newpage\nmore')).toBe(true);
  });

  test('returns true when content has \\pagebreak', () => {
    expect(hasPageBreaks('text\n\\pagebreak\nmore')).toBe(true);
  });

  test('returns false for content without page breaks', () => {
    expect(hasPageBreaks('just normal content')).toBe(false);
  });

  test('returns false for null/empty content', () => {
    expect(hasPageBreaks(null)).toBe(false);
    expect(hasPageBreaks('')).toBe(false);
  });
});

describe('PAGE_BREAK_CSS', () => {
  test('contains required CSS properties', () => {
    expect(PAGE_BREAK_CSS).toContain('page-break-after: always');
    expect(PAGE_BREAK_CSS).toContain('break-after: page');
    expect(PAGE_BREAK_CSS).toContain('.page-break');
  });
});
