// **** Library Imports ****
import * as path from 'path';
import { ResendModule } from 'nestjs-resend';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupabaseModule } from 'nestjs-supabase-js';
import { forwardRef, Module, Scope } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n';

// **** External Imports ****
import { UsersModule } from '@modules/user/users.module';

// **** Internal Imports ****
import { S3Service } from './services/s3.service';
import { EmailService } from './services/email.service';
import { UploadService } from './services/upload.service';
import { BullModule } from '@nestjs/bullmq';
import { NOTIFICATION_QUEUE_NAME } from './constants';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_DB'),
        schema: configService.get<string>('DATABASE_SCHEMA'),
        entities: [path.join(__dirname, '../modules/**/**.entity{.ts,.js}')],
        migrations: [path.join(__dirname, '../database/migrations/**/*.ts')],
        synchronize: false,
      }),
    }),
    SupabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        supabaseUrl: configService.getOrThrow<string>('SUPABASE_URL'),
        supabaseKey: configService.getOrThrow<string>(
          'SUPABASE_SERVICE_ROLE_KEY',
        ),
      }),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en', // Default language
      loaderOptions: {
        path: path.join(__dirname, '../i18n/'), // Path to translation files
        watch: true, // Watch for file changes
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ResendModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        apiKey: configService.getOrThrow('RESEND_API_KEY'),
      }),
    }),
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE_NAME,
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter, // Or FastifyAdapter from `@bull-board/fastify`
    }),
    BullBoardModule.forFeature({
      name: NOTIFICATION_QUEUE_NAME,
      adapter: BullMQAdapter, //or use BullAdapter if you're using bull instead of bullMQ
    }),
    forwardRef(() => UsersModule),
  ],
  providers: [
    {
      provide: 'AWS_S3_BUCKET_NAME',
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow<string>('AWS_S3_BUCKET_NAME'), // Optional fallback
      inject: [ConfigService],
      scope: Scope.DEFAULT,
    },
    S3Service,
    UploadService,
    BullModule,
    EmailService,
  ],
  exports: [
    'AWS_S3_BUCKET_NAME',
    S3Service,
    BullModule,
    UploadService,
    EmailService,
  ],
})
export class CommonModule {}
