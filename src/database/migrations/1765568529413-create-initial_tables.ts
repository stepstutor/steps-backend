import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialTablesCreate1765568529413 implements MigrationInterface {
  name = 'InitialTablesCreate1765568529413';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "steps_db"."user_role_enum" AS ENUM('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'STUDENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "steps_db"."user" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid, "updatedBy" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL DEFAULT '', "profilePic" character varying NOT NULL DEFAULT '', "isActive" boolean NOT NULL DEFAULT true, "role" "steps_db"."user_role_enum" NOT NULL, "supabaseUid" character varying DEFAULT '', "institutionId" uuid, "deletedAt" TIMESTAMP, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "steps_db"."course_student" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid, "updatedBy" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "courseId" uuid NOT NULL, "studentId" uuid NOT NULL, CONSTRAINT "PK_32e95e81ab1f186b99b2decb235" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "steps_db"."course_instructor_instructortype_enum" AS ENUM('MAIN', 'SUB')`,
    );
    await queryRunner.query(
      `CREATE TABLE "steps_db"."course_instructor" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid, "updatedBy" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "courseId" uuid NOT NULL, "instructorId" uuid NOT NULL, "instructorType" "steps_db"."course_instructor_instructortype_enum" NOT NULL, CONSTRAINT "PK_deca5c9911b3b2100b361060826" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "steps_db"."course_yearofstudent_enum" AS ENUM('FIRST', 'SECOND', 'THIRD', 'FORTH', 'FIFTH', 'SIXTH', 'SEVENTH', 'EIGHTH', 'NINTH', 'TENTH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "steps_db"."course" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid, "updatedBy" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "timePeriod" character varying NOT NULL, "courseColor" character varying NOT NULL, "programOfCourse" character varying NOT NULL DEFAULT 'Medicine', "yearOfStudent" "steps_db"."course_yearofstudent_enum", "isActive" boolean NOT NULL DEFAULT true, "institutionId" uuid, CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "steps_db"."institution_language_enum" AS ENUM('en', 'es', 'pt', 'nl', 'ar', 'yue')`,
    );
    await queryRunner.query(
      `CREATE TABLE "steps_db"."institution" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid, "updatedBy" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "country" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "isVoiceCallAllowed" boolean NOT NULL DEFAULT true, "language" "steps_db"."institution_language_enum" NOT NULL DEFAULT 'en', "instructorAccountsLimit" integer NOT NULL DEFAULT '10', "studentAccountsLimit" integer NOT NULL DEFAULT '20', "isResearch" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_f60ee4ff0719b7df54830b39087" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "steps_db"."invitation_role_enum" AS ENUM('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'INSTRUCTOR', 'STUDENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "steps_db"."invitation" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid, "updatedBy" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "role" "steps_db"."invitation_role_enum" NOT NULL, "institutionId" uuid, "expireAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_beb994737756c0f18a1c1f8669c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "steps_db"."notification_job_receivergroup_enum" AS ENUM('STUDENT', 'INSTRUCTOR', 'BOTH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "steps_db"."notification_job" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid, "updatedBy" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "text" text NOT NULL, "linkUrl" character varying, "linkText" character varying, "isSent" boolean NOT NULL DEFAULT false, "receiverGroup" "steps_db"."notification_job_receivergroup_enum" NOT NULL, "receiverCountry" text, "receiverInstituteIds" text, "receiverCourseIds" text, "scheduleDate" TIMESTAMP, "sendEmail" boolean NOT NULL DEFAULT false, "queueJobId" character varying, CONSTRAINT "PK_05ec87c8d9cdfe9e7e692c9ddac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "steps_db"."user_notification" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid, "updatedBy" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "notificationId" uuid, "title" character varying NOT NULL, "text" text NOT NULL, "linkUrl" character varying, "linkText" character varying, "userId" uuid NOT NULL, "sentAt" TIMESTAMP, "readAt" TIMESTAMP, "seenAt" TIMESTAMP, CONSTRAINT "PK_8840aac86dec5f669c541ce67d4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."user" ADD CONSTRAINT "FK_ca0de218397aed2409d865d1580" FOREIGN KEY ("institutionId") REFERENCES "steps_db"."institution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course_student" ADD CONSTRAINT "FK_3b6eec685b4adef9b3d5b65d935" FOREIGN KEY ("courseId") REFERENCES "steps_db"."course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course_student" ADD CONSTRAINT "FK_5821f0e4a25bf514ea4ca87358a" FOREIGN KEY ("studentId") REFERENCES "steps_db"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course_instructor" ADD CONSTRAINT "FK_2d903e73a7da87b36f79dbe8400" FOREIGN KEY ("courseId") REFERENCES "steps_db"."course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course_instructor" ADD CONSTRAINT "FK_8c4dda917b09dd3b4fc47dcb6b3" FOREIGN KEY ("instructorId") REFERENCES "steps_db"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course" ADD CONSTRAINT "FK_8fa9f33441d0e7cb28c5d934bc4" FOREIGN KEY ("institutionId") REFERENCES "steps_db"."institution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."invitation" ADD CONSTRAINT "FK_afc98d90fe81c302c14f7bf08a5" FOREIGN KEY ("institutionId") REFERENCES "steps_db"."institution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."user_notification" ADD CONSTRAINT "FK_680af16b67e94e2cb693b9e9033" FOREIGN KEY ("notificationId") REFERENCES "steps_db"."notification_job"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."user_notification" ADD CONSTRAINT "FK_dce2a8927967051c447ae10bc8b" FOREIGN KEY ("userId") REFERENCES "steps_db"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "steps_db"."user_notification" DROP CONSTRAINT "FK_dce2a8927967051c447ae10bc8b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."user_notification" DROP CONSTRAINT "FK_680af16b67e94e2cb693b9e9033"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."invitation" DROP CONSTRAINT "FK_afc98d90fe81c302c14f7bf08a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course" DROP CONSTRAINT "FK_8fa9f33441d0e7cb28c5d934bc4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course_instructor" DROP CONSTRAINT "FK_8c4dda917b09dd3b4fc47dcb6b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course_instructor" DROP CONSTRAINT "FK_2d903e73a7da87b36f79dbe8400"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course_student" DROP CONSTRAINT "FK_5821f0e4a25bf514ea4ca87358a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."course_student" DROP CONSTRAINT "FK_3b6eec685b4adef9b3d5b65d935"`,
    );
    await queryRunner.query(
      `ALTER TABLE "steps_db"."user" DROP CONSTRAINT "FK_ca0de218397aed2409d865d1580"`,
    );
    await queryRunner.query(`DROP TABLE "steps_db"."user_notification"`);
    await queryRunner.query(`DROP TABLE "steps_db"."notification_job"`);
    await queryRunner.query(
      `DROP TYPE "steps_db"."notification_job_receivergroup_enum"`,
    );
    await queryRunner.query(`DROP TABLE "steps_db"."invitation"`);
    await queryRunner.query(`DROP TYPE "steps_db"."invitation_role_enum"`);
    await queryRunner.query(`DROP TABLE "steps_db"."institution"`);
    await queryRunner.query(`DROP TYPE "steps_db"."institution_language_enum"`);
    await queryRunner.query(`DROP TABLE "steps_db"."course"`);
    await queryRunner.query(`DROP TYPE "steps_db"."course_yearofstudent_enum"`);
    await queryRunner.query(`DROP TABLE "steps_db"."course_instructor"`);
    await queryRunner.query(
      `DROP TYPE "steps_db"."course_instructor_instructortype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "steps_db"."course_student"`);
    await queryRunner.query(`DROP TABLE "steps_db"."user"`);
    await queryRunner.query(`DROP TYPE "steps_db"."user_role_enum"`);
  }
}
