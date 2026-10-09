import { EncryptionService } from '../src/common/encryption.service';

describe('EncryptionService', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  const roundTrip = (service: EncryptionService, plaintext: string) => {
    const { encryptedText, iv } = service.encrypt(plaintext);
    expect(encryptedText).not.toBe(plaintext);
    expect(service.decrypt(encryptedText, iv)).toBe(plaintext);
  };

  it('round-trips using the default fallback key', () => {
    delete process.env.ENCRYPTION_KEY;
    const service = new EncryptionService();
    roundTrip(service, 'super-secret-value');
  });

  it.each([
    ['32-char', 'x'.repeat(32)],
    ['40-char', 'x'.repeat(40)],
    ['64-char hex', 'a'.repeat(64)],
    ['short', 'short-key'],
  ])('round-trips with a %s ENCRYPTION_KEY', (_label, key) => {
    process.env.ENCRYPTION_KEY = key;
    const service = new EncryptionService();
    roundTrip(service, 'secret-value');
  });

  it('refuses to start in production without an ENCRYPTION_KEY', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ENCRYPTION_KEY;
    expect(() => new EncryptionService()).toThrow(/ENCRYPTION_KEY/);
  });
});
