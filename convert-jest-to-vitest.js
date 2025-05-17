#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const testsDir = path.join(__dirname, 'tests');

// Ensure vitest is imported at the top of each file
function addVitestImport(content) {
  // Check if vitest is already imported
  if (content.includes('import { describe, it, expect, beforeEach, vi } from \'vitest\';')) {
    return content;
  }

  // If not already imported, add the import
  return content.replace(
    /(import.*?;(\r?\n)+)/,
    '$1import { describe, it, expect, beforeEach, vi } from \'vitest\';\n\n'
  );
}

// Replace global.fetch mock initialization
function updateGlobalFetchMock(content) {
  return content.replace(
    /global\.fetch = jest\.fn\(\);/g,
    'global.fetch = vi.fn();'
  );
}

// Replace jest.Mock type with ReturnType<typeof vi.fn>
function updateMockTypes(content) {
  return content
    .replace(/\(global\.fetch as jest\.Mock\)/g, '(global.fetch as ReturnType<typeof vi.fn>)')
    .replace(/\(global\.fetch as any\)/g, '(global.fetch as ReturnType<typeof vi.fn>)');
}

// Replace jest timer functions
function updateTimerFunctions(content) {
  return content
    .replace(/jest\.useFakeTimers\(\);/g, 'vi.useFakeTimers();')
    .replace(/jest\.useRealTimers\(\);/g, 'vi.useRealTimers();')
    .replace(/jest\.advanceTimersByTime\(([^)]+)\);/g, 'vi.advanceTimersByTime($1);');
}

// Process a single file
function processFile(filePath) {
  console.log(`Processing ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Apply transformations
    content = addVitestImport(content);
    content = updateGlobalFetchMock(content);
    content = updateMockTypes(content);
    content = updateTimerFunctions(content);
    
    // Write back to file
    fs.writeFileSync(filePath, content);
    console.log(`Successfully updated ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Process all test files
function processDirectory(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.name.endsWith('.test.ts')) {
      processFile(fullPath);
    }
  }
}

// Start processing
processDirectory(testsDir);
console.log('Done! All test files have been updated to use Vitest.');
