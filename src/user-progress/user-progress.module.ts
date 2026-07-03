import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProgress } from './entities/user-progress.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { UserProgressService } from './services/user-progress.service';
import { UserProgressController } from './controller/user-progress.controller';
import { MilestoneService } from './milestone/milestone.service';
import { UsersModule } from '../users/users.module'; // for user relations

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProgress, UserAchievement]),
    UsersModule,
  ],
  controllers: [UserProgressController],
  providers: [UserProgressService, MilestoneService],
  exports: [UserProgressService],
})
export class UserProgressModule {}
