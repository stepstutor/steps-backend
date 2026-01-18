import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST!,
  port: +process.env.DATABASE_PORT!,
  username: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_DB!,
  // schema: process.env.DATABASE_SCHEMA!,
  synchronize: false,
  dropSchema: false,
  logging: false,
  logger: 'file',
  entities: [
    'src/modules/**/*.entity{.ts,.js}',
    'src/modules/**/*.view{.ts,.js}',
  ],
  migrations: ['src/database/migrations/**/*.ts'],
});
