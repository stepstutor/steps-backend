import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProblemAddCowriteAttempts1769695487808 implements MigrationInterface {
  name = 'AlterProblemAddCowriteAttempts1769695487808';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem" ADD "cowriteProblemAttempts" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem" ADD "cowriteSolutionAttempts" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem" DROP COLUMN "cowriteSolutionAttempts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."problem" DROP COLUMN "cowriteProblemAttempts"`,
    );
  }
}
