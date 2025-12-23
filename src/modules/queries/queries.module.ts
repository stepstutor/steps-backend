import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Query } from './entities/query.entity';
import { QueriesService } from './queries.service';
import { CommonModule } from 'src/common/common.module';
import { UploadService } from 'src/common/services/upload.service';
import { QueriesController } from './controllers/query.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Query]), CommonModule],
  providers: [QueriesService, UploadService],
  controllers: [QueriesController],
  exports: [QueriesService],
})
export class QueriesModule {}
