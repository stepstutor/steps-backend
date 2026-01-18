import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCourseProblemSettingsTable1768268156726 implements MigrationInterface {
  name = 'CreateCourseProblemSettingsTable1768268156726';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "FK_8d2e5f9dcc8db56615489ffe376"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "FK_ac30bd07162e1e69cd94be9ea80"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac30bd07162e1e69cd94be9ea8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8d2e5f9dcc8db56615489ffe37"`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."course_problem_settings" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid, "updatedBy" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "hasPlanning" boolean NOT NULL DEFAULT false, "hasReflection" boolean NOT NULL DEFAULT false, "planningReleaseDate" TIMESTAMP WITH TIME ZONE, "planningDueDate" TIMESTAMP WITH TIME ZONE, "reflectionReleaseDate" TIMESTAMP WITH TIME ZONE, "reflectionDueDate" TIMESTAMP WITH TIME ZONE, "isOptional" boolean NOT NULL DEFAULT false, "courseId" uuid NOT NULL, "problemId" uuid NOT NULL, CONSTRAINT "REL_e29f8cf1d441181cda6fd9559e" UNIQUE ("courseId"), CONSTRAINT "REL_a6021ee7b2131e024405507dfe" UNIQUE ("problemId"), CONSTRAINT "PK_c957a6e2876c2db973bba3054e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac30bd07162e1e69cd94be9ea8" ON "public"."problem_tag" ("problemId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8d2e5f9dcc8db56615489ffe37" ON "public"."problem_tag" ("tagId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "FK_ac30bd07162e1e69cd94be9ea80" FOREIGN KEY ("problemId") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "FK_8d2e5f9dcc8db56615489ffe376" FOREIGN KEY ("tagId") REFERENCES "public"."tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course_problem_settings" ADD CONSTRAINT "FK_e29f8cf1d441181cda6fd9559e3" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course_problem_settings" ADD CONSTRAINT "FK_a6021ee7b2131e024405507dfe2" FOREIGN KEY ("problemId") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."course_problem_settings" DROP CONSTRAINT "FK_a6021ee7b2131e024405507dfe2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."course_problem_settings" DROP CONSTRAINT "FK_e29f8cf1d441181cda6fd9559e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "FK_8d2e5f9dcc8db56615489ffe376"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "FK_ac30bd07162e1e69cd94be9ea80"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8d2e5f9dcc8db56615489ffe37"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac30bd07162e1e69cd94be9ea8"`,
    );
    await queryRunner.query(`DROP TABLE "public"."course_problem_settings"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_8d2e5f9dcc8db56615489ffe37" ON "public"."problem_tag" ("tagId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac30bd07162e1e69cd94be9ea8" ON "public"."problem_tag" ("problemId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "FK_ac30bd07162e1e69cd94be9ea80" FOREIGN KEY ("problemId") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "FK_8d2e5f9dcc8db56615489ffe376" FOREIGN KEY ("tagId") REFERENCES "public"."tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
