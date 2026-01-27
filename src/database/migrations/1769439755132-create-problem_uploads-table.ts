import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProblemUploadsTable1769439755132 implements MigrationInterface {
  name = 'CreateProblemUploadsTable1769439755132';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."problem_uploads_uploadtype_enum" AS ENUM('problem-text', 'solution-key', 'wrap-up')`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."problem_uploads" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid, "updatedBy" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "problemId" uuid NOT NULL, "url" text NOT NULL, "uploadType" "public"."problem_uploads_uploadtype_enum" NOT NULL, CONSTRAINT "PK_b062c7113042a3168dd51ae463d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."problem_uploads" ADD CONSTRAINT "FK_ea30dfea72661f00d72bd48763c" FOREIGN KEY ("problemId") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."problem_uploads" DROP CONSTRAINT "FK_ea30dfea72661f00d72bd48763c"`,
    );
    await queryRunner.query(`DROP TABLE "public"."problem_uploads"`);
    await queryRunner.query(
      `DROP TYPE "public"."problem_uploads_uploadtype_enum"`,
    );
  }
}
