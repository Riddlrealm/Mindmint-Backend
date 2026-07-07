import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1700000000000 implements MigrationInterface {
  name = 'InitSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "environments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "displayName" varchar NOT NULL,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_environments" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_environments_name" UNIQUE ("name")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "configurations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "key" varchar NOT NULL,
        "value" text NOT NULL,
        "description" varchar,
        "type" varchar NOT NULL DEFAULT 'string',
        "isSecret" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "category" varchar,
        "tags" varchar,
        "environmentId" uuid,
        "version" varchar,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "createdBy" varchar,
        "updatedBy" varchar,
        CONSTRAINT "PK_configurations" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_configurations_key" UNIQUE ("key")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "secrets" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "value" text NOT NULL,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "category" varchar,
        "encryptionAlgorithm" varchar NOT NULL DEFAULT 'aes-256-cbc',
        "encryptedValue" text,
        "iv" text,
        "lastRotatedAt" TIMESTAMP,
        "rotationCount" integer NOT NULL DEFAULT 0,
        "rotationIntervalSeconds" integer NOT NULL DEFAULT 7776000,
        "requiresRotation" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "createdBy" varchar,
        "updatedBy" varchar,
        CONSTRAINT "PK_secrets" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_secrets_name" UNIQUE ("name")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "action" varchar NOT NULL,
        "entityType" varchar NOT NULL,
        "entityId" uuid NOT NULL,
        "changes" text,
        "userId" varchar,
        "ipAddress" varchar,
        "reason" text,
        "severity" varchar NOT NULL DEFAULT 'INFO',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "webhook_subscriptions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "serviceName" varchar NOT NULL,
        "webhookUrl" varchar NOT NULL,
        "events" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "retryAttempts" integer NOT NULL DEFAULT 3,
        "retryDelayMs" integer NOT NULL DEFAULT 5000,
        "secret" varchar,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_webhook_subscriptions" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_configurations_environmentId" ON "configurations" ("environmentId");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_logs_entity" ON "audit_logs" ("entityType", "entityId");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_entity";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_configurations_environmentId";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "webhook_subscriptions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "secrets";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "configurations";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "environments";`);
  }
}
