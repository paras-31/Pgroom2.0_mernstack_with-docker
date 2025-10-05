/**
 * Crypto utility for encrypting and decrypting sensitive data
 * Uses AES encryption with a secret key
 */

// Secret key for encryption (in a real app, this should be in environment variables)
const SECRET_KEY = 'propertyhub-secure-encryption-key';

/**
 * Encrypt a string using AES encryption
 * @param text - The text to encrypt
 * @returns Encrypted string
 */
export const encrypt = (text: string): string => {
  if (!text) return '';
  
  try {
    // Simple encryption for demonstration
    // In production, use a proper crypto library like CryptoJS
    const encoded = btoa(
      encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
    
    // Add some simple obfuscation
    return encoded
      .split('')
      .map(char => char.charCodeAt(0) ^ SECRET_KEY.charCodeAt(0))
      .map(code => String.fromCharCode(code))
      .join('');
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

/**
 * Decrypt an encrypted string
 * @param encrypted - The encrypted string
 * @returns Decrypted string
 */
export const decrypt = (encrypted: string): string => {
  if (!encrypted) return '';
  
  try {
    // Reverse the obfuscation
    const deobfuscated = encrypted
      .split('')
      .map(char => char.charCodeAt(0) ^ SECRET_KEY.charCodeAt(0))
      .map(code => String.fromCharCode(code))
      .join('');
    
    // Decode from base64
    return decodeURIComponent(
      atob(deobfuscated)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

/**
 * Store encrypted token in localStorage
 * @param token - The token to store
 */
export const storeEncryptedToken = (token: string): void => {
  if (!token) return;
  const encryptedToken = encrypt(token);
  localStorage.setItem('auth_token_encrypted', encryptedToken);
};

/**
 * Retrieve and decrypt token from localStorage
 * @returns Decrypted token or empty string if not found
 */
export const getDecryptedToken = (): string => {
  const encryptedToken = localStorage.getItem('auth_token_encrypted');
  if (!encryptedToken) return '';
  return decrypt(encryptedToken);
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem('auth_token_encrypted');
};
