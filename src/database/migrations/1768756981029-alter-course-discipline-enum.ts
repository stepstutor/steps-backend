import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCourseDisciplineEnum1768756981029 implements MigrationInterface {
  name = 'AlterCourseDisciplineEnum1768756981029';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "steps_db"."course_discipline_enum" RENAME TO "course_discipline_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "steps_db"."course_discipline_enum" AS ENUM('BIOLOGY', 'CHEMISTRY', 'COMPUTER_AND_DATA_SCIENCE', 'MATHEMATICS', 'PHYSICS', 'ENGINEERING', 'EARTH_AND_ENVIRONMENTAL_SCIENCES')`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course" ALTER COLUMN "discipline" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course" ALTER COLUMN "discipline" TYPE "steps_db"."course_discipline_enum" USING "discipline"::"text"::"steps_db"."course_discipline_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "steps_db"."course_discipline_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course" ALTER COLUMN "courseType" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course" ALTER COLUMN "courseType" SET DEFAULT 'General'`,
    );
    await queryRunner.query(
      `CREATE TYPE "steps_db"."course_discipline_enum_old" AS ENUM('Biology', 'Chemistry', 'Computer & Data Science', 'Earth & Environmental Sciences', 'Engineering', 'Mathematics', 'Physics')`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course" ALTER COLUMN "discipline" TYPE "steps_db"."course_discipline_enum_old" USING "discipline"::"text"::"steps_db"."course_discipline_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course" ALTER COLUMN "discipline" SET DEFAULT 'Chemistry'`,
    );
    await queryRunner.query(`DROP TYPE "steps_db"."course_discipline_enum"`);
    await queryRunner.query(
      `ALTER TYPE "steps_db"."course_discipline_enum_old" RENAME TO "course_discipline_enum"`,
    );
  }
}
