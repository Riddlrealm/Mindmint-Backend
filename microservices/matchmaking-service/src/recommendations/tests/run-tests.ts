#!/usr/bin/env ts-node

/**
 * Test Runner for Recommendation System
 * 
 * Usage:
 *   npm run test:recommendations        # Run all tests
 *   npm run test:recommendations:unit   # Run unit tests only
 *   npm run test:recommendations:api    # Run API tests only
 *   npm run test:recommendations:perf   # Run performance tests
 */

import { execSync } from 'child_process';
import { runManualTests } from './manual-test.script';
import { runPerformanceTests } from './performance-test.script';

const testCommands = {
  unit: 'jest src/recommendations/tests/*.spec.ts',
  integration: 'jest src/recommendations/tests/*.integration.spec.ts',
  api: 'jest src/recommendations/tests/*controller*.spec.ts',
  all: 'jest src/recommendations/tests/',
};

async function runTests(testType: keyof typeof testCommands = 'all') {
  console.log(`🧪 Running ${testType} tests for Recommendation System...\n`);

  try {
    // Run Jest tests
    if (testType !== 'manual' && testType !== 'performance') {
      execSync(testCommands[testType], { stdio: 'inherit' });
    }

    // Run manual tests if requested
    if (testType === 'all' || testType === 'manual') {
      await runManualTests();
    }

    // Run performance tests if requested
    if (testType === 'all' || testType === 'performance') {
      await runPerformanceTests();
    }

  } catch (error) {
    console.error('❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const testType = process.argv[2] as keyof typeof testCommands;

if (require.main === module) {
  runTests(testType).catch(console.error);
}

export { runTests };