import { useEffect, useState } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import { keyStore } from '../crypto/keyStore';
import { encrypt, decrypt } from '../crypto/webCrypto';

export function useEncryption() {
  const { identity } = useInternetIdentity();
  const [isLocked, setIsLocked] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (identity && !identity.getPrincipal().isAnonymous()) {
      const principalId = identity.getPrincipal().toString();
      keyStore.setPrincipal(principalId);
      setIsInitialized(keyStore.isInitialized());
      setIsLocked(keyStore.isLocked());
    } else {
      setIsLocked(true);
      setIsInitialized(false);
    }
  }, [identity]);

  const initializeVault = async (passphrase: string) => {
    await keyStore.initialize(passphrase);
    setIsInitialized(true);
    setIsLocked(false);
  };

  const unlockVault = async (passphrase: string): Promise<boolean> => {
    const success = await keyStore.unlock(passphrase);
    if (success) {
      setIsLocked(false);
    }
    return success;
  };

  const lockVault = () => {
    keyStore.lock();
    setIsLocked(true);
  };

  const encryptText = async (plaintext: string): Promise<string> => {
    const key = keyStore.getKey();
    return encrypt(plaintext, key);
  };

  const decryptText = async (ciphertext: string): Promise<string> => {
    const key = keyStore.getKey();
    return decrypt(ciphertext, key);
  };

  return {
    isLocked,
    isInitialized,
    initializeVault,
    unlockVault,
    lockVault,
    encryptText,
    decryptText,
  };
}
