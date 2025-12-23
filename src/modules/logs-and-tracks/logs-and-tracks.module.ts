import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenAICallLogs } from './entities/open-ai-call-logs.entity';
import { LogsAndTracksService } from './services/logs-and-tracks.service';
import { Institution } from '@modules/institutions/entities/institutions.entity';
import { LogsAndTracksController } from './controllers/logs-and-tracks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OpenAICallLogs, Institution])],
  controllers: [LogsAndTracksController],
  providers: [LogsAndTracksService],
  exports: [LogsAndTracksService],
})
export class LogsAndTracksModule {}
