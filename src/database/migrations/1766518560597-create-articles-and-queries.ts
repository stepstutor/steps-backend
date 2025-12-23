import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQueriesAndArticles1766518373015 implements MigrationInterface {
  name = 'CreateQueriesAndArticles1766518373015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "public"."queries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "referenceNumber" integer NOT NULL, "message" text NOT NULL, "pictureUrl" text, "status" character varying(20) NOT NULL DEFAULT 'Open', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f7c4c246a4e85c23c2b35356a73" UNIQUE ("referenceNumber"), CONSTRAINT "PK_e212c03c614452a1d1f8699d2ae" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."open_ai_call_logs_type_enum" AS ENUM('textChat')`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."open_ai_call_logs" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid, "updatedBy" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "type" "public"."open_ai_call_logs_type_enum" NOT NULL, CONSTRAINT "PK_6b98de0de3d8d672e2e9bac7085" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."article_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "order" integer NOT NULL, CONSTRAINT "PK_cdd234ef147c8552a8abd42bd29" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."article_availablefor_enum" AS ENUM('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'STUDENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."article" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "blogInput" character varying(600) NOT NULL, "video" character varying, "image" character varying, "articleCategoryId" uuid NOT NULL, "order" integer NOT NULL, "availableFor" "public"."article_availablefor_enum" array NOT NULL, CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."user" ADD "walkthroughScreens" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."queries" ADD CONSTRAINT "FK_e83034a291126b19e15e455961a" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."open_ai_call_logs" ADD CONSTRAINT "FK_fd8e9e4c9306b1c7b9f3526c883" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."article" ADD CONSTRAINT "FK_357fa08ef2c105399118e54e681" FOREIGN KEY ("articleCategoryId") REFERENCES "public"."article_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."article" DROP CONSTRAINT "FK_357fa08ef2c105399118e54e681"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."open_ai_call_logs" DROP CONSTRAINT "FK_fd8e9e4c9306b1c7b9f3526c883"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."queries" DROP CONSTRAINT "FK_e83034a291126b19e15e455961a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."user" DROP COLUMN "walkthroughScreens"`,
    );
    await queryRunner.query(`DROP TABLE "public"."article"`);
    await queryRunner.query(`DROP TYPE "public"."article_availablefor_enum"`);
    await queryRunner.query(`DROP TABLE "public"."article_category"`);
    await queryRunner.query(`DROP TABLE "public"."open_ai_call_logs"`);
    await queryRunner.query(`DROP TYPE "public"."open_ai_call_logs_type_enum"`);
    await queryRunner.query(`DROP TABLE "public"."queries"`);
  }
}
