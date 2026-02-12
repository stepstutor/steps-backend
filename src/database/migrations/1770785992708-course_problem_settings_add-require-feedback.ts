import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1770785992708 implements MigrationInterface {
  name = 'Migrations1770785992708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."course_problem_settings" ADD "requireFeedback" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course" ALTER COLUMN "courseType" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."course" ALTER COLUMN "courseType" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course_problem_settings" DROP COLUMN "requireFeedback"`,
    );
  }
}
