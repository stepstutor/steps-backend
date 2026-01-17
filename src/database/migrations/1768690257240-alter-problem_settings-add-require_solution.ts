import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProblemSettingsAddRequireSolution1768690257240 implements MigrationInterface {
  name = 'AlterProblemSettingsAddRequireSolution1768690257240';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course_problem_settings" ADD "requireSolution" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course_problem_settings" ADD CONSTRAINT "FK_e29f8cf1d441181cda6fd9559e3" FOREIGN KEY ("courseId") REFERENCES "steps_db"."course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course_problem_settings" ADD CONSTRAINT "FK_a6021ee7b2131e024405507dfe2" FOREIGN KEY ("problemId") REFERENCES "steps_db"."problem"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course_problem_settings" DROP CONSTRAINT "FK_a6021ee7b2131e024405507dfe2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course_problem_settings" DROP CONSTRAINT "FK_e29f8cf1d441181cda6fd9559e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course_problem_settings" DROP COLUMN "requireSolution"`,
    );
  }
}
