import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProblemTables1767867445448 implements MigrationInterface {
  name = 'CreateProblemTables1767867445448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "steps_db"."problem_tag" ("problemId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "PK_f18187b9f70cafb73efe8c980ba" PRIMARY KEY ("problemId", "tagId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "steps_db"."problem_library" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid, "updatedBy" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "problemId" uuid NOT NULL, "institutionId" uuid, "instructorId" uuid NOT NULL, CONSTRAINT "UQ_c94b82821812dad3fc5cb10da34" UNIQUE ("problemId", "institutionId"), CONSTRAINT "REL_95fad537a0835d094eaec33322" UNIQUE ("problemId"), CONSTRAINT "PK_03a5d126b4ab55727977cc483aa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "steps_db"."problem" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid, "updatedBy" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, "statement" text NOT NULL, "discipline" character varying NOT NULL, "essentialConcepts" text NOT NULL, "conceptsConnection" text NOT NULL, "assumptions" text, "commonMistakes" text NOT NULL, "additionalInformation" text NOT NULL, "instructorPlan" text NOT NULL, "solutionKey" text NOT NULL, "wrapUp" text, "courseId" uuid, "instructorId" uuid NOT NULL, "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_119b5ca6f3371465bf1f0f90219" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "steps_db"."tag" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid, "updatedBy" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac30bd07162e1e69cd94be9ea8" ON "steps_db"."problem_tag" ("problemId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8d2e5f9dcc8db56615489ffe37" ON "steps_db"."problem_tag" ("tagId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem_tag" ADD CONSTRAINT "FK_ac30bd07162e1e69cd94be9ea80" FOREIGN KEY ("problemId") REFERENCES "steps_db"."problem"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem_tag" ADD CONSTRAINT "FK_8d2e5f9dcc8db56615489ffe376" FOREIGN KEY ("tagId") REFERENCES "steps_db"."tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem_library" ADD CONSTRAINT "FK_95fad537a0835d094eaec333225" FOREIGN KEY ("problemId") REFERENCES "steps_db"."problem"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem_library" ADD CONSTRAINT "FK_3b80b3e2879ce221e2607dc0865" FOREIGN KEY ("institutionId") REFERENCES "steps_db"."institution"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem_library" ADD CONSTRAINT "FK_eea3f2de221b57defdc0ace2074" FOREIGN KEY ("instructorId") REFERENCES "steps_db"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem" ADD CONSTRAINT "FK_ac2ee38c12ba39bef1c30ffd41a" FOREIGN KEY ("courseId") REFERENCES "steps_db"."course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem" ADD CONSTRAINT "FK_ffcf172290f4ac96959d5a1d263" FOREIGN KEY ("instructorId") REFERENCES "steps_db"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem" DROP CONSTRAINT "FK_ffcf172290f4ac96959d5a1d263"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem" DROP CONSTRAINT "FK_ac2ee38c12ba39bef1c30ffd41a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem_library" DROP CONSTRAINT "FK_eea3f2de221b57defdc0ace2074"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem_library" DROP CONSTRAINT "FK_3b80b3e2879ce221e2607dc0865"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem_library" DROP CONSTRAINT "FK_95fad537a0835d094eaec333225"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem_tag" DROP CONSTRAINT "FK_8d2e5f9dcc8db56615489ffe376"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem_tag" DROP CONSTRAINT "FK_ac30bd07162e1e69cd94be9ea80"`,
    );
    await queryRunner.query(
      `DROP INDEX "steps_db"."IDX_8d2e5f9dcc8db56615489ffe37"`,
    );
    await queryRunner.query(
      `DROP INDEX "steps_db"."IDX_ac30bd07162e1e69cd94be9ea8"`,
    );
    await queryRunner.query(`DROP TABLE "steps_db"."tag"`);
    await queryRunner.query(`DROP TABLE "steps_db"."problem"`);
    await queryRunner.query(`DROP TABLE "steps_db"."problem_library"`);
    await queryRunner.query(`DROP TABLE "steps_db"."problem_tag"`);
  }
}
