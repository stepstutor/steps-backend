import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCourseAddDiscipline1768511767588 implements MigrationInterface {
  name = 'AlterCourseAddDiscipline1768511767588';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."course" DROP COLUMN "programOfCourse"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course" DROP COLUMN "yearOfStudent"`,
    );
    await queryRunner.query(`DROP TYPE "public"."course_yearofstudent_enum"`);
    await queryRunner.query(
      `CREATE TYPE "public"."course_discipline_enum" AS ENUM('Biology', 'Chemistry', 'Computer & Data Science', 'Mathematics', 'Physics', 'Engineering', 'Earth & Environmental Sciences')`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course" ADD "discipline" "public"."course_discipline_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course" ADD "courseType" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."course" DROP COLUMN "courseType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course" DROP COLUMN "discipline"`,
    );
    await queryRunner.query(`DROP TYPE "public"."course_discipline_enum"`);
    await queryRunner.query(
      `CREATE TYPE "public"."course_yearofstudent_enum" AS ENUM('EIGHTH', 'FIFTH', 'FIRST', 'FORTH', 'NINTH', 'SECOND', 'SEVENTH', 'SIXTH', 'TENTH', 'THIRD')`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course" ADD "yearOfStudent" "public"."course_yearofstudent_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course" ADD "programOfCourse" character varying NOT NULL DEFAULT 'Medicine'`,
    );
  }
}
