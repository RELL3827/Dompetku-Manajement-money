import { bufferToBase64, base64ToBuffer } from './crypto';

/**
 * Check if the current device/browser supports WebAuthn platform biometrics
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential &&
    typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  ) {
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Register a biometric credential using WebAuthn
 */
export async function registerBiometric(
  userId = 'dompetku-user',
  userName = 'Pengguna DompetKu'
): Promise<string> {
  const isAvailable = await isBiometricAvailable();
  if (!isAvailable) {
    throw new Error('Biometrik tidak didukung atau belum diaktifkan pada perangkat ini.');
  }

  const challenge = window.crypto.getRandomValues(new Uint8Array(32));
  const userHandle = new TextEncoder().encode(userId);

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: 'DompetKu',
      id: window.location.hostname || 'localhost',
    },
    user: {
      id: userHandle,
      name: userName,
      displayName: userName,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' }, // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      requireResidentKey: false,
    },
    timeout: 60000,
    attestation: 'none',
  };

  const credential = (await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions,
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('Pendaftaran biometrik dibatalkan.');
  }

  return bufferToBase64(credential.rawId);
}

/**
 * Verify identity using the registered biometric credential
 */
export async function verifyBiometric(credentialIdBase64: string): Promise<boolean> {
  try {
    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
    const credentialIdBuffer = base64ToBuffer(credentialIdBase64);

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      rpId: window.location.hostname || 'localhost',
      allowCredentials: [
        {
          id: credentialIdBuffer,
          type: 'public-key',
          transports: ['internal'],
        },
      ],
      userVerification: 'required',
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });

    return !!assertion;
  } catch (err: any) {
    console.warn('Biometric verification failed/canceled:', err);
    return false;
  }
}
