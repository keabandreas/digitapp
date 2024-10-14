// This is a simplified example and should not be used in production without proper security review

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function generateKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptPassword(password: string): Promise<string> {
  const key = await generateKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedPassword = encoder.encode(password);

  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encodedPassword
  );

  const encryptedContentArray = new Uint8Array(encryptedContent);
  const combinedArray = new Uint8Array(iv.length + encryptedContentArray.length);
  combinedArray.set(iv);
  combinedArray.set(encryptedContentArray, iv.length);

  return btoa(String.fromCharCode.apply(null, combinedArray as any));
}

export async function decryptPassword(encryptedPassword: string): Promise<string> {
  const combinedArray = new Uint8Array(atob(encryptedPassword).split('').map(char => char.charCodeAt(0)));
  const iv = combinedArray.slice(0, 12);
  const encryptedContentArray = combinedArray.slice(12);

  const key = await generateKey();

  const decryptedContent = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encryptedContentArray
  );

  return decoder.decode(decryptedContent);
}
