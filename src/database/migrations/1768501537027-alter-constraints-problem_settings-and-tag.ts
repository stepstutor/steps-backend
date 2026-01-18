import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProblemTagAndSettingsConstraints1768501537027 implements MigrationInterface {
  name = 'AlterProblemTagAndSettingsConstraints1768501537027';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."course_problem_settings" DROP CONSTRAINT "FK_a6021ee7b2131e024405507dfe2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course_problem_settings" DROP CONSTRAINT "FK_e29f8cf1d441181cda6fd9559e3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac30bd07162e1e69cd94be9ea8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8d2e5f9dcc8db56615489ffe37"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "PK_f18187b9f70cafb73efe8c980ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "PK_055035df51a19809d0485074376" PRIMARY KEY ("problemId", "tagId", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "FK_ac30bd07162e1e69cd94be9ea80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "FK_8d2e5f9dcc8db56615489ffe376"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "PK_055035df51a19809d0485074376"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "PK_5ff52344c1512891dc04da9b11e" PRIMARY KEY ("tagId", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "PK_5ff52344c1512891dc04da9b11e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "PK_616dce8d47dfbb445de4691ed1d" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course_problem_settings" DROP CONSTRAINT "REL_e29f8cf1d441181cda6fd9559e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course_problem_settings" DROP CONSTRAINT "REL_a6021ee7b2131e024405507dfe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "FK_ac30bd07162e1e69cd94be9ea80" FOREIGN KEY ("problemId") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "FK_8d2e5f9dcc8db56615489ffe376" FOREIGN KEY ("tagId") REFERENCES "public"."tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "FK_8d2e5f9dcc8db56615489ffe376"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "FK_ac30bd07162e1e69cd94be9ea80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course_problem_settings" ADD CONSTRAINT "REL_a6021ee7b2131e024405507dfe" UNIQUE ("problemId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course_problem_settings" ADD CONSTRAINT "REL_e29f8cf1d441181cda6fd9559e" UNIQUE ("courseId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "PK_616dce8d47dfbb445de4691ed1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "PK_5ff52344c1512891dc04da9b11e" PRIMARY KEY ("tagId", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "PK_5ff52344c1512891dc04da9b11e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "PK_055035df51a19809d0485074376" PRIMARY KEY ("problemId", "tagId", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "FK_8d2e5f9dcc8db56615489ffe376" FOREIGN KEY ("tagId") REFERENCES "public"."tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "FK_ac30bd07162e1e69cd94be9ea80" FOREIGN KEY ("problemId") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "PK_055035df51a19809d0485074376"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "PK_f18187b9f70cafb73efe8c980ba" PRIMARY KEY ("problemId", "tagId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8d2e5f9dcc8db56615489ffe37" ON "public"."problem_tag" ("tagId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac30bd07162e1e69cd94be9ea8" ON "public"."problem_tag" ("problemId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course_problem_settings" ADD CONSTRAINT "FK_e29f8cf1d441181cda6fd9559e3" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course_problem_settings" ADD CONSTRAINT "FK_a6021ee7b2131e024405507dfe2" FOREIGN KEY ("problemId") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
