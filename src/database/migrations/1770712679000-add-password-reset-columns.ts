import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetColumns1770712679000 implements MigrationInterface {
  name = 'AddPasswordResetColumns1770712679000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."user" ADD "resetUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."user" ADD "resetDate" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."user" ADD "resetCode" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."user" ADD "linkUsed" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."user" DROP COLUMN "linkUsed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."user" DROP COLUMN "resetCode"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."user" DROP COLUMN "resetDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."user" DROP COLUMN "resetUrl"`,
    );
  }
}
