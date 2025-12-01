#!/usr/bin/env node

/**
 * Attempts to fix unclosed quotes in JSON files
 * Usage: node scripts/fix-json-quotes.js <file-path> [--dry-run]
 */

const fs = require('fs');
const path = require('path');

function findUnclosedQuotes(content) {
  const lines = content.split('\n');
  const issues = [];
  
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    let quoteCount = 0;
    let lastQuotePos = -1;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const prevChar = i > 0 ? line[i - 1] : null;
      
      // Count unescaped quotes
      if (char === '"') {
        // Check if it's escaped (but not double-escaped like \\")
        let escapeCount = 0;
        let checkPos = i - 1;
        while (checkPos >= 0 && line[checkPos] === '\\') {
          escapeCount++;
          checkPos--;
        }
        
        // If even number of backslashes (including 0), quote is not escaped
        if (escapeCount % 2 === 0) {
          quoteCount++;
          lastQuotePos = i;
        }
      }
    }
    
    // Odd number of quotes means unclosed
    if (quoteCount % 2 !== 0) {
      issues.push({
        lineNum,
        line,
        quoteCount,
        lastQuotePos
      });
    }
  }
  
  return issues;
}

function fixUnclosedQuotes(filePath, dryRun = false) {
  console.log(`\n🔧 ${dryRun ? 'Analyzing' : 'Fixing'} quotes in: ${filePath}\n`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = findUnclosedQuotes(content);
  
  if (issues.length === 0) {
    console.log('✅ No unclosed quotes found!\n');
    
    // Still try to parse
    try {
      JSON.parse(content);
      console.log('✅ File is valid JSON!\n');
      return { fixed: false, valid: true };
    } catch (error) {
      console.log('❌ JSON Parse Error (but quotes are balanced):');
      console.log(`   ${error.message}\n`);
      return { fixed: false, valid: false, error };
    }
  }
  
  console.log(`Found ${issues.length} line(s) with unclosed quotes:\n`);
  
  const fixedLines = [...lines];
  let fixCount = 0;
  
  issues.forEach(issue => {
    const { lineNum, line, quoteCount, lastQuotePos } = issue;
    console.log(`   Line ${lineNum + 1}: ${quoteCount} quotes`);
    console.log(`   Original: ${line.trim().substring(0, 80)}${line.length > 80 ? '...' : ''}`);
    
    // Strategy: Add closing quote at end of line (before comma or closing bracket)
    let fixedLine = line;
    
    // Find the end position (before trailing comma, bracket, or brace)
    const trimmed = line.trimEnd();
    const lastChar = trimmed[trimmed.length - 1];
    
    if (lastChar === ',' || lastChar === ']' || lastChar === '}') {
      // Insert quote before the last character
      fixedLine = trimmed.slice(0, -1) + '"' + lastChar;
      // Preserve original whitespace
      const trailingWhitespace = line.substring(trimmed.length);
      fixedLine += trailingWhitespace;
    } else {
      // Just add quote at the end
      fixedLine = trimmed + '"';
      const trailingWhitespace = line.substring(trimmed.length);
      fixedLine += trailingWhitespace;
    }
    
    console.log(`   Fixed:    ${fixedLine.trim().substring(0, 80)}${fixedLine.length > 80 ? '...' : ''}`);
    console.log('');
    
    fixedLines[lineNum] = fixedLine;
    fixCount++;
  });
  
  const fixedContent = fixedLines.join('\n');
  
  // Validate the fixed content
  let isValid = false;
  try {
    JSON.parse(fixedContent);
    isValid = true;
    console.log(`✅ Fixed content is valid JSON!\n`);
  } catch (error) {
    console.log(`⚠️  Fixed content still has JSON errors:`);
    console.log(`   ${error.message}\n`);
  }
  
  if (!dryRun && fixCount > 0) {
    // Create backup
    const backupPath = filePath + '.backup';
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log(`📦 Backup created: ${backupPath}`);
    
    // Write fixed content
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`💾 Fixed file written: ${filePath}`);
    console.log(`   Fixed ${fixCount} line(s)\n`);
  } else if (dryRun) {
    console.log(`🔍 Dry run complete. Would fix ${fixCount} line(s).\n`);
    console.log(`   Run without --dry-run to apply fixes.\n`);
  }
  
  return {
    fixed: fixCount > 0,
    fixCount,
    valid: isValid,
    issues
  };
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const filePath = args.find(arg => !arg.startsWith('--'));
  const dryRun = args.includes('--dry-run');
  
  if (!filePath) {
    console.error('Usage: node fix-json-quotes.js <file-path> [--dry-run]');
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  
  const result = fixUnclosedQuotes(filePath, dryRun);
  process.exit(result.valid ? 0 : 1);
}

module.exports = { fixUnclosedQuotes, findUnclosedQuotes };
