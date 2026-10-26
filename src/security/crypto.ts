/**
 * Web Crypto API utilities for PIN hashing (PBKDF2) and AES-GCM backup encryption.
 * 100% offline, zero network requests, cryptographically strong.
 */

// Helper to convert ArrayBuffer to Base64
export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate cryptographically secure random salt
 */
export function generateSalt(length = 16): string {
  const salt = window.crypto.getRandomValues(new Uint8Array(length));
  return bufferToBase64(salt.buffer);
}

/**
 * Hash PIN using PBKDF2 with SHA-256 and 100,000 iterations
 */
export async function hashPin(pin: string, saltBase64: string): Promise<string> {
  const enc = new TextEncoder();
  const pinKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const saltBuffer = base64ToBuffer(saltBase64);

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    pinKey,
    256
  );

  return bufferToBase64(derivedBits);
}

/**
 * Verify PIN against stored hash
 */
export async function verifyPin(pin: string, storedHash: string, saltBase64: string): Promise<boolean> {
  try {
    const computedHash = await hashPin(pin, saltBase64);
    return computedHash === storedHash;
  } catch (err) {
    console.error('Error verifying PIN:', err);
    return false;
  }
}

/**
 * Encrypt a JSON backup payload using AES-GCM with a user-provided password
 */
export async function encryptBackupData(
  plainJsonString: string,
  password: string
): Promise<{ encrypted: true; salt: string; iv: string; data: string }> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Derive AES-GCM key from password via PBKDF2
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 150000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    aesKey,
    enc.encode(plainJsonString)
  );

  return {
    encrypted: true,
    salt: bufferToBase64(salt.buffer),
    iv: bufferToBase64(iv.buffer),
    data: bufferToBase64(ciphertext),
  };
}

/**
 * Decrypt an AES-GCM encrypted backup payload with the user password
 */
export async function decryptBackupData(
  encryptedPayload: { salt: string; iv: string; data: string },
  password: string
): Promise<string> {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const saltBuffer = base64ToBuffer(encryptedPayload.salt);
  const ivBuffer = base64ToBuffer(encryptedPayload.iv);
  const cipherBuffer = base64ToBuffer(encryptedPayload.data);

  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 150000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer,
      },
      aesKey,
      cipherBuffer
    );

    return dec.decode(decryptedBuffer);
  } catch (err) {
    throw new Error('Password salah atau data file korup!');
  }
}
