import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProblemsAddIsDraft1767965122156 implements MigrationInterface {
  name = 'AlterProblemsAddIsDraft1767965122156';

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
      `ALTER TABLE "public"."problem" ADD "isDraft" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" DROP CONSTRAINT "FK_ffcf172290f4ac96959d5a1d263"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "title" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "description" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "statement" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "discipline" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "essentialConcepts" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "conceptsConnection" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "commonMistakes" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "additionalInformation" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "instructorPlan" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "solutionKey" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "instructorId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac30bd07162e1e69cd94be9ea8" ON "public"."problem_tag" ("problemId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8d2e5f9dcc8db56615489ffe37" ON "public"."problem_tag" ("tagId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ADD CONSTRAINT "CHK_bd289b2fa2d1da809eb8990791" CHECK ("isDraft" OR ("title" IS NOT NULL AND "description" IS NOT NULL AND "statement" IS NOT NULL AND "discipline" IS NOT NULL AND "essentialConcepts" IS NOT NULL AND "conceptsConnection" IS NOT NULL AND "commonMistakes" IS NOT NULL AND "additionalInformation" IS NOT NULL AND "instructorPlan" IS NOT NULL AND "solutionKey" IS NOT NULL AND "instructorId" IS NOT NULL))`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "FK_ac30bd07162e1e69cd94be9ea80" FOREIGN KEY ("problemId") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "FK_8d2e5f9dcc8db56615489ffe376" FOREIGN KEY ("tagId") REFERENCES "public"."tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ADD CONSTRAINT "FK_ffcf172290f4ac96959d5a1d263" FOREIGN KEY ("instructorId") REFERENCES "public"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."problem" DROP CONSTRAINT "FK_ffcf172290f4ac96959d5a1d263"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "FK_8d2e5f9dcc8db56615489ffe376"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_tag" DROP CONSTRAINT "FK_ac30bd07162e1e69cd94be9ea80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" DROP CONSTRAINT "CHK_bd289b2fa2d1da809eb8990791"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8d2e5f9dcc8db56615489ffe37"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac30bd07162e1e69cd94be9ea8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "instructorId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "solutionKey" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "instructorPlan" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "additionalInformation" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "commonMistakes" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "conceptsConnection" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "essentialConcepts" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "discipline" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "statement" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ALTER COLUMN "title" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" ADD CONSTRAINT "FK_ffcf172290f4ac96959d5a1d263" FOREIGN KEY ("instructorId") REFERENCES "public"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem" DROP COLUMN "isDraft"`,
    );
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
