#!/usr/bin/env node

/**
 * Validates and reports unclosed quotes in JSON files
 * Usage: node scripts/validate-json-quotes.js <file-path>
 */

const fs = require('fs');
const path = require('path');

function validateQuotes(filePath) {
  console.log(`\n🔍 Validating quotes in: ${filePath}\n`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let issues = [];
  let inString = false;
  let escaped = false;
  
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    let quoteCount = 0;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const prevChar = i > 0 ? line[i - 1] : null;
      
      // Check for unescaped quotes
      if (char === '"' && prevChar !== '\\') {
        quoteCount++;
        inString = !inString;
      }
      // Handle escaped backslashes (\\")
      else if (char === '\\' && prevChar === '\\') {
        escaped = !escaped;
      }
    }
    
    // Check if line has odd number of unescaped quotes
    if (quoteCount % 2 !== 0) {
      issues.push({
        line: lineNum + 1,
        content: line.trim(),
        quoteCount
      });
    }
  }
  
  // Try to parse as JSON
  let parseError = null;
  try {
    JSON.parse(content);
    console.log('✅ File is valid JSON!\n');
  } catch (error) {
    parseError = error;
    console.log('❌ JSON Parse Error:');
    console.log(`   ${error.message}\n`);
  }
  
  // Report issues
  if (issues.length > 0) {
    console.log(`⚠️  Found ${issues.length} line(s) with odd quote counts:\n`);
    issues.forEach(issue => {
      console.log(`   Line ${issue.line}: ${issue.quoteCount} quotes`);
      console.log(`   ${issue.content.substring(0, 100)}${issue.content.length > 100 ? '...' : ''}`);
      console.log('');
    });
  } else if (!parseError) {
    console.log('✅ All quotes are properly balanced!\n');
  }
  
  // Additional validation: check for common issues
  const commonIssues = [];
  
  // Check for unescaped quotes in strings
  const unescapedQuotePattern = /:\s*"[^"]*[^\\]"[^"]*"/g;
  lines.forEach((line, idx) => {
    if (line.includes('\\"') && line.includes('"')) {
      // Check for patterns like: "text with \" more text" (missing closing quote)
      const matches = line.match(/"[^"]*\\"/g);
      if (matches) {
        matches.forEach(match => {
          if (!match.endsWith('\\"')) {
            commonIssues.push({
              line: idx + 1,
              type: 'Potential unclosed quote after escape',
              content: line.trim()
            });
          }
        });
      }
    }
  });
  
  if (commonIssues.length > 0) {
    console.log(`\n⚠️  Found ${commonIssues.length} potential issue(s):\n`);
    commonIssues.forEach(issue => {
      console.log(`   Line ${issue.line}: ${issue.type}`);
      console.log(`   ${issue.content.substring(0, 100)}${issue.content.length > 100 ? '...' : ''}`);
      console.log('');
    });
  }
  
  return {
    valid: !parseError && issues.length === 0,
    issues,
    parseError,
    commonIssues
  };
}

// Main execution
if (require.main === module) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('Usage: node validate-json-quotes.js <file-path>');
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  
  const result = validateQuotes(filePath);
  process.exit(result.valid ? 0 : 1);
}

module.exports = { validateQuotes };
