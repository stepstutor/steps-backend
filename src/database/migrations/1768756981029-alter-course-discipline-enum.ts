import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCourseDisciplineEnum1768756981029 implements MigrationInterface {
  name = 'AlterCourseDisciplineEnum1768756981029';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."course_discipline_enum" RENAME TO "course_discipline_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."course_discipline_enum" AS ENUM('BIOLOGY', 'CHEMISTRY', 'COMPUTER_AND_DATA_SCIENCE', 'MATHEMATICS', 'PHYSICS', 'ENGINEERING', 'EARTH_AND_ENVIRONMENTAL_SCIENCES')`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course" ALTER COLUMN "discipline" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course" ALTER COLUMN "discipline" TYPE "public"."course_discipline_enum" USING "discipline"::"text"::"public"."course_discipline_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."course_discipline_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "public"."course" ALTER COLUMN "courseType" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."course" ALTER COLUMN "courseType" SET DEFAULT 'General'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."course_discipline_enum_old" AS ENUM('Biology', 'Chemistry', 'Computer & Data Science', 'Earth & Environmental Sciences', 'Engineering', 'Mathematics', 'Physics')`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course" ALTER COLUMN "discipline" TYPE "public"."course_discipline_enum_old" USING "discipline"::"text"::"public"."course_discipline_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course" ALTER COLUMN "discipline" SET DEFAULT 'Chemistry'`,
    );
    await queryRunner.query(`DROP TYPE "public"."course_discipline_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."course_discipline_enum_old" RENAME TO "course_discipline_enum"`,
    );
  }
}
