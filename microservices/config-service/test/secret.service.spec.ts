import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Secret } from '../src/entities';
import { SecretService } from '../src/modules/secret/secret.service';
import { EncryptionService } from '../src/common/encryption.service';
import { AuditLogService } from '../src/modules/audit/audit-log.service';

describe('SecretService', () => {
  let service: SecretService;

  const secretRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const encryptionService = {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  };

  const auditLogService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    encryptionService.encrypt.mockReturnValue({ encryptedText: 'cipher-text', iv: 'iv-hex' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretService,
        { provide: getRepositoryToken(Secret), useValue: secretRepository },
        { provide: EncryptionService, useValue: encryptionService },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();

    service = module.get<SecretService>(SecretService);
  });

  it('does not define a plaintext `value` column on the entity', () => {
    expect(Object.getOwnPropertyNames(new Secret())).not.toContain('value');
  });

  it('persists only the encrypted form when creating a secret', async () => {
    secretRepository.findOne.mockResolvedValue(null);
    secretRepository.create.mockImplementation((entity) => entity);
    secretRepository.save.mockImplementation(async (entity) => ({ id: 'secret-1', ...entity }));

    await service.createSecret({ name: 'API_KEY', value: 'super-secret' });

    expect(encryptionService.encrypt).toHaveBeenCalledWith('super-secret');
    const persisted = secretRepository.save.mock.calls[0][0];
    expect(secretRepository.save.mock.calls[0][0]).not.toHaveProperty('value');
    expect(persisted.encryptedValue).toBe('cipher-text');
    expect(secretRepository.save.mock.calls[0][0].value).toBeUndefined();
  });

  it('does not persist plaintext when rotating a secret', async () => {
    secretRepository.findOne.mockResolvedValue({
      id: 'secret-1',
      name: 'API_KEY',
      encryptedValue: 'old-cipher',
      iv: 'old-iv',
      rotationCount: 0,
      requiresRotation: false,
    });
    secretRepository.save.mockImplementation((secret: Secret) => secret);

    await service.rotateSecret('secret-1', 'new-plaintext-value');

    const saved = secretRepository.save.mock.calls[0][0];
    expect(saved.encryptedValue).toBe('cipher-text');
    expect(saved.iv).toBe('iv-hex');
    expect((saved as Record<string, unknown>).value).toBeUndefined();
  });

  it('decrypts using an explicit encryptedValue/iv selection', async () => {
    const getOne = jest
      .fn()
      .mockResolvedValue({ id: 'secret-1', encryptedValue: 'cipher-text', iv: 'iv-hex' });
    const where = jest.fn().mockReturnValue({ getOne });
    const addSelect = jest.fn().mockReturnValue({ where });
    secretRepository.createQueryBuilder.mockReturnValue({ addSelect });
    encryptionService.decrypt.mockReturnValue('decrypted');

    await expect(service.getSecretValue('secret-1')).resolves.toBe('decrypted');
    expect(secretRepository.createQueryBuilder).toHaveBeenCalledWith('secret');
    expect(encryptionService.decrypt).toHaveBeenCalledWith('cipher-text', 'iv-hex');
  });
});
