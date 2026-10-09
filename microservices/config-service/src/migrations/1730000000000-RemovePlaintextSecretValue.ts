import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Secret values were persisted twice: an encrypted copy (`encryptedValue` +
 * `iv`) and a plaintext copy (`value`). The plaintext column defeated the
 * encryption and was also returned by the secrets API. Drop it; secrets are
 * now stored only in encrypted form and read back via the encryption service.
 */
export class RemovePlaintextSecretValue1730000000000 implements MigrationInterface {
  name = 'RemovePlaintextSecretValue1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "secrets" DROP COLUMN IF EXISTS "value";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // The original plaintext cannot be recovered; restore an empty column so
    // the schema matches the pre-migration shape.
    await queryRunner.query(
      `ALTER TABLE "secrets" ADD COLUMN IF NOT EXISTS "value" text NOT NULL DEFAULT '';`,
    );
  }
}
