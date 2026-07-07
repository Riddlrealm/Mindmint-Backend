#!/usr/bin/env node
/**
 * Puzzle Engine Demo Script
 *
 * This script demonstrates the core functionality of the puzzle engine:
 * - Puzzle generation for different types and difficulties
 * - Interactive puzzle solving
 * - Scoring and achievements system
 * - Hint system integration
 *
 * Run with: npm run demo:puzzle-engine
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { PuzzleGeneratorService } from '../services/puzzle-generator.service';
import { PuzzleRegistryService } from '../services/puzzle-registry.service';
import { ScoringService } from '../services/scoring.service';
import { AchievementsService } from '../services/achievements.service';
import { PuzzleType, DifficultyLevel } from '../types/puzzle.types';
import { PerformanceMetrics } from '../interfaces/puzzle.interfaces';
import { Logger } from '@nestjs/common';
const logger = new Logger('PuzzleEngineDemo');
async function main() {
  // Initialize NestJS app
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    // Get services
    const puzzleGenerator = app.get(PuzzleGeneratorService);
    const puzzleRegistry = app.get(PuzzleRegistryService);
    const scoringService = app.get(ScoringService);
    const achievementsService = app.get(AchievementsService);
    // Initialize puzzle registry
    await puzzleRegistry.onModuleInit();
    // Demo 1: Generate different puzzle types
    const puzzleTypes = [
      PuzzleType.LOGIC_GRID,
      PuzzleType.SEQUENCE,
      PuzzleType.SPATIAL,
    ];
    const difficulties = [
      DifficultyLevel.BEGINNER,
      DifficultyLevel.MEDIUM,
      DifficultyLevel.HARD,
    ];
    for (const type of puzzleTypes) {
      for (const difficulty of difficulties) {
        try {
          const puzzle = await puzzleGenerator.generatePuzzle(
            type,
            difficulty,
            {
              seed: Math.floor(Math.random() * 10000),
            },
          );
          :`);
          ;
          console.log(
            `   Time Limit: ${puzzle.timeLimit ? puzzle.timeLimit / 1000 + 's' : 'None'}`,
          );
          ;
          const currentState = puzzle.getState();
          if (type === PuzzleType.SEQUENCE) {
            console.log(
              `   Sequence Length: ${Array.isArray(currentState.currentState?.sequence) ? currentState.currentState.sequence.length : 'N/A'}`,
            );
          } else if (type === PuzzleType.SPATIAL) {
            console.log(
              `   Grid Size: ${currentState.currentState?.width || 'N/A'}x${currentState.currentState?.height || 'N/A'}`,
            );
            console.log(
              `   Player Position: (${currentState.currentState?.playerPosition?.x || 0}, ${currentState.currentState?.playerPosition?.y || 0})`,
            );
          } else if (type === PuzzleType.LOGIC_GRID) {
            console.log(
              `   Grid Size: ${currentState.currentState?.width || 'N/A'}x${currentState.currentState?.height || 'N/A'}`,
            );
            ;
          }
        } catch (error) {
          console.log(
            `❌ Failed to generate ${type} at difficulty ${difficulty}: ${error.message}`,
          );
        }
      }
    }
    // Demo 2: Scoring System
    const testPuzzle = await puzzleGenerator.generatePuzzle(
      PuzzleType.SEQUENCE,
      DifficultyLevel.MEDIUM,
      { seed: 12345 },
    );
    // Simulate different performance scenarios
    const performanceScenarios = [
      {
        name: 'Perfect Performance',
        timeSpent: 60000, // 1 minute
        movesUsed: 1,
        hintsUsed: 0,
        streak: 5,
      },
      {
        name: 'Good Performance',
        timeSpent: 120000, // 2 minutes
        movesUsed: 3,
        hintsUsed: 1,
        streak: 2,
      },
      {
        name: 'Average Performance',
        timeSpent: 300000, // 5 minutes
        movesUsed: 8,
        hintsUsed: 3,
        streak: 0,
      },
    ];
    for (const scenario of performanceScenarios) {
      const performance: PerformanceMetrics = {
        puzzleId: testPuzzle.id,
        puzzleType: testPuzzle.type,
        difficulty: testPuzzle.difficulty,
        completed: true,
        timeSpent: scenario.timeSpent,
        movesUsed: scenario.movesUsed,
        hintsUsed: scenario.hintsUsed,
        score: 1000, // Will be calculated
        timestamp: new Date(),
      };
      const scoreResult = scoringService.calculatePuzzleScore(
        testPuzzle,
        performance,
        scenario.streak,
      );
      ;
      ;
      ;
      ;
      ;
      ;
      ;
      console.log(
        `   Difficulty Multiplier: ${scoreResult.difficultyMultiplier}x`,
      );
    }
    // Demo 3: Achievement System
    // Reset achievements for demo
    achievementsService.resetAchievements();
    // Simulate different player achievements
    const playerProgressions = [
      {
        name: 'New Player',
        stats: {
          totalCompleted: 1,
          typeCompleted: { [PuzzleType.SEQUENCE]: 1 } as any,
          currentStreak: 1,
          bestScore: 500,
          bestTime: {} as any,
          totalScore: 500,
          perfectSolves: 1,
          hintsUsed: 0,
        },
        performance: {
          puzzleId: testPuzzle.id,
          puzzleType: testPuzzle.type,
          difficulty: testPuzzle.difficulty,
          completed: true,
          timeSpent: 60000,
          movesUsed: 1,
          hintsUsed: 0,
          score: 500,
          timestamp: new Date(),
        },
      },
      {
        name: 'Experienced Player',
        stats: {
          totalCompleted: 25,
          typeCompleted: {
            [PuzzleType.SEQUENCE]: 10,
            [PuzzleType.LOGIC_GRID]: 10,
            [PuzzleType.SPATIAL]: 5,
          } as any,
          currentStreak: 5,
          bestScore: 2000,
          bestTime: {} as any,
          totalScore: 15000,
          perfectSolves: 15,
          hintsUsed: 10,
        },
        performance: {
          puzzleId: testPuzzle.id,
          puzzleType: testPuzzle.type,
          difficulty: testPuzzle.difficulty,
          completed: true,
          timeSpent: 45000,
          movesUsed: 1,
          hintsUsed: 0,
          score: 2000,
          timestamp: new Date(),
        },
      },
      {
        name: 'Expert Player',
        stats: {
          totalCompleted: 100,
          typeCompleted: {
            [PuzzleType.SEQUENCE]: 30,
            [PuzzleType.LOGIC_GRID]: 40,
            [PuzzleType.SPATIAL]: 30,
          } as any,
          currentStreak: 10,
          bestScore: 5000,
          bestTime: {} as any,
          totalScore: 75000,
          perfectSolves: 60,
          hintsUsed: 20,
        },
        performance: {
          puzzleId: testPuzzle.id,
          puzzleType: testPuzzle.type,
          difficulty: testPuzzle.difficulty,
          completed: true,
          timeSpent: 30000,
          movesUsed: 1,
          hintsUsed: 0,
          score: 5000,
          timestamp: new Date(),
        },
      },
    ];
    for (const progression of playerProgressions) {
      ;
      const newAchievements = achievementsService.checkAchievements(
        testPuzzle,
        progression.performance,
        progression.stats,
      );
      if (newAchievements.length > 0) {
        newAchievements.forEach((achievement) => {
          `);
          ;
          ;
        });
      } else {
        console.log(
          `   📈 No new achievements (player may have already unlocked available ones)`,
        );
      }
      // Get player achievement summary
      const playerAchievements =
        achievementsService.getPlayerAchievements('demo-player');
      console.log(
        `   Progress: ${playerAchievements.unlockedCount}/${playerAchievements.totalCount} achievements`,
      );
    }
    // Demo 4: Registry and Available Puzzles
    const registeredTypes = puzzleRegistry.getRegisteredTypes();
    ;
    registeredTypes.forEach((type) => {
      const generator = puzzleRegistry.getGenerator(type);
      console.log(
        `- ${type}: ${generator ? '✅ Available' : '❌ No Generator'}`,
      );
    });
    console.log(
      `\nTotal Puzzle Generators: ${puzzleRegistry.getGeneratorCount()}`,
    );
    // Test creating instances
    for (const type of registeredTypes.slice(0, 3)) {
      // Test first 3 types
      try {
        const instance = await puzzleRegistry.createPuzzleInstance(type);
        ;
        }`);
         : 'N/A'}`);
         : 'N/A'}`);
      } catch (error) {
        console.log(
          `- ${type}: ❌ Failed to create instance: ${error.message}`,
        );
      }
    }
  } catch (error) {
    logger.error('Demo failed:', error.message);
    console.error('\n❌ Demo failed:', error.message);
  } finally {
    await app.close();
  }
}
// Run the demo
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
export { main as runPuzzleEngineDemo };
