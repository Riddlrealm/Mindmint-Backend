import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

import appConfig from './config/app.config';

// Core modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { CacheModule } from './cache/cache.module';

// Game modules
import { PuzzlesModule } from './puzzles/puzzles.module';
import { GameEngineModule } from './game-engine/game-engine.module';
import { GameSessionModule } from './game-session/game-session.module';
import { AchievementsModule } from './achievements/achievements.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { QuestsModule } from './quests/quests.module';
import { HintsModule } from './hints/hints.module';
import { ReplayModule } from './replay/replay.module';
import { DailyChallengesModule } from './daily-challenges/daily-challenges.module';
import { SeasonalEventsModule } from './seasonal-events/seasonal-events.module';
import { CollectionsModule } from './collections/collections.module';
import { MultiplayerModule } from './multiplayer/multiplayer.module';
import { SkillRatingModule } from './skill-rating/skill-rating.module';
import { SaveGameModule } from './save-game/save-game.module';
import { XpModule } from './xp/xp.module';
import { EnergyModule } from './energy/energy.module';
import { GuildsModule } from './guilds/guilds.module';
import { AntiCheatModule } from './anti-cheat/anti-cheat.module';

// Player modules
import { PlayerProfileModule } from './player-profile/player-profile.module';
import { PlayerModule } from './player/player.module';
import { FriendsModule } from './friends/friends.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { ReferralsModule } from './referrals/referrals.module';
import { UserProgressModule } from './user-progress/user-progress.module';
import { PrivacyModule } from './privacy/privacy.module';
import { AccountModule } from './account/account.module';

// Blockchain / Stellar modules
import { WalletModule } from './wallet/wallet.module';
import { BlockchainEventsModule } from './blockchain-events/blockchain-events.module';
import { NFTModule } from './nft/nft.module';
import { SorobanModule } from './soroban/soroban.module';

// Platform modules
import { NotificationsModule } from './notifications/notifications.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReportsModule } from './reports/reports.module';
import { AdminModule } from './admin/admin.module';
import { SupportModule } from './support/support.module';
import { AbTestingModule } from './ab-testing/ab-testing.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_NAME', 'mindmint_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL', 60000),
          limit: configService.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
      inject: [ConfigService],
    }),

    // Scheduling & Events
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    // Core
    CacheModule,
    HealthModule,
    AuthModule,
    UsersModule,

    // Game
    GameEngineModule,
    GameSessionModule,
    PuzzlesModule,
    AchievementsModule,
    LeaderboardModule,
    TournamentsModule,
    QuestsModule,
    HintsModule,
    ReplayModule,
    DailyChallengesModule,
    SeasonalEventsModule,
    CollectionsModule,
    MultiplayerModule,
    SkillRatingModule,
    SaveGameModule,
    XpModule,
    EnergyModule,
    GuildsModule,
    AntiCheatModule,

    // Player
    PlayerModule,
    PlayerProfileModule,
    FriendsModule,
    RecommendationsModule,
    ReferralsModule,
    UserProgressModule,
    PrivacyModule,
    AccountModule,

    // Blockchain / Stellar
    WalletModule,
    BlockchainEventsModule,
    NFTModule,
    SorobanModule,

    // Platform
    NotificationsModule,
    WebhooksModule,
    IntegrationsModule,
    AnalyticsModule,
    ReportsModule,
    AdminModule,
    SupportModule,
    AbTestingModule,
  ],
})
export class AppModule {}
