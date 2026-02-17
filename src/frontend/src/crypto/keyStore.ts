import { deriveKey, generateSalt, arrayBufferToBase64, base64ToArrayBuffer } from './webCrypto';

const STORAGE_KEY_PREFIX = 'caseguard_vault_';

interface VaultData {
  salt: string;
  initialized: boolean;
}

export class KeyStore {
  private key: CryptoKey | null = null;
  private principalId: string | null = null;

  setPrincipal(principalId: string) {
    this.principalId = principalId;
    this.key = null;
  }

  isLocked(): boolean {
    return this.key === null;
  }

  async initialize(passphrase: string): Promise<void> {
    if (!this.principalId) throw new Error('Principal not set');

    const salt = generateSalt();
    const key = await deriveKey(passphrase, salt);

    const vaultData: VaultData = {
      salt: arrayBufferToBase64(salt),
      initialized: true,
    };

    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${this.principalId}`,
      JSON.stringify(vaultData)
    );

    this.key = key;
  }

  async unlock(passphrase: string): Promise<boolean> {
    if (!this.principalId) throw new Error('Principal not set');

    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${this.principalId}`);
    if (!stored) return false;

    const vaultData: VaultData = JSON.parse(stored);
    const salt = base64ToArrayBuffer(vaultData.salt);
    
    try {
      const key = await deriveKey(passphrase, salt);
      this.key = key;
      return true;
    } catch {
      return false;
    }
  }

  lock() {
    this.key = null;
  }

  getKey(): CryptoKey {
    if (!this.key) throw new Error('Vault is locked');
    return this.key;
  }

  isInitialized(): boolean {
    if (!this.principalId) return false;
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${this.principalId}`);
    return !!stored;
  }
}

export const keyStore = new KeyStore();
