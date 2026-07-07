/**
 * Performance Testing Script for Recommendation System
 * 
 * Tests the performance of recommendation generation under various loads
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { RecommendationEngineService } from '../services/recommendation-engine.service';
interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
}
async function runPerformanceTests() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const recommendationEngine = app.get(RecommendationEngineService);
  // Test 1: Single user recommendation performance
  const singleUserMetrics = await testSingleUserPerformance(recommendationEngine);
  // Test 2: Concurrent user recommendations
  const concurrentMetrics = await testConcurrentRecommendations(recommendationEngine, 10);
  // Test 3: High load test
  const highLoadMetrics = await testConcurrentRecommendations(recommendationEngine, 50);
  // Test 4: Algorithm comparison performance
  await testAlgorithmPerformance(recommendationEngine);
  await app.close();
}
async function testSingleUserPerformance(
  service: RecommendationEngineService,
  iterations: number = 100
): Promise<PerformanceMetrics> {
  const responseTimes: number[] = [];
  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();
  for (let i = 0; i < iterations; i++) {
    const requestStart = Date.now();
    try {
      await service.generateRecommendations(`test-user-${i}`, 10);
      const responseTime = Date.now() - requestStart;
      responseTimes.push(responseTime);
      successCount++;
    } catch (error) {
      failCount++;
      ;
    }
  }
  const totalTime = Date.now() - startTime;
  const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  return {
    totalRequests: iterations,
    successfulRequests: successCount,
    failedRequests: failCount,
    averageResponseTime: Math.round(averageResponseTime),
    minResponseTime: Math.min(...responseTimes),
    maxResponseTime: Math.max(...responseTimes),
    requestsPerSecond: Math.round((successCount / totalTime) * 1000),
  };
}
async function testConcurrentRecommendations(
  service: RecommendationEngineService,
  concurrentUsers: number
): Promise<PerformanceMetrics> {
  const promises: Promise<number>[] = [];
  const startTime = Date.now();
  // Create concurrent requests
  for (let i = 0; i < concurrentUsers; i++) {
    const promise = measureRecommendationTime(service, `concurrent-user-${i}`);
    promises.push(promise);
  }
  // Wait for all requests to complete
  const results = await Promise.allSettled(promises);
  const totalTime = Date.now() - startTime;
  const successfulResults = results
    .filter(result => result.status === 'fulfilled')
    .map(result => (result as PromiseFulfilledResult<number>).value);
  const failedCount = results.filter(result => result.status === 'rejected').length;
  if (successfulResults.length === 0) {
    return {
      totalRequests: concurrentUsers,
      successfulRequests: 0,
      failedRequests: failedCount,
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      requestsPerSecond: 0,
    };
  }
  const averageResponseTime = successfulResults.reduce((a, b) => a + b, 0) / successfulResults.length;
  return {
    totalRequests: concurrentUsers,
    successfulRequests: successfulResults.length,
    failedRequests: failedCount,
    averageResponseTime: Math.round(averageResponseTime),
    minResponseTime: Math.min(...successfulResults),
    maxResponseTime: Math.max(...successfulResults),
    requestsPerSecond: Math.round((successfulResults.length / totalTime) * 1000),
  };
}
async function measureRecommendationTime(
  service: RecommendationEngineService,
  userId: string
): Promise<number> {
  const startTime = Date.now();
  await service.generateRecommendations(userId, 10);
  return Date.now() - startTime;
}
async function testAlgorithmPerformance(service: RecommendationEngineService) {
  const algorithms = ['collaborative', 'content-based', 'hybrid', 'popular'] as const;
  const userId = 'performance-test-user';
  for (const algorithm of algorithms) {
    const times: number[] = [];
    // Test each algorithm 10 times
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      try {
        await service.generateRecommendations(userId, 10, undefined, undefined, algorithm);
        times.push(Date.now() - startTime);
      } catch (error) {
        ;
      }
    }
    if (times.length > 0) {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      }ms average (${times.length}/10 successful)`);
    } else {
      ;
    }
  }
}
// Memory usage monitoring
function logMemoryUsage(label: string) {
  const usage = process.memoryUsage();
  ;
  }MB`);
  }MB`);
  }MB`);
}
// Run performance tests
if (require.main === module) {
  logMemoryUsage('Before Tests');
  runPerformanceTests()
    .then(() => {
      logMemoryUsage('After Tests');
    })
    .catch(console.error);
}
export { runPerformanceTests, testSingleUserPerformance, testConcurrentRecommendations };