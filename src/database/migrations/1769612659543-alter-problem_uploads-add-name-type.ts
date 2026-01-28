import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProblemUploadsAddNameAndType1769612659543 implements MigrationInterface {
  name = 'AlterProblemUploadsAddNameAndType1769612659543';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem_uploads" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "steps_db"."problem_uploads_type_enum" AS ENUM('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'YOUTUBE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem_uploads" ADD "type" "steps_db"."problem_uploads_type_enum" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem_uploads" DROP COLUMN "type"`,
    );
    await queryRunner.query(`DROP TYPE "steps_db"."problem_uploads_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem_uploads" DROP COLUMN "name"`,
    );
  }
}
