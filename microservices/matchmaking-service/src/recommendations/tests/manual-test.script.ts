/**
 * Manual Testing Script for Recommendation System
 * 
 * This script demonstrates how to manually test the recommendation system
 * Run this after setting up test data in your database
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { RecommendationEngineService } from '../services/recommendation-engine.service';
import { PreferenceTrackingService } from '../services/preference-tracking.service';
import { ABTestingService } from '../services/ab-testing.service';

async function runManualTests() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const recommendationEngine = app.get(RecommendationEngineService);
  const preferenceTracking = app.get(PreferenceTrackingService);
  const abTesting = app.get(ABTestingService);


  // Test 1: Generate recommendations for a new user
  try {
    const newUserRecommendations = await recommendationEngine.generateRecommendations(
      'new-user-test-123',
      5
    );
    console.log(`✅ Generated ${newUserRecommendations.length} recommendations for new user`);
  } catch (error) {
  }

  // Test 2: Test A/B group assignment
  try {
    const testGroup = abTesting.assignUserToTest('test-user-456', 0);
    console.log(`✅ User assigned to A/B test group: ${testGroup || 'No test group'}`);
  } catch (error) {
  }

  // Test 3: Track user interactions
  try {
    await recommendationEngine.trackInteraction(
      'test-user-789',
      'puzzle-123',
      'view'
    );
    
    await recommendationEngine.trackInteraction(
      'test-user-789',
      'puzzle-123',
      'click'
    );
    
    await recommendationEngine.trackInteraction(
      'test-user-789',
      'puzzle-123',
      'complete',
      4.5,
      { completionTime: 120, hintsUsed: 1 }
    );
    
  } catch (error) {
  }

  // Test 4: Record puzzle completion for preference learning
  try {
    await preferenceTracking.onPuzzleCompleted(
      'test-user-789',
      'puzzle-123',
      120, // completion time
      1,   // hints used
      2,   // attempts
      850  // score
    );
    
  } catch (error) {
  }

  // Test 5: Get user preference insights
  try {
    const insights = await preferenceTracking.getPreferenceInsights('test-user-789');
  } catch (error) {
  }

  // Test 6: Generate recommendations with filters
  try {
    const filteredRecommendations = await recommendationEngine.generateRecommendations(
      'test-user-789',
      3,
      'logic', // category filter
      'medium' // difficulty filter
    );
    console.log(`✅ Generated ${filteredRecommendations.length} filtered recommendations`);
  } catch (error) {
  }

  // Test 7: Get recommendation metrics
  try {
    const metrics = await recommendationEngine.getRecommendationMetrics();
  } catch (error) {
  }

  // Test 8: A/B test results
  try {
    const activeTests = await abTesting.getActiveTests();
    
    if (activeTests.length > 0) {
      const testResults = await abTesting.getTestResults(activeTests[0]);
    }
  } catch (error) {
  }

  await app.close();
}

// Utility function to create test data
async function createTestData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  
  // This would create sample users, puzzles, and interactions
  // You would implement this based on your specific data models
  
  await app.close();
}

// Run the tests
if (require.main === module) {
  runManualTests().catch(console.error);
}

export { runManualTests, createTestData };